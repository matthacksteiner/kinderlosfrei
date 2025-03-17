const baseConfig = require('./tailwind.baseConfig.cjs');

module.exports = {
	...baseConfig,
	theme: {
		...baseConfig.theme,
		extend: {
			...baseConfig.theme.extend,
			// Add your custom extensions here
			colors: {
				...baseConfig.theme.extend.colors,
			},
			// Add more custom properties
		},
	},
	// You can also extend plugins
	plugins: [
		...baseConfig.plugins,
		// Add additional plugins
	],
};
