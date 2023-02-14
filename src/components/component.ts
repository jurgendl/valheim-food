//  npm install --save-dev @types/jquery
// npm install tabulator-tables --save
// npm i --save-dev @types/tabulator-tables

import {ColumnDefinition, TabulatorFull as Tabulator} from 'tabulator-tables';

export enum FoodType {
	yellow = "yellow",
	red = "red",
	white = "white",
	blue = "blue"
}

export interface Food {
	"id": number;
	"name": string;
	"tier": number;
	"starred": boolean;
	"hp": number;
	"hpScore": number;
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

export interface Row {
	id: number;
	name: string;
	tier: number;
	starred: boolean;
	hp: number;
	stamina: number;
	eitr: number;
	type: string;
	hpPerSecond: number;
	durationInMinutes: number;
}

export interface ColumnFilter {
	field: string;
	type: string;
	value: string | number | string[] | number[] | boolean | undefined;
}

// noinspection TypeScriptUnresolvedFunction
export class Component {
	tierColors: Map<number, string> = new Map<number, string>([
		[1, '#f7f781'],
		[2, '#bbe33d'],
		[3, '#b4c7dc'],
		[4, '#dddddd'],
		[5, '#ffdbb6'],
		[6, '#ffc2c2'],
	]);

	resources: string[] = [];

	tabledata: Row/*(Row & { [key: string]: (number | string) })*/ [] = [];

	resourceCols: ColumnDefinition[] = [];

	table: any = null;

	fetchDataAgain(): void {
		fetch('assets/valheim-food.json')
			.then((response) => response.json())
			.then((__data) => this.app(__data));
	}

	init(): void {
		($('.selectpicker') as any).selectpicker();

		try {
			const valheimFood = window.localStorage.getItem('valheim-food');
			if (valheimFood && valheimFood != undefined && valheimFood != null) {
				const __data = JSON.parse(valheimFood);
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
			data.resourceTiers.forEach(function (resourceTier, i) {
				for (const rt of resourceTier) {
					if (resource == rt) {
						colorClass = data.tiers[i];
					}
				}
			});
			if (colorClass == '') {
				data.resourceTiers.forEach(function (resourceTier, i) {
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
			$('#check_' + fixedName).click(function () {
				const checked = $(this).is(':checked');
				if (resource) {
					const el: HTMLElement | null = document.getElementById("style-" + resource);
					if (el) {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						el.disabled = checked;
					}
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
			const el: HTMLElement | null = document.getElementById("style-" + resource);
			if (el) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				el.disabled = true;
			}
		}
	}

	buildTableDate(data: ValheimFood) {
		for (const [name, food] of Object.entries(data.food)) {
			const row: Row = {
				id: food.id,
				name: food.name,
				tier: food.tier,
				starred: food.starred,// ? '★' : '',
				hp: food.hp,
				stamina: food.stamina,
				eitr: food.eitr,
				type: food.type.replace("white", "W").replace("yellow", "Y").replace("red", "R").replace("blue", "B"),
				hpPerSecond: food.hpPerSecond,
				durationInMinutes: food.durationInMinutes
			};
			for (const resource of this.resources) {
				const fr: any = food.resources[resource];
				if (food.resources[resource]) {
					(row as any)[resource] = food.resources[resource];
				} else {
					(row as any)[resource] = '';
				}
			}
			this.tabledata.push(row);
		}
	}

	buildTableFilters(data: ValheimFood) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const _this = this;
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
		function clearFiltering() {
			_this.table.clearFilter();
			for (let i = 0; i < Object.keys(data.food).length; i++) {
				_this.table.deselectRow(i);
			}
			$('#totalPoints').val('');
			for (const resource of _this.resources) {
				$("#check_" + resource.replace(' ', '_')).prop('checked', true);
			}
		}

		//
		function updateFilter() {
			clearFiltering();
			//
			const f: ColumnFilter[] = [];
			//
			const nameFilterVal: string = nameFilter.val() as string;
			if (nameFilterVal && nameFilterVal.length > 0) {
				const colFilters: ColumnFilter[] = nameFilterVal.split(',').map((x: string) => x.trim())
					.map((x: string) => {
						return {"field": "name", "type": "like", "value": x};
					});
				colFilters.forEach(colFilter => f.push(colFilter));
			}
			const tierFilterVal: string[] = tierFilter.val() as string[];
			if (tierFilterVal && tierFilterVal.length > 0) {
				f.push({
					field: "tier", type: "in", value: tierFilterVal.map((str: string) => parseInt(str))
				});
			}
			const starredFilterVal: string[] = starredFilter.val() as string[];
			if (starredFilterVal && starredFilterVal.length == 1) {
				if (starredFilterVal[0] == "y") {
					f.push({field: "starred", type: "=", value: true});
				} else {
					f.push({field: "starred", type: "=", value: false});
				}
			}
			const hpFilterVal: string = hpFilter.val() as string;
			if (hpFilterVal && hpFilterVal.length > 0) {
				f.push({field: "hp", type: ">=", value: hpFilterVal});
			}
			const staminaFilterVal: string = staminaFilter.val() as string;
			if (staminaFilterVal && staminaFilterVal.length > 0) {
				f.push({field: "stamina", type: ">=", value: staminaFilterVal});
			}
			const eitrFilterVal: string = eitrFilter.val() as string;
			if (eitrFilterVal && eitrFilterVal.length > 0) {
				f.push({field: "eitr", type: ">=", value: eitrFilterVal});
			}
			const typeFilterVal: string[] = typeFilter.val() as string[];
			if (typeFilterVal && typeFilterVal.length > 0) {
				f.push({field: "type", type: "in", value: typeFilterVal});
			}
			const hpsFilterVal: string = hpsFilter.val() as string;
			if (hpsFilterVal && hpsFilterVal.length > 0) {
				f.push({field: "hpPerSecond", type: ">=", value: hpsFilterVal});
			}
			const durationFilterVal: string = durationFilter.val() as string;
			if (durationFilterVal && durationFilterVal.length > 0) {
				f.push({field: "durationInMinutes", type: ">=", value: durationFilterVal});
			}
			if (f.length > 0) {
				_this.table.setFilter(f);
			}
		}

		//
		const filterEl: HTMLElement | null = document.getElementById("filter");
		if (filterEl) {
			filterEl.addEventListener("click", function () {
				updateFilter();
			});
		}
		//
		const filterClearEl: HTMLElement | null = document.getElementById("filter-clear");
		if (filterClearEl) {
			filterClearEl.addEventListener("click", function () {
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
	}

	buildTable(data: ValheimFood) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const _this = this;

		this.table = new Tabulator("#valheim-food-table", {
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
			columns: [
				{
					title: "Name",
					field: "name",
					frozen: true, /*headerFilter: "input",*/
					formatter: function (cell: any, formatterParams: any) {
						const dat = cell.getData();
						const value = cell.getValue();
						const color = _this.tierColors.get(dat.tier);
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
				},
				{//create column group
					title: "Info", frozen: true,
					columns: [
						{
							title: "Tier",
							field: "tier",
							sorter: "number",
							headerVertical: true,
							hozAlign: "center" /*, headerFilter: "list", headerFilterParams: { valuesLookup: true, clearable: true }*/,
							formatter: function (cell: any, formatterParams: any) {
								const dat = cell.getData();
								const value = cell.getValue();
								return "<span style='background-color:" + _this.tierColors.get(dat.tier) + ";display:block;width:100%;height:100%' title='meadows'>" + value + "</span>";
							}
						},
						{
							title: "Starred",
							field: "starred",
							sorter: "boolean",
							headerVertical: true,
							hozAlign: "center",
							formatter: "tickCross"/*, headerFilter: "tickCross", headerFilterParams: { "tristate": true }*/
						},
						{
							title: "HP",
							field: "hp",
							sorter: "number",
							headerVertical: true,
							hozAlign: "center"/*, headerFilter: "number" */
						},
						{
							title: "Stamina",
							field: "stamina",
							sorter: "number",
							headerVertical: true,
							hozAlign: "center"/*, headerFilter: "number"*/
						},
						{
							title: "Eitr",
							field: "eitr",
							sorter: "number",
							headerVertical: true,
							hozAlign: "center"/*, headerFilter: "number"*/
						},
						{
							title: "Type",
							field: "type",
							headerVertical: true,
							hozAlign: "center"/*, headerFilter: "list", headerFilterParams: { valuesLookup: true, clearable: true }*/,
							formatter: function (cell: any, formatterParams: any) {
								const value = cell.getValue();
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
						},
						{
							title: "HP/s",
							field: "hpPerSecond",
							sorter: "number",
							headerVertical: true,
							hozAlign: "center", /*headerFilter: "list", headerFilterParams: { valuesLookup: true, clearable: true }*/
						},
						{
							title: "Duration (m)",
							field: "durationInMinutes",
							sorter: "number",
							headerVertical: true,
							hozAlign: "center"/*, headerFilter: "number"*/
						},
						{
							title: "Score",
							field: "score",
							sorter: "number",
							headerVertical: true,
							mutator: (value: any, dat: any, type: any, params: any, component: any) => {
								const score = (dat.hp + dat.stamina + dat.eitr) * dat.durationInMinutes;
								return score;
							}
						}
					]
				},
				{//create column group
					title: "Resources",
					columns: this.resourceCols
				}
			],
		});
		//
		_this.table.on("rowSelectionChanged", function (x: any, rows: any) {
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
				const dur = [];
				for (const row of rows) {
					const dat = row.getData();
					totalHP += dat.hp;
					totalStamina += dat.stamina;
					totalEitr += dat.eitr;
					totalHPs += dat.hpPerSecond;
					dur.push(dat.durationInMinutes);
					totalScore += (dat.hp + dat.stamina + dat.eitr) * dat.durationInMinutes;
				}
				// eslint-disable-next-line prefer-spread
				if (Math.min.apply(Math, dur) == Math.max.apply(Math, dur)) {
					// eslint-disable-next-line prefer-spread
					$('#totalPoints').val('SELECTED TOTAL: HP=' + totalHP + ' +' + totalHPs + '/s, Stamina=' + totalStamina + ', Eitr=' + totalEitr + ' [' + Math.min.apply(Math, dur) + 'm] > ' + totalScore + ' score');
				} else {
					// eslint-disable-next-line prefer-spread
					$('#totalPoints').val('SELECTED TOTAL: HP=' + totalHP + ' +' + totalHPs + '/s, Stamina=' + totalStamina + ', Eitr=' + totalEitr + ' [' + Math.min.apply(Math, dur) + '-' + Math.max.apply(Math, dur) + 'm] > ' + totalScore + ' score');
				}
			}
		});
		//
		_this.table.on("dataFiltered", function (filters: any, rows: any) {
			//filters - array of filters currently applied
			//rows - array of row components that pass the filters
			for (const resource of _this.resources) {
				const styleTag: any = document.getElementById("style-" + resource);
				if (styleTag) {
					styleTag.disabled = true;
				}
			}
			if (filters.length > 0) {
				const keep = [];
				for (const row of rows) {
					const dat = row.getData();
					for (const resource of _this.resources) {
						if (dat[resource]) {
							keep.push(resource);
						}
					}
				}
				for (const resource of _this.resources) {
					const styleTag: any = document.getElementById("style-" + resource);
					if (styleTag) {
						const styleTagDisabled = keep.indexOf(resource) != -1;
						$('#check_' + resource.replace(' ', '_')).prop('checked', styleTagDisabled);
						styleTag.disabled = styleTagDisabled;
					}
				}
			}
		});
	}

	buildDataReset(data: ValheimFood) {
		document.getElementById("json-clear")?.addEventListener("click", function () {
			window.localStorage.removeItem('valheim-food');
			location.reload();
		});
	}

	app($$data: ValheimFood): void {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const _this = this;
		console.log($$data);
		window.localStorage.setItem('valheim-food', JSON.stringify($$data));
		this.buildResources($$data);
		this.buildResourceCols($$data);
		this.buildResourceChecks($$data);
		$(function () {
			setTimeout(() => {
				_this.buildResourceStyles($$data);
			}, 3 * 1000);
		});
		this.buildTableDate($$data);
		this.buildTableFilters($$data);
		this.buildTable($$data);
		this.buildDataReset($$data);
	}
}
