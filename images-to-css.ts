// @ts-ignore
const fs = require('fs');
// @ts-ignore
const path = require('path');

(function() {
	const folderPath = path.join(__dirname, 'src/assets/images');
	fs.readdir(folderPath, (err: any, files: any[]) => {
		if (err) {
			console.error('Error reading directory:', err);
			return;
		}
		let all = '';
		files.forEach(file => {
			const template =
`.tabulator-col[tabulator-field="${file}"] .tabulator-col-title::before {
\tbackground-image: url("images/${file}");
}`;
			all += template + '\n\n';
		});
		console.log(all);
		fs.writeFile(path.join(__dirname, 'src/assets/valheim-food.css'), all, (err: any) => {
			if (err) {
				console.error('Error writing file:', err);
				return;
			}
			console.log('File written successfully');
		});
	});
})();
