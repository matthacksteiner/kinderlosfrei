const API_URL = import.meta.env.KIRBY_URL;

export interface KirbyError {
	status: number;
	url: string;
	message: string;
}

export interface LanguageData {
	translations: Record<string, any>;
	defaultLang: string;
	allLang: string[];
	prefixDefaultLocale: boolean;
}

export interface FontItem {
	name: string;
	woff?: string;
	woff2?: string;
}

export interface FontData {
	css: string;
	fonts: FontItem[];
}

export interface FontSizeItem {
	name: string;
	sizeMobile: number;
	sizeDesktop: number;
	sizeDesktopXl?: number;
	lineHeightMobile: number;
	lineHeightDesktop: number;
	lineHeightDesktopXl?: number;
	letterSpacingMobile: number;
	letterSpacingDesktop: number;
	letterSpacingDesktopXl?: number;
	transform: string;
	decoration: string;
}

export interface GlobalData {
	translations: Record<string, any>;
	defaultLang: string;
	allLang: string[];
	prefixDefaultLocale: boolean;
	frontendUrl: string;
	paginationElements?: number;
	font?: Array<{
		name: string;
		url1?: string; // woff
		url2?: string; // woff2
	}>;
	fontSize: FontSizeItem[];
}

class KirbyApiError extends Error implements KirbyError {
	url: string;
	status: number;

	constructor(message: string, status: number, url: string) {
		super(message);
		this.status = status;
		this.url = url;
		this.name = 'KirbyApiError';
	}
}

// Reusable function for making GET requests
async function fetchData<T>(uri: string): Promise<T> {
	const response = await fetch(API_URL + uri, {
		method: 'GET',
	});

	if (response.status !== 200) {
		console.error('Error fetching', uri, response.status, response.statusText);
		throw new KirbyApiError(await response.text(), response.status, uri);
	}
	return response.json() as Promise<T>;
}

export async function getData<T>(uri: string): Promise<T> {
	return fetchData<T>(uri);
}

export async function getGlobal(): Promise<GlobalData> {
	return fetchData<GlobalData>('/global.json');
}

export async function getLanguages(): Promise<LanguageData> {
	const global = await getGlobal();
	return {
		translations: global.translations,
		defaultLang: global.defaultLang,
		allLang: global.allLang,
		prefixDefaultLocale: global.prefixDefaultLocale,
	};
}

export async function getFrontendUrl(): Promise<string> {
	const global = await getGlobal();
	return global.frontendUrl;
}

// Create CSS for font sources
function createFontCSS(fontArray: FontItem[], isPreviewMode = false): FontData {
	if (!fontArray || fontArray.length === 0) {
		return { css: '', fonts: [] };
	}

	// Normalize font items to ensure consistent URLs
	const normalizedFonts = fontArray
		.map((item) => {
			// Ensure font items have properly encoded URLs
			return {
				name: item.name,
				woff: item.woff,
				woff2: item.woff2,
			};
		})
		.filter((item) => item.woff || item.woff2);

	if (normalizedFonts.length === 0) {
		return { css: '', fonts: [] };
	}

	const css = normalizedFonts
		.map((item) => {
			const sources: string[] = [];

			// Handle font sources differently for preview mode
			if (isPreviewMode) {
				if (item.woff2) {
					sources.push(
						`url('/preview/font-proxy?url=${encodeURIComponent(
							item.woff2
						)}') format('woff2')`
					);
				}
				if (item.woff) {
					sources.push(
						`url('/preview/font-proxy?url=${encodeURIComponent(
							item.woff
						)}') format('woff')`
					);
				}
			} else {
				if (item.woff2) sources.push(`url('${item.woff2}') format('woff2')`);
				if (item.woff) sources.push(`url('${item.woff}') format('woff')`);
			}

			if (sources.length === 0) return '';

			return `@font-face {
        font-family: '${item.name}';
        src: ${sources.join(',\n\t\t\t ')};
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }`;
		})
		.filter((css) => css !== '')
		.join('');

	return { css, fonts: normalizedFonts };
}

// Get fonts function
export async function getFonts(): Promise<FontData> {
	try {
		// Determine the environment
		const isServer = typeof window === 'undefined';
		const isPreviewMode =
			isServer &&
			process.env.ASTRO_PATH &&
			(process.env.ASTRO_PATH.includes('/preview/') ||
				process.env.ASTRO_PATH === '/preview');

		// Preview mode - get fonts from API
		if (isPreviewMode) {
			const global = await getGlobal();

			if (!global.font || global.font.length === 0) {
				return { css: '', fonts: [] };
			}

			const fontArray = global.font
				.map((item) => ({
					name: item.name,
					woff: item.url1,
					woff2: item.url2,
				}))
				.filter((item) => item.woff || item.woff2);

			return createFontCSS(fontArray, true);
		}

		// Server mode (not preview) - read from filesystem
		else if (isServer) {
			try {
				const fs = await import('fs');
				const path = await import('path');
				const fontsJsonPath = path.join(
					process.cwd(),
					'public',
					'fonts',
					'fonts.json'
				);

				if (!fs.existsSync(fontsJsonPath)) {
					return { css: '', fonts: [] };
				}

				const fontJson = fs.readFileSync(fontsJsonPath, 'utf8');
				const fontData = JSON.parse(fontJson);
				return createFontCSS(fontData?.fonts || []);
			} catch (error) {
				return { css: '', fonts: [] };
			}
		}

		// Browser mode - fetch from URL
		else {
			try {
				const fontsUrl = new URL('/fonts/fonts.json', window.location.origin);
				const response = await fetch(fontsUrl);

				if (!response.ok) {
					return { css: '', fonts: [] };
				}

				const fontData = await response.json();
				return createFontCSS(fontData?.fonts || []);
			} catch (error) {
				return { css: '', fonts: [] };
			}
		}
	} catch (error) {
		return { css: '', fonts: [] };
	}
}

// Generate CSS for font sizes
export async function getSizes(): Promise<string> {
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
