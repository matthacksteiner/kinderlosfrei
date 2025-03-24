const API_URL = import.meta.env.KIRBY_URL;

class KirbyApiError extends Error {
	url;
	status;

	constructor(message, status, url) {
		super(message);
		this.status = status;
		this.url = url;
		this.message = message;
		this.name = 'KirbyApiError';
	}
}

// Reusable function for making GET requests
async function fetchData(uri) {
	const response = await fetch(API_URL + uri, {
		method: 'GET',
	});
	// console.log('Fetching', uri, response.status, response.statusText);
	if (response.status !== 200) {
		console.log('Error fetching', uri, response.status, response.statusText);
		// throw new KirbyApiError(await response.text(), response.status, uri);
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
	return {
		translations: global.translations,
		defaultLang: global.defaultLang,
		allLang: global.allLang,
		prefixDefaultLocale: global.prefixDefaultLocale,
	};
}

export async function getFrontendUrl() {
	const global = await getGlobal();
	return global.frontendUrl;
}

// export the getFonts function
export async function getFonts() {
	const global = await getGlobal();
	if (!global.font || global.font.length === 0) {
		return {
			css: `@font-face {
      font-family: system-ui;
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }`,
			fonts: [],
		};
	}

	const fontArray = global.font.map((item) => {
		const base64Data2 = `data:application/font-woff2;base64,${item.base64Data2}`;

		return {
			name: item.name,
			woff2: base64Data2,
		};
	});

	const css = `${global.font
		.map((item) => {
			const base64Data2 = `data:application/font-woff2;base64,${item.base64Data2}`;

			return `@font-face {
			font-family: '${item.name}';
			src: url('${base64Data2}') format('woff2');
			font-weight: normal;
			font-style: normal;
			font-display: swap;
		  }`;
		})
		.join('')}`;

	return {
		css,
		fonts: fontArray,
	};
}

// export all font sizes
export async function getSizes() {
	const baseFontSize = 16;
	const global = await getGlobal();

	return global.fontSize
		.map((item) => {
			const sizeMobile = item.sizeMobile || baseFontSize;
			const lineHeightMobile = item.lineHeightMobile || sizeMobile;
			const letterSpacingMobile = item.letterSpacingMobile || 0;

			const sizeDesktop = item.sizeDesktop || sizeMobile;
			const lineHeightDesktop = item.lineHeightDesktop || lineHeightMobile;
			const letterSpacingDesktop =
				item.letterSpacingDesktop || letterSpacingMobile;

			const sizeDesktopXl = item.sizeDesktopXl || sizeDesktop;
			const lineHeightDesktopXl = item.lineHeightDesktopXl || lineHeightDesktop;
			const letterSpacingDesktopXl =
				item.letterSpacingDesktopXl || letterSpacingDesktop;

			// Calculate the slope for the linear equation (for fluid typography)
			const slope = (sizeDesktop - sizeMobile) / (1920 - 768);
			const yAxisIntersection = sizeMobile - slope * 768;
			const fluidValue = `${yAxisIntersection / baseFontSize}rem + ${
				slope * 100
			}vw`;

			return `
		  .font--${item.name} {
			font-size: ${sizeMobile / baseFontSize}rem;
			line-height: ${lineHeightMobile / sizeMobile};
			letter-spacing: ${letterSpacingMobile / sizeMobile}em;
			text-transform: ${item.transform};
			text-decoration: ${item.decoration};
		  }
		   @media (min-width: 768px) and (max-width: 1919px) {
			.font--${item.name} {
			  font-size: clamp(${sizeMobile / baseFontSize}rem,
				${fluidValue},
				${sizeDesktop / baseFontSize}rem);
			  line-height: ${lineHeightDesktop / sizeDesktop};
			  letter-spacing: ${letterSpacingDesktop / sizeDesktop}em;
			  text-transform: ${item.transform};
			  text-decoration: ${item.decoration};
			}
		  }
		  @media (min-width: 1920px) {
			.font--${item.name} {
			  font-size: ${sizeDesktopXl / baseFontSize}rem;
			  line-height: ${lineHeightDesktopXl / sizeDesktopXl};
			  letter-spacing: ${letterSpacingDesktopXl / sizeDesktopXl}em;
			  text-transform: ${item.transform};
			  text-decoration: ${item.decoration};
			}
		  }
		`;
		})
		.join('');
}
