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

// export the getFonts function
export async function getFonts() {
	// call getIndex with some uri
	const data = await getIndex('/home.json');
	const global = data.global;
	// use index to get global.font or do something else
	return `${global.font
		.map((item) => {
			return `@font-face {
		font-family: '${item.name}';
		src: url('${item.url2}') format('woff2'),
			 url('${item.url1}') format('woff');
		font-weight: normal;
		font-style: normal;
		font-display: swap;
	  }`;
		})
		.join('')}`;
}

// export all font sizes
export async function getSizes() {
	const baseFontSize = 16;
	const data = await getIndex('/home.json');
	const global = data.global;
	return `${global.fontSize
		.map((item) => {
			return `
		.font--${item.name} {
			font-size: ${item.sizeMobile / baseFontSize}rem;
			line-height: ${item.lineHeightMobile / item.sizeMobile};
		}
		@media (min-width: 768px) {
			.font--${item.name} {
		font-size: ${item.sizeDesktop / baseFontSize}rem;
		line-height: ${item.lineHeightDesktop / item.sizeDesktop};
		}
	}
      `;
		})
		.join('')}`;
}
