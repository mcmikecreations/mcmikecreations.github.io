/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

	plugins: [
		require('flowbite/plugin'),
		require('@tailwindcss/typography'),
		require('tailwind-children'),
	],

	darkMode: 'class',

	theme: {
		extend: require('./src/lib/styling/theme')
	}
};

module.exports = config;
