const API_URL = import.meta.env.KIRBY_URL;

export async function getIndex(uri) {
	const response = await fetch(API_URL + uri, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	if (response.status !== 200) {
		console.log(API_URL);
		throw new KirbyApiError(await response.text(), response.status, API_URL);
	}

	const json = await response.json();

	return json;
}
