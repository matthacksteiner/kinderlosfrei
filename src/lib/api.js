const API_URL = import.meta.env.KIRBY_URL;

// Reusable function for making GET requests
async function fetchData(uri) {
	const response = await fetch(API_URL + uri, {
		method: 'GET',
	});
	if (response.status !== 200) {
		console.log(API_URL);
		throw new KirbyApiError(await response.text(), response.status, API_URL);
	}
	return response.json();
}

export async function getData(uri) {
	return fetchData(uri);
}

export async function getGlobal() {
	return fetchData('/global.json');
}

export async function getLanguages() {
	const global = await getGlobal();
	return global.languages;
}

// export the getFonts function
export async function getFonts() {
	const global = await getGlobal();
	if (!global.font || global.font.length === 0) {
		return `@font-face {
      font-family: system-ui;
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }`;
	}
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
	const global = await getGlobal();
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
      }`;
		})
		.join('')}`;
}
