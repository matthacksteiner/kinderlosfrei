// utils/helpers.js
export function checkIsHome(path, currentLang) {
	return (
		path === '/' || path === `/${currentLang}` || path === `/${currentLang}/`
	);
}

export function toRem(value) {
	return value / 16 + 'rem';
}
