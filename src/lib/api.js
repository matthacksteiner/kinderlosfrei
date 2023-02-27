const API_URL = import.meta.env.KIRBY_URL;

export async function getIndex(uri) {
	const response = await fetch(API_URL + uri, {
		method: 'GET',
	});
	if (response.status !== 200) {
		console.log(API_URL);
		throw new KirbyApiError(await response.text(), response.status, API_URL);
	}

	const json = await response.json();

	return json;
}

// export function getBackgroundColor() {
// 	const backgroundColor = global.backgroundColor;
// 	if (backgroundColor === 'primary') {
// 		return 'bg-primary';
// 	} else if (backgroundColor === 'secondary') {
// 		return 'bg-secondary';
// 	} else if (backgroundColor === 'tertiary') {
// 		return 'bg-tertiary';
// 	} else if (backgroundColor === 'black') {
// 		return 'bg-colorBlack';
// 	} else if (backgroundColor === 'white') {
// 		return 'bg-colorWhite';
// 	} else if (backgroundColor === 'transparent') {
// 		return 'bg-colorTransparent';
// 	}
// }
