// npm install -D ts-node typescript
// npx ts-node vhdata-csv2json.ts

/*import * as fs from 'fs';
import csv from 'csv-parser';*/
const fs = require('fs');
const csv = require('csv-parser');

class Food {
	name: string | undefined;
	tier: number | undefined;
	starred: boolean | undefined;
	hp: number | undefined;
	stamina: number | undefined;
	eitr: number | undefined;
	type: string | undefined;
	hpPerSecond: number | undefined;
	durationInMinutes: number | undefined;
	resources: Record<string, number> = {};
}

class VHData {
	tiers: string[] = ["meadows", "black forest", "swamp", "mountain", "plains", "mistlands", "ashlands"];

	resourceTiers: string[][] = [
		"raspberries\thoney\tneck tail\tboar meat\tdeer meat\tfish\tgreydwarf eye\tmushroom\tdandelion\tcoal\tfeathers\tperch".split("\t").map((s) => s.trim()), // 1 meadows
		"blueberries\tcarrot\tyellow mushroom\tthistle\ttrollfish".split("\t").map((s) => s.trim()), // 2 black forest
		"turnip\tooze\tentrails\tbloodbag\tserpent meat\ttoadstool\tcured squirrel hamstring\tfresh seaweed\tpowdered dragon eggshells\tpungent pebbles\tfragrant bundle\tfiery spice powder\therbs of the hidden hills\tgrasslands herbalist harvest\tmountain peak pepper\tseafarer's herbs\twoodland herb blend".split("\t").map((s) => s.trim()), // 3 swamp
		"onion\twolf meat\tfreeze gland".split("\t").map((s) => s.trim()), // 4 mountain
		"cloudberries \tlox meat\tbarley\tgrouper".split("\t").map((s) => s.trim()), // 5 plains
		"egg\tchicken meat\tmagecap \tjotun puffs \tseeker meat \thare meat\tblood clot\tsap\troyal jelly\tanglerfish\tscale hide".split("\t").map((s) => s.trim()), // 6 mistlands
		"fiddlehead\tsmoke puff\tvineberry cluster\tvolture egg\tvolture meat\tasksvin tail\tbonemaw meat".split("\t").map((s) => s.trim()), // 7 ashlands
	];

	food: Record<string, Food> = {};
}

function convertCSVToJson() {
	try {
		console.log('Converting CSV to JSON...');

		const data = new VHData();
		const csvHeaders: string[] = [];
		fs.createReadStream(`./src/valheim-food.csv`).pipe(csv())
			.on('headers', (headers: any) => {
				// Assuming headers are processed here if needed
				let i = 0;
				for (const header of headers) {
					if (i >= 10) {
						//console.log(`${header}`);
						csvHeaders.push(header);
					}
					i++;
				}
			})
			.on('data', (row: any) => {
				//console.log(row);

				const food = new Food();

				// 0 "name"
				food.name = row.name;
				data.food[food.name!] = food;

				// 1 "T"
				food.tier = parseInt(row.T);

				// 2 "*"
				food.starred = row['*'] === '*';

				// 3 "hp"
				// 4 "hpS"
				const hp = row.hp;
				if (hp !== null && hp !== undefined && hp.trim() !== '') {
					food.hp = parseInt(hp);
				}

				// 5 "sta"
				// 6 "staS"
				const stamina = row.sta;
				if (stamina !== null && stamina !== undefined && stamina.trim() !== '') {
					food.stamina = parseInt(stamina);
				}

				// 7 "type"
				const type = row.type
				if (type.includes(':')) {
					food.type = 'blue';
					food.eitr = parseInt(type.split(':')[1].trim());
				} else {
					if (type == "y") food.type = 'yellow';
					else if (type == "w") food.type = 'white';
					else if (type == "r") food.type = 'red';
					else if (type == "m") food.type = 'mead';
					else if (type == "f") food.type = 'feast';
					else throw new Error(`Invalid type ${type}`);
					food.eitr = 0;
				}

				// 8 "hp/s"
				const hpPerSecond = row['hp/s'];
				if (hpPerSecond !== null && hpPerSecond !== undefined && hpPerSecond.trim() !== '') {
					food.hpPerSecond = parseInt(hpPerSecond);
				}

				// 9 "m"
				const durationInMinutes = row.m;
				if (durationInMinutes !== null && durationInMinutes !== undefined && durationInMinutes.trim() !== '') {
					if (durationInMinutes.includes(',')) {
						food.durationInMinutes = parseFloat(durationInMinutes.replace(',', '.'));
					} else if (durationInMinutes.includes('.')) {
						food.durationInMinutes = parseFloat(durationInMinutes);
					} else {
						food.durationInMinutes = parseInt(durationInMinutes);
					}
				}

				data.food[food.name!] = food;

				for (const header of csvHeaders) {
					let val = `${row[header]}`;
					if (val && val.trim() !== '') {
						if (val.toString().includes(',')) {
							val = val.toString().replace(',', '.');
						}
						food.resources[header] = parseFloat(val);
					}
				}
				//console.log(food);
			})
			.on('end', () => {
				const outputFile = `./src/assets/valheim-food.json`;
				fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
				console.log('Conversion completed successfully.');
			});
	} catch (ex) {
		console.error('Error during conversion:', ex);
	}
}

convertCSVToJson();
