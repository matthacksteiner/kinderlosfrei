function pxToRem(px) {
	return px / 16 + 'rem';
}

/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		screens: {
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1440px',
		},
		container: {
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '4.375rem',
				'2xl': '4.375rem',
			},
			center: true,
		},

		deliciousHamburgers: {
			// size: '19px',
			// width: '24px',
			// barSpacing: '16px',
			// borderRadius: '2px',
			// thickness: '2px',
			color: '#000',
			colorLight: '#fff',
			// padding: '4px',
			animationSpeed: 1,
		},
		extend: {
			colors: {
				primary: 'var(--color-primary)',
				secondary: 'var(--color-secondary)',
				tertiary: 'var(--color-tertiary)',
				white: 'var(--color-white)',
				black: 'var(--color-black)',
				transparent: 'var(--color-transparent)',
			},
		},
	},
	plugins: [require('tailwindcss-delicious-hamburgers')],
};
