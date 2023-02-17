/* eslint-disable @typescript-eslint/no-var-requires */
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'source-map',
	devServer: {
		open: {
			target: ['valheim-food.html'],
			app: {
				name: 'chrome',
				//arguments: ['--incognito', '--new-window'],
			},
		},
	},
});
