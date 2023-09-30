"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var csv_parser_1 = __importDefault(require("csv-parser"));
var Food = /** @class */ (function () {
    function Food() {
        this.resources = {};
    }
    return Food;
}());
var VHData = /** @class */ (function () {
    function VHData() {
        this.tiers = ["meadows", "black forest", "swamp", "mountain", "plains", "mistlands"];
        this.resourceTiers = [
            "raspberries\thoney\tneck tail\tboar meat\tdeer meat\tfish\tgreydwarf eye\tmushroom\tdandelion\tcoal".split("\t").map(function (s) { return s.trim(); }),
            "blueberries\tcarrot\tyellow mushroom\tthistle".split("\t").map(function (s) { return s.trim(); }),
            "turnip\tooze\tentrails\tbloodbag\tserpent meat".split("\t").map(function (s) { return s.trim(); }),
            "onion\twolf meat\tfreeze gland".split("\t").map(function (s) { return s.trim(); }),
            "cloudberries \tlox meat\tbarley".split("\t").map(function (s) { return s.trim(); }),
            "egg\tchicken meat\tmagecap \tjotun puffs \tseeker meat \thare meat\tblood clot\tsap\troyal jelly\tanglerfish".split("\t").map(function (s) { return s.trim(); }), // 6 mistlands
        ];
        this.food = {};
    }
    return VHData;
}());
function convertCSVToJson() {
    try {
        console.log('Converting CSV to JSON...');
        var data_1 = new VHData();
        var csvHeaders_1 = [];
        fs.createReadStream("./src/valheim-food.csv").pipe((0, csv_parser_1.default)())
            .on('headers', function (headers) {
            // Assuming headers are processed here if needed
            var i = 0;
            for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
                var header = headers_1[_i];
                if (i >= 10) {
                    //console.log(`${header}`);
                    csvHeaders_1.push(header);
                }
                i++;
            }
        })
            .on('data', function (row) {
            //console.log(row);
            var food = new Food();
            // 0 "name"
            food.name = row.name;
            data_1.food[food.name] = food;
            // 1 "T"
            food.tier = parseInt(row.T);
            // 2 "*"
            food.starred = row['*'] === '*';
            // 3 "hp"
            // 4 "hpS"
            var hp = row.hp;
            if (hp !== null && hp !== undefined && hp.trim() !== '') {
                food.hp = parseInt(hp);
            }
            // 5 "sta"
            // 6 "staS"
            var stamina = row.sta;
            if (stamina !== null && stamina !== undefined && stamina.trim() !== '') {
                food.stamina = parseInt(stamina);
            }
            // 7 "type"
            var type = row.type;
            if (type.includes(':')) {
                food.type = 'blue';
                food.eitr = parseInt(type.split(':')[1].trim());
            }
            else {
                if (type == "y")
                    food.type = 'yellow';
                else if (type == "w")
                    food.type = 'white';
                else if (type == "r")
                    food.type = 'red';
                else if (type == "m")
                    food.type = 'mead';
                else
                    throw new Error("Invalid type ".concat(type));
                food.eitr = 0;
            }
            // 8 "hp/s"
            var hpPerSecond = row['hp/s'];
            if (hpPerSecond !== null && hpPerSecond !== undefined && hpPerSecond.trim() !== '') {
                food.hpPerSecond = parseInt(hpPerSecond);
            }
            // 9 "m"
            var durationInMinutes = row.m;
            if (durationInMinutes !== null && durationInMinutes !== undefined && durationInMinutes.trim() !== '') {
                if (durationInMinutes.includes(',')) {
                    food.durationInMinutes = parseFloat(durationInMinutes.replace(',', '.'));
                }
                else if (durationInMinutes.includes('.')) {
                    food.durationInMinutes = parseFloat(durationInMinutes);
                }
                else {
                    food.durationInMinutes = parseInt(durationInMinutes);
                }
            }
            data_1.food[food.name] = food;
            for (var _i = 0, csvHeaders_2 = csvHeaders_1; _i < csvHeaders_2.length; _i++) {
                var header = csvHeaders_2[_i];
                var val = "".concat(row[header]);
                if (val && val.trim() !== '') {
                    if (val.toString().includes(',')) {
                        val = val.toString().replace(',', '.');
                    }
                    food.resources[header] = parseFloat(val);
                }
            }
            //console.log(food);
        })
            .on('end', function () {
            var outputFile = "./src/assets/valheim-food.json";
            fs.writeFileSync(outputFile, JSON.stringify(data_1, null, 2));
            console.log('Conversion completed successfully.');
        });
    }
    catch (ex) {
        console.error('Error during conversion:', ex);
    }
}
convertCSVToJson();
