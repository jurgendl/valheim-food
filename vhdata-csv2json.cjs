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
                    console.log("".concat(header));
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
                var val = row[header]['0'];
                if (val)
                    food.resources[header] = parseInt(val);
            }
            console.log(food);
        })
            .on('end', function () {
            var outputFile = "./valheim-food.json";
            fs.writeFileSync(outputFile, JSON.stringify(data_1));
        });
        /*
        const rows = file.trim().split('\n');
        const header = rows[0].split(',');
        for (let i = 1; i < rows.length; i++) {
            console.log(rows[i]);
            // split row on comma, but ignore commas inside double quotes, do not skip ,,
            const regexArray = rows[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
            console.log(regexArray);
            // convert to array of strings
            const row = regexArray!.slice().map((s) => optionalStr(s))!.slice();
            console.log(row);
            console.log(row[0]);
            console.log(row[1]);
            console.log(row[2]);
            console.log(row[3]);
            console.log(row[4]);
            console.log(row[5]);
            console.log(row[6]);
            console.log(row[7]);
            console.log(row[8]);
            console.log(row[9]);

            const food = new Food();

            // 0 "name"
            food.name = row[0]!;
            data.food[food.name] = food;

            // 1 "T"
            food.tier = parseInt(row[1]);

            // 2 "*"
            food.starred = row[2] === '*';

            // 3 "hp"
            // 4 "hpS"
            const hp = row[3];
            if (hp !== null && hp !== undefined && hp.trim() !== '') {
                food.hp = parseInt(hp);
            }

            // 5 "sta"
            // 6 "staS"
            const stamina = row[5];
            if (stamina !== null && stamina !== undefined && stamina.trim() !== '') {
                food.stamina = parseInt(stamina);
            }

            // 7 "type"
            const type = row[7];
            console.log(row[7], type);
            if (type) if (type.includes(':')) {
                food.type = 'blue';
                food.eitr = parseInt(type.split(':')[1].trim());
            } else {
                if (type == "y") food.type = 'yellow';
                else if (type == "w") food.type = 'white';
                else if (type == "r") food.type = 'red';
                else if (type == "m") food.type = 'mead';
                else throw new Error(`Invalid type ${type}`);
                food.eitr = 0;
            }

            // 8 "hp/s"
            const hpPerSecond = row[8];
            if (hpPerSecond !== null && hpPerSecond !== undefined && hpPerSecond.trim() !== '') {
                food.hpPerSecond = parseInt(hpPerSecond);
            }

            // 9 "m"
            const durationInMinutes = row[9];
            if (durationInMinutes !== null && durationInMinutes !== undefined && durationInMinutes.trim() !== '') {
                if (durationInMinutes.includes(',')) {
                    food.durationInMinutes = parseFloat(durationInMinutes.replace(',', '.'));
                } else if (durationInMinutes.includes('.')) {
                    food.durationInMinutes = parseFloat(durationInMinutes);
                } else {
                    food.durationInMinutes = parseInt(durationInMinutes);
                }
            }

            // 10... "raspberries","honey","neck tail","boar meat","deer meat","fish","greydwarf eye","mushroom","dandelion","coal","blueberries","carrot","yellow mushroom","thistle","turnip","ooze","entrails","bloodbag","serpent meat","onion","wolf meat","freeze gland","cloudberries ","lox meat","barley","egg","chicken meat","magecap ","jotun puffs ","seeker meat ","hare meat","blood clot","sap","royal jelly","anglerfish"
            // eslint-disable-next-line no-constant-condition
            if (false) for (let index = 10; index < row.length; index++) {
                const nr = row[index];
                if (nr !== null) {
                    const resource = header[index].trim();
                    if (nr === null || nr.trim() === '') {
                        // Do nothing
                    } else if (nr.includes(',')) {
                        const c = parseFloat(nr.replace(',', '.'));
                        food.resources[resource] = c;
                    } else if (nr.includes('.')) {
                        const c = parseFloat(nr);
                        food.resources[resource] = c;
                    } else {
                        const c = parseInt(nr);
                        food.resources[resource] = c;
                    }
                }
            }
        }

        const outputFile = `./valheim-food.json`;
        fs.writeFileSync(outputFile, JSON.stringify(data));

        const style = [];
        for (const resources of data.resourceTiers) {
            for (const rrr of resources) {
                style.push(`.tabulator-col[tabulator-field="${rrr}"] .tabulator-col-title::before,`);
            }
        }

        style.push(`noop {
            content: '';
            width: 32px;
            height: 32px;
            background-size: 32px;
        }`);

        for (const resources of data.resourceTiers) {
            for (const rrr of resources) {
                style.push(`.tabulator-col[tabulator-field="${rrr}"] .tabulator-col-title::before {
                    background-image: url('images/${rrr}.png');
                }`);
            }
        }

        const cssFile = `./valheim-food.css`;
        fs.writeFileSync(cssFile, style.join('\n'));

        console.log('Conversion completed successfully.');*/
    }
    catch (ex) {
        console.error('Error during conversion:', ex);
    }
}
// run ts file without compiling
// npm install -g ts-node
// ts-node vhdata-csv2json.ts
convertCSVToJson();
