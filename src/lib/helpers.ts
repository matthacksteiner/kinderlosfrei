import type { AstroGlobal } from 'astro';

/**
 * Checks if the current page is the home page
 * @param pageContext - The Astro global context
 * @returns boolean indicating if current page is home
 */
export function checkIsHome(pageContext: AstroGlobal): boolean {
	const path = pageContext.url.pathname;
	const currentLang = pageContext.currentLocale;

	return (
		path === '/' || path === `/${currentLang}` || path === `/${currentLang}/`
	);
}

/**
 * Converts a pixel value to rem units
 * @param value - The pixel value to convert
 * @returns string with rem unit
 */
export function toRem(value: number): string {
	return `${value / 16}rem`;
}
