//  npm install --save-dev @types/jquery
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


export enum FoodType {
	yellow = "yellow",
	red = "red",
	white = "white",
	blue = "blue"
}

export interface Food {
	"id": number;
	"name": string;
	"tier": 1 | 2 | 3 | 4 | 5 | 6;
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
	headers: string[];
	tiers: string[];
	resourceTiers: string[][];
	food: { [key: string]: Food };
}

export interface FoodRow {
	id: number;
	name: string;
	tier: 1 | 2 | 3 | 4 | 5 | 6;
	starred: boolean;
	hp: number;
	stamina: number;
	eitr: number;
	type: 'R' | 'Y' | 'W' | 'B';
	hpPerSecond: number;
	durationInMinutes: number;
}

// noinspection TypeScriptUnresolvedFunction
export class Component {
	version = '1.2';

	localStorageJsonName = "valheim-food";

	localStorageVersionName = "valheim-food-version";

	tierColors = new Map<number, string>([
		[1, '#f7f781'],
		[2, '#bbe33d'],
		[3, '#b4c7dc'],
		[4, '#dddddd'],
		[5, '#ffdbb6'],
		[6, '#ffc2c2'],
	]);

	resources: string[] = [];

	tabledata: FoodRow/*(Row & { [key: string]: (number | string) })*/ [] = [];

	resourceCols: ColumnDefinition[] = [];

	table!: Tabulator;

	init(): void {
		($('.selectpicker') as any).selectpicker();

		try {
			const localStorageJsonNameValue = window.localStorage.getItem(this.localStorageJsonName);
			const localStorageVersionNameValue = window.localStorage.getItem(this.localStorageVersionName);
			if (localStorageJsonNameValue && localStorageVersionNameValue == this.version) {
				const __data = JSON.parse(localStorageJsonNameValue);
				const test = __data.headers;
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
		fetch('assets/valheim-food.json')
			.then((response: Response) => response.json() as Promise<ValheimFood>)
			.then(d => {
				this.app(d);
			});
	}

	app($$data: ValheimFood): void {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		console.log($$data);
		window.localStorage.setItem(this.localStorageJsonName, JSON.stringify($$data));
		window.localStorage.setItem(this.localStorageVersionName, this.version);
		this.buildResources($$data);
		this.buildResourceCols($$data);
		this.buildResourceChecks($$data);
		//$(function () {
		//setTimeout(() => {

		//}, 3 * 1000);
		//});
		this.buildTableDate($$data);
		this.buildTableFilters($$data);
		this.buildTable($$data);
		this.buildDataReset($$data);
		this.buildResourceStyles($$data);
	}

	buildResources(data: ValheimFood) {
		for (const resourceTier of data.resourceTiers) {
			for (const _resource of resourceTier) {
				this.resources.push(_resource);
			}
		}
	}

	buildResourceCols(data: ValheimFood) {
		for (const resource of this.resources) {
			let colorClass = '';
			data.resourceTiers.forEach((resourceTier, i) => {
				for (const rt of resourceTier) {
					if (resource == rt) {
						colorClass = data.tiers[i];
					}
				}
			});
			if (colorClass == '') {
				data.resourceTiers.forEach((resourceTier, i) => {
					for (const rt of resourceTier) {
						if (resource == rt) {
							colorClass = data.tiers[i];
						}
					}
				});
			}
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

	buildResourceChecks(data: ValheimFood) {
		for (const resource of this.resources) {
			const fixedName = resource.replace(' ', '_');
			const template = '<div class="col-2"><div style="width:unset;display:inline;" class="imgcheck input-group input-group-sm"><label class="checkbox-inline" for="check_' + fixedName + '"><input checked="checked" value="' + resource + '" style="display: none;" type="checkbox" id="check_' + fixedName + '"><img id="is_' + fixedName + '" width="32" height="32" src="assets/images/' + resource + '.png">&nbsp;<span style="font-size:11px" id="lbl_' + fixedName + '">' + resource + '</span></label></div></div>'
			//
			$('#resourceChecks').append(template);
			//
			$('#check_' + fixedName).click(() => {
				if (resource) {
					const checked = $(this).is(':checked');
					(document.getElementById("style-" + resource) as any).disabled = checked;
				}
			});
		}
	}

	buildResourceStyles(data: ValheimFood) {
		for (const resource of this.resources) {
			const style = document.createElement("style");
			style.id = "style-" + resource;
			style.innerHTML = "[tabulator-field='" + resource + "'] { display: none !important; }";
			document.body.appendChild(style);
			(document.getElementById("style-" + resource) as any).disabled = true;
		}
	}

	buildTableDate(data: ValheimFood) {
		for (const [name, food] of Object.entries(data.food)) {
			let ft: 'R' | 'Y' | 'W' | 'B';
			switch (food.type) {
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
				id: food.id,
				name: food.name,
				tier: food.tier,
				starred: food.starred,// ? '★' : '',
				hp: food.hp,
				stamina: food.stamina,
				eitr: food.eitr,
				type: ft,
				hpPerSecond: food.hpPerSecond,
				durationInMinutes: food.durationInMinutes
			};
			for (const resource /* string*/ of this.resources) {
				//const fr: any = food.resources/* { [key: string]: number } */[resource];
				const count = food.resources[resource];
				(row as any)[resource] = count ? String(count) : '';
			}
			this.tabledata.push(row);
		}
	}

	buildTableFilters(data: ValheimFood) {
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
			for (let i = 0; i < Object.keys(data.food).length; i++) {
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

		//
		document.getElementById("filter")?.addEventListener("click", (event: MouseEvent) => {
			updateFilter();
		});

		//
		document.getElementById("filter-clear")?.addEventListener("click", (event: MouseEvent) => {
			nameFilter.val('');
			(tierFilter as any).selectpicker('val', ['1', '2', '3', '4', '5', '6']);
			(starredFilter as any).selectpicker('val', ['y', 'n']);
			hpFilter.val('');
			staminaFilter.val('');
			eitrFilter.val('');
			(typeFilter as any).selectpicker('val', ['W', 'Y', 'R', 'B']);
			(hpsFilter as any).selectpicker('val', '');
			(durationFilter as any).selectpicker('val', '');
			//
			clearFiltering();
		});
	}

	buildTable(data: ValheimFood) {
		const columDefs: ColumnDefinition[] = [];
		columDefs.push({
			title: "Name",
			field: "name",
			frozen: true,
			/*headerFilter: "input",*/
			formatter: (cell: CellComponent, formatterParams: any) => {
				const dat: FoodRow = cell.getData() as FoodRow;
				const value: number = cell.getValue();
				const color: string | undefined = this.tierColors.get(dat.tier);
				let tt = "";
				const food: Food | undefined = data.food[value];
				if (food) {
					for (const [n, c] of Object.entries(food.resources)) {
						if (tt == "") {
							tt = tt + c + " " + n;
						} else {
							tt = tt + "\n" + c + " " + n;
						}
					}
				}
				return '<div style="background-color:' + color + '" title="' + tt + '"><img width=32 height=32 src="assets/images/' + value + '.png">&nbsp;' + value + '</div>';
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
			/* headerFilter: "list",*/
			/* headerFilterParams: { valuesLookup: true, clearable: true }, */
			formatter: (cell: CellComponent, formatterParams: any) => {
				const dat: FoodRow = cell.getData() as FoodRow;
				const value: number = cell.getValue();
				return "<span style='background-color:" + this.tierColors.get(dat.tier) + ";display:block;width:100%;height:100%' title='meadows'>" + value + "</span>";
			}
		});
		infoGroupColumDef.columns?.push({
			title: "Starred",
			field: "starred",
			sorter: "boolean",
			headerVertical: true,
			hozAlign: "center",
			formatter: "tickCross"
			/* headerFilter: "tickCross",*/
			/* headerFilterParams: { "tristate": true }*/
		});
		infoGroupColumDef.columns?.push({
			title: "HP",
			field: "hp",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center"
			/* headerFilter: "number" */
		});
		infoGroupColumDef.columns?.push({
			title: "Stamina",
			field: "stamina",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center"
			/* headerFilter: "number"*/
		});
		infoGroupColumDef.columns?.push({
			title: "Eitr",
			field: "eitr",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center"
			/* headerFilter: "number"*/
		});
		infoGroupColumDef.columns?.push({
			title: "Type",
			field: "type",
			headerVertical: true,
			hozAlign: "center",
			/* headerFilter: "list",*/
			/* headerFilterParams: { valuesLookup: true, clearable: true },*/
			formatter: (cell: CellComponent, formatterParams: any) => {
				const value: string = cell.getValue();
				if (value == "Y") {
					return "<span title='yellow' style='background-color:#ffff84;display:block;width:100%;height:100%'>Y</span>";
				} else if (value == "R") {
					return "<span title='red' style='background-color:#ffc2c2;display:block;width:100%;height:100%'>R</span>";
				} else if (value == "B") {
					return "<span title='blue' style='background-color:#b4c7dc;display:block;width:100%;height:100%'>B</span>";
				} else if (value == "W") {
					return "<span title='white' style='background-color:#ddd;display:block;width:100%;height:100%'>W</span>";
				} else {
					return value;
				}
			}
		});
		infoGroupColumDef.columns?.push({
			title: "HP/s",
			field: "hpPerSecond",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center"
			/* headerFilter: "list",*/
			/* headerFilterParams: { valuesLookup: true, clearable: true }*/
		});
		infoGroupColumDef.columns?.push({
			title: "Duration (m)",
			field: "durationInMinutes",
			sorter: "number",
			headerVertical: true,
			hozAlign: "center"
			/* headerFilter: "number" */
		});
		infoGroupColumDef.columns?.push({
			title: "Score",
			field: "score",
			sorter: "number",
			headerVertical: true,
			mutator: (value: number, dat: Food, type: 'data' | 'edit', params: any, component: CellComponent | undefined) => {
				const score = (dat.hp + dat.stamina + dat.eitr) * dat.durationInMinutes;
				return score;
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
			//layoutColumnsOnNewData: true,
			// responsiveLayout:"hide", // hide rows that no longer fit
			// responsiveLayout:"collapse", // collapse columns that no longer fit on the table into a list under the row
			//resizableRows: true, // this option takes a boolean value (default = false)
			selectable: true, //make rows selectable
			columns: columDefs,
		};
		this.table = new Tabulator("#valheim-food-table", options);
		//
		//const callBack: (data: any[], rows: RowComponent[]) => void = (data, rows) => {/**/};
		//this.table.on("rowSelectionChanged", callBack);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.table.on("rowSelectionChanged", (data: any[], rows: RowComponent[]) => {
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
					const dat: FoodRow = row.getData();
					totalHP += dat.hp;
					totalStamina += dat.stamina;
					totalEitr += dat.eitr;
					totalHPs += dat.hpPerSecond;
					dur.push(dat.durationInMinutes);
					totalScore += (dat.hp + dat.stamina + dat.eitr) * dat.durationInMinutes;
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
				(document.getElementById("style-" + resource) as any).disabled = true;
			}
			if (filters.length > 0) {
				const keep: string[] = [];
				for (const row /* RowComponent */ of rows) {
					const dat: FoodRow = row.getData();
					for (const resource /* string */ of this.resources) {
						if ((dat as any)[resource]) {
							keep.push(resource);
						}
					}
				}
				for (const resource /* string */ of this.resources) {
					const styleTag: HTMLElement = <HTMLElement>document.getElementById("style-" + resource);
					if (styleTag) {
						const styleTagDisabled = keep.indexOf(resource) != -1;
						$('#check_' + resource.replace(' ', '_')).prop('checked', styleTagDisabled);
						(styleTag as any).disabled = styleTagDisabled;
					}
				}
			}
		});
	}

	buildDataReset(data: ValheimFood) {
		document.getElementById("json-clear")?.addEventListener("click", (event: MouseEvent) => {
			window.localStorage.removeItem(this.localStorageJsonName);
			window.localStorage.removeItem(this.localStorageVersionName);
			location.reload();
		});
	}
}
