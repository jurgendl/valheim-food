// npm install --save-dev @types/jquery
// npm install tabulator-tables --save
// npm i --save-dev @types/tabulator-tables

import {
	CellComponent,
	ColumnDefinition,
	Filter,
	Options,
	RowComponent,
	TabulatorFull as Tabulator
} from 'tabulator-tables';


type Tier = 1 | 2 | 3 | 4 | 5 | 6;
type FoodTypeType = 'R' | 'Y' | 'W' | 'B' | 'M';

export enum FoodType {
	yellow = "yellow",
	red = "red",
	white = "white",
	blue = "blue",
	mead = "mead"
}

export interface Food {
	"name": string;
	"tier": Tier;
	"starred": boolean;
	"hp": number;
	"stamina": number;
	"eitr": number;
	"type": FoodType;
	"hpPerSecond": number;
	"durationInMinutes": number;
	"resources": { [key: string]: number };
}

export interface ValheimFood {
	tiers: string[];
	resourceTiers: string[][];
	food: { [key: string]: Food };
}

export interface FoodRow {
	id: number;
	name: string;
	tier: Tier;
	starred: boolean;
	hp: number;
	stamina: number;
	eitr: number;
	type: FoodTypeType;
	hpPerSecond: number;
	durationInMinutes: number;
}

// noinspection TypeScriptUnresolvedFunction
export class Component {
	version = '1.5';

	localStorageJsonName = "valheim-food";

	localStorageVersionName = "valheim-food-version";

	jsonUrl = 'assets/valheim-food.json?v=' + this.version;

	tierColors = new Map<number, string>([
		[1, '#f7f781'],//meadows
		[2, '#bbe33d'],//dark forest
		[3, '#b4c7dc'],//swamp
		[4, '#dddddd'],//mountains
		[5, '#ffdbb6'],//plains
		[6, '#ffc2c2'],//mistlands
	]);

	resources: string[] = [];

	tabledata: FoodRow/*(Row & { [key: string]: (number | string) })*/ [] = [];

	resourceCols: ColumnDefinition[] = [];

	table!: Tabulator;

	init(): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		($('.selectpicker') as any).selectpicker();

		try {
			const localStorageJsonNameValue = window.localStorage.getItem(this.localStorageJsonName);
			const localStorageVersionNameValue = window.localStorage.getItem(this.localStorageVersionName);
			if (localStorageJsonNameValue && localStorageVersionNameValue == this.version) {
				const __data: ValheimFood = JSON.parse(localStorageJsonNameValue);
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const test = __data.resourceTiers;
				this.app(__data);
			} else {
				this.fetchDataAgain();
			}
		} catch (e) {
			console.error(e);
			this.fetchDataAgain();
		}
	}

	fetchDataAgain(): void {
		fetch(this.jsonUrl)
			.then((response: Response) => response.json() as Promise<ValheimFood>)
			.then((valheimFood: ValheimFood) => this.app(valheimFood));
	}

	app(valheimFood: ValheimFood): void {
		console.log(valheimFood);
		window.localStorage.setItem(this.localStorageJsonName, JSON.stringify(valheimFood));
		window.localStorage.setItem(this.localStorageVersionName, this.version);
		this.buildResources(valheimFood);
		this.buildResourceCols(valheimFood);
		this.buildResourceChecks(valheimFood);
		this.buildTableDate(valheimFood);
		this.buildTableFilters(valheimFood);
		this.buildTable(valheimFood);
		this.buildDataReset(valheimFood);
		this.buildResourceStyles(valheimFood);
	}

	buildResources(valheimFood: ValheimFood) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		valheimFood.resourceTiers.forEach((resourceTier: string[], i: number) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			resourceTier.forEach((resourceTierResource: string, ii: number) => {
				this.resources.push(resourceTierResource);
			});
		});
	}

	buildResourceCols(valheimFood: ValheimFood) {
		for (const resource of this.resources) {
			let colorClass = '';
			valheimFood.resourceTiers.forEach((resourceTier: string[], i: number) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				resourceTier.forEach((resourceTierResource: string, ii: number) => {
					if (resource == resourceTierResource) {
						colorClass = valheimFood.tiers[i];
					}
				});
			});
			this.resourceCols.push({
				"title": resource,
				"field": resource,
				"sorter": "number",
				"headerVertical": true,
				"hozAlign": "center",
				"cssClass": colorClass.replace(' ', '-')
			});
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	buildResourceChecks(valheimFood: ValheimFood) {
		for (const resource of this.resources) {
			const fixedName = resource.replace(' ', '_');
			const template = '<div class="col-2"><div style="width:unset;display:inline;" class="imgcheck input-group input-group-sm"><label class="checkbox-inline" for="check_' + fixedName + '"><input checked="checked" value="' + resource + '" style="display: none;" type="checkbox" id="check_' + fixedName + '"><img id="is_' + fixedName + '" width="32" height="32" src="assets/images/' + resource + '.png">&nbsp;<span style="font-size:11px" id="lbl_' + fixedName + '">' + resource + '</span></label></div></div>'
			//
			$('#resourceChecks').append(template);
			//
			$('#check_' + fixedName).click(() => {
				if (resource) {
					const checked = $(this).is(':checked');
					const style: HTMLStyleElement = <HTMLStyleElement>document.getElementById("style-" + resource);
					style.disabled = checked;
				}
			});
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	buildResourceStyles(valheimFood: ValheimFood) {
		for (const resource of this.resources) {
			const style: HTMLStyleElement = document.createElement("style");
			style.id = "style-" + resource;
			style.innerHTML = "[tabulator-field='" + resource + "'] { display: none !important; }";
			document.body.appendChild(style);
			style.disabled = true;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	buildTableDate(valheimFood: ValheimFood) {
		let foodId = 0;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const [name, food] of Object.entries(valheimFood.food)) {
			let ft: FoodTypeType;
			switch (food.type) {
				case FoodType.mead:
					ft = 'M';
					break;
				case FoodType.blue:
					ft = 'B';
					break;
				case FoodType.red:
					ft = 'R';
					break;
				case FoodType.white:
					ft = 'W';
					break;
				case FoodType.yellow:
					ft = 'Y';
					break;
			}
			const row: FoodRow = {
				id: foodId,
				name: food.name,
				tier: food.tier,
				starred: food.starred,// ? '???' : '',
				hp: food.hp ? food.hp : 0,
				stamina: food.stamina ? food.stamina : 0,
				eitr: food.eitr ? food.eitr : 0,
				type: ft,
				hpPerSecond: food.hpPerSecond ? food.hpPerSecond : 0,
				durationInMinutes: food.durationInMinutes ? food.durationInMinutes : 0
			};
			foodId++;
			for (const resource /* string*/ of this.resources) {
				const count = food.resources[resource];
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(row as any)[resource] = count ? String(count) : '';
			}
			this.tabledata.push(row);
		}
	}

	buildTableFilters(valheimFood: ValheimFood) {
		const nameFilter: JQuery<HTMLElement> = $('#filter-name');
		const tierFilter: JQuery<HTMLElement> = $('#filter-tier');
		const starredFilter: JQuery<HTMLElement> = $('#filter-starred');
		const typeFilter: JQuery<HTMLElement> = $('#filter-type');
		const hpFilter: JQuery<HTMLElement> = $('#filter-hp');
		const staminaFilter: JQuery<HTMLElement> = $('#filter-stamina');
		const eitrFilter: JQuery<HTMLElement> = $('#filter-eitr');
		const hpsFilter: JQuery<HTMLElement> = $('#filter-hps');
		const durationFilter: JQuery<HTMLInputElement> = $('#filter-duration');

		//
		const clearFiltering = () => {
			//
			this.table.clearFilter(true);
			//
			for (let i = 0; i < Object.keys(valheimFood.food).length; i++) {
				this.table.deselectRow(i);
			}
			//
			$('#totalPoints').val('');
			//
			for (const resource of this.resources) {
				$("#check_" + resource.replace(' ', '_')).prop('checked', true);
			}
		}

		//
		const updateFilter = () => {
			clearFiltering();
			//
			const filters: Filter[] = [];
			//
			const nameFilterVal: string = nameFilter.val() as string;
			if (nameFilterVal && nameFilterVal.length > 0) {
				const colFilters: Filter[] = nameFilterVal.split(',').map((x: string) => x.trim())
					.map((x: string) => {
						return {"field": "name", "type": "like", "value": x};
					});
				colFilters.forEach(colFilter => filters.push(colFilter));
			}
			const tierFilterVal: string[] = tierFilter.val() as string[];
			if (tierFilterVal && tierFilterVal.length > 0) {
				filters.push({
					field: "tier", type: "in", value: tierFilterVal.map((str: string) => parseInt(str))
				});
			}
			const starredFilterVal: string[] = starredFilter.val() as string[];
			if (starredFilterVal && starredFilterVal.length == 1) {
				if (starredFilterVal[0] == "y") {
					filters.push({field: "starred", type: "=", value: true});
				} else {
					filters.push({field: "starred", type: "=", value: false});
				}
			}
			const hpFilterVal: string = hpFilter.val() as string;
			if (hpFilterVal && hpFilterVal.length > 0) {
				filters.push({field: "hp", type: ">=", value: hpFilterVal});
			}
			const staminaFilterVal: string = staminaFilter.val() as string;
			if (staminaFilterVal && staminaFilterVal.length > 0) {
				filters.push({field: "stamina", type: ">=", value: staminaFilterVal});
			}
			const eitrFilterVal: string = eitrFilter.val() as string;
			if (eitrFilterVal && eitrFilterVal.length > 0) {
				filters.push({field: "eitr", type: ">=", value: eitrFilterVal});
			}
			const typeFilterVal: string[] = typeFilter.val() as string[];
			if (typeFilterVal && typeFilterVal.length > 0) {
				filters.push({field: "type", type: "in", value: typeFilterVal});
			}
			const hpsFilterVal: string = hpsFilter.val() as string;
			if (hpsFilterVal && hpsFilterVal.length > 0) {
				filters.push({field: "hpPerSecond", type: ">=", value: hpsFilterVal});
			}
			const durationFilterVal: string = durationFilter.val() as string;
			if (durationFilterVal && durationFilterVal.length > 0) {
				filters.push({field: "durationInMinutes", type: ">=", value: durationFilterVal});
			}
			if (filters.length > 0) {
				this.table.setFilter(filters);
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(<HTMLButtonElement>document.getElementById("filter")).addEventListener("click", (event: MouseEvent) => {
			updateFilter();
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(<HTMLButtonElement>document.getElementById("filter-clear")).addEventListener("click", (event: MouseEvent) => {
			nameFilter.val('');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(tierFilter as any).selectpicker('val', ['1', '2', '3', '4', '5', '6']);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(starredFilter as any).selectpicker('val', ['y', 'n']);
			hpFilter.val('');
			staminaFilter.val('');
			eitrFilter.val('');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(typeFilter as any).selectpicker('val', ['W', 'Y', 'R', 'B', 'M']);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(hpsFilter as any).selectpicker('val', '');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(durationFilter as any).selectpicker('val', '');
			//
			clearFiltering();
		});
	}

	buildTable(valheimFood: ValheimFood) {
		const columDefs: ColumnDefinition[] = [];
		columDefs.push({
			title: "Name",
			field: "name",
			frozen: true,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			formatter: (cell: CellComponent, formatterParams: object) => {
				const foodRow: FoodRow = cell.getData() as FoodRow;
				const cellValue: number = cell.getValue();
				const color: string | undefined = this.tierColors.get(foodRow.tier);
				let tooltip = cellValue + ":";
				const food: Food | undefined = valheimFood.food[cellValue];
				if (food) {
					for (const [n, c] of Object.entries(food.resources)) {
						if (tooltip == "") {
							tooltip = tooltip + c + " " + n;
						} else {
							tooltip = tooltip + "\n" + c + " " + n;
						}
					}
				}
				return '<div style="background-color:' + color + '" title="' + tooltip + '"><img width=32 height=32 src="assets/images/' + cellValue + '.png">&nbsp;' + cellValue + '</div>';
			}
		});
		const infoGroupColumDef: ColumnDefinition = {//create column group
			title: "Info",
			frozen: true,
			columns: []
		};
		infoGroupColumDef.columns?.push({
			title: "Tier",
			field: "tier",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center",
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			formatter: (cell: CellComponent, formatterParams: object) => {
				const foodRow: FoodRow = cell.getData() as FoodRow;
				const cellValue: number = cell.getValue();
				return "<span style='background-color:" + this.tierColors.get(foodRow.tier) + ";display:block;width:100%;height:100%' title='" + cellValue + "'>" + cellValue + "</span>";
			}
		});
		infoGroupColumDef.columns?.push({
			title: "Starred",
			field: "starred",
			sorter: "boolean",
			headerVertical: true,
			hozAlign: "center",
			formatter: "tickCross"
		});
		infoGroupColumDef.columns?.push({
			title: "HP",
			field: "hp",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center"
		});
		infoGroupColumDef.columns?.push({
			title: "Stamina",
			field: "stamina",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center"
		});
		infoGroupColumDef.columns?.push({
			title: "Eitr",
			field: "eitr",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center"
		});
		infoGroupColumDef.columns?.push({
			title: "Type",
			field: "type",
			headerVertical: true,
			hozAlign: "center",
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			formatter: (cell: CellComponent, formatterParams: object) => {
				const cellValue: string = cell.getValue();
				if (cellValue == "Y") {
					return "<span title='yellow' style='background-color:#ffff84;display:block;width:100%;height:100%'>Y</span>";
				} else if (cellValue == "R") {
					return "<span title='red' style='background-color:#ffc2c2;display:block;width:100%;height:100%'>R</span>";
				} else if (cellValue == "B") {
					return "<span title='blue' style='background-color:#b4c7dc;display:block;width:100%;height:100%'>B</span>";
				} else if (cellValue == "W") {
					return "<span title='white' style='background-color:#dddddd;display:block;width:100%;height:100%'>W</span>";
				} else if (cellValue == "M") {
					return "<span title='mead' style='background-color:#ffdbb6;display:block;width:100%;height:100%'>M</span>";
				} else {
					return cellValue;
				}
			}
		});
		infoGroupColumDef.columns?.push({
			title: "HP/s",
			field: "hpPerSecond",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center"
		});
		infoGroupColumDef.columns?.push({
			title: "Duration (m)",
			field: "durationInMinutes",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center"
		});
		infoGroupColumDef.columns?.push({
			title: "Score",
			field: "score",
			sorter: "number",
			headerVertical: true,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			mutator: (cellValue: number, foodRow: FoodRow, type: 'data' | 'edit', params: object, component: CellComponent | undefined) => {
				const score = (foodRow.hp + foodRow.stamina + foodRow.eitr) * foodRow.durationInMinutes;
				return score ? score : 0;
			}
		});
		columDefs.push(infoGroupColumDef);

		columDefs.push({//create column group
			title: "Resources",
			columns: this.resourceCols
		});

		const options: Options = {
			//placeholder: "Awaiting Data",
			height: '700', // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
			data: this.tabledata, //assign data to table
			//layout: "fitColumns", //fit columns to width of table (optional)
			//layout: "fitDataTable",
			layoutColumnsOnNewData: true,
			// responsiveLayout:"hide", // hide rows that no longer fit
			// responsiveLayout:"collapse", // collapse columns that no longer fit on the table into a list under the row
			resizableRows: false, // this option takes a boolean value (default = false)
			selectable: true, //make rows selectable
			columns: columDefs,
		};
		this.table = new Tabulator("#valheim-food-table", options);
		//
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.table.on("rowSelectionChanged", (data: object[], rows: RowComponent[]) => {
			if (rows.length == 0) {
				$('#totalPoints').val('');
			} else if (rows.length > 3) {
				$('#totalPoints').val('TOO MANY ROWS SELECTED');
			} else {
				let totalHP = 0;
				let totalStamina = 0;
				let totalEitr = 0;
				let totalHPs = 0;
				let totalScore = 0;
				const dur: number[] = [];
				for (const row of rows) {
					const foodRow: FoodRow = row.getData();
					totalHP += foodRow.hp;
					totalStamina += foodRow.stamina;
					totalEitr += foodRow.eitr;
					totalHPs += foodRow.hpPerSecond;
					dur.push(foodRow.durationInMinutes);
					const totalScoreTmp = (foodRow.hp + foodRow.stamina + foodRow.eitr) * foodRow.durationInMinutes;
					if (totalScoreTmp) {
						totalScore += totalScoreTmp;
					}
				}
				const min = Math.min.apply(null, dur);
				const max = Math.max.apply(null, dur);
				console.log(dur, min, max);
				$('#totalPoints').val('SELECTED TOTAL: HP=' + totalHP + ' +' + totalHPs + '/s, Stamina=' + totalStamina + ', Eitr=' + totalEitr + ' [' + min + ((min == max) ? '' : ('-' + max)) + 'm] > ' + totalScore + ' score');
			}
		});
		//
		this.table.on("dataFiltered", (filters: Filter[], rows: RowComponent[]) => {
			//filters - array of filters currently applied
			//rows - array of row components that pass the filters
			for (const resource of this.resources) {
				(<HTMLStyleElement>document.getElementById("style-" + resource)).disabled = true;
			}
			if (filters.length > 0) {
				const keep: string[] = [];
				for (const row /* RowComponent */ of rows) {
					const foodRow: FoodRow = row.getData();
					for (const resource /* string */ of this.resources) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						if ((foodRow as any)[resource]) {
							keep.push(resource);
						}
					}
				}
				for (const resource /* string */ of this.resources) {
					const styleTagDisabled: boolean = keep.indexOf(resource) != -1;
					$('#check_' + resource.replace(' ', '_')).prop('checked', styleTagDisabled);
					(<HTMLStyleElement>document.getElementById("style-" + resource)).disabled = styleTagDisabled;
				}
			}
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	buildDataReset(valheimFood: ValheimFood) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(<HTMLButtonElement>document.getElementById("json-clear")).addEventListener("click", (event: MouseEvent) => {
			window.localStorage.removeItem(this.localStorageJsonName);
			window.localStorage.removeItem(this.localStorageVersionName);
			location.reload();
		});
	}
}
