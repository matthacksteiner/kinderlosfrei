// usage in Components
// import { checkIsHome } from '@lib/helpers.js';
// const isHome = checkIsHome(Astro);
export function checkIsHome(pageContext) {
	const path = pageContext.url.pathname;
	const currentLang = pageContext.currentLocale;

	return (
		path === '/' || path === `/${currentLang}` || path === `/${currentLang}/`
	);
}

export function toRem(value) {
	return value / 16 + 'rem';
}
