const API_URL = import.meta.env.KIRBY_URL;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface KirbyError {
	status: number;
	url: string;
	message: string;
}

export interface Language {
	code: string;
	name?: string;
	[key: string]: any;
}

export interface LanguageData {
	translations: Language[];
	defaultLang: Language;
	allLang: Language[];
	prefixDefaultLocale: boolean;
}

export interface GlobalData {
	translations: Language[];
	defaultLang: Language;
	allLang: Language[];
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

export interface FontItem {
	name: string;
	woff?: string;
	woff2?: string;
	originalWoff?: string;
	originalWoff2?: string;
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

export interface PageData {
	title: string;
	uri: string;
	intendedTemplate: string;
	layouts?: any[];
	[key: string]: any;
}

export interface SectionData extends PageData {
	items: PageData[];
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

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

// ============================================================================
// CORE API FUNCTIONS
// ============================================================================

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

// Generic data fetching function
export async function getData<T>(uri: string): Promise<T> {
	return fetchData<T>(uri);
}

// ============================================================================
// GLOBAL DATA FUNCTIONS
// ============================================================================

export async function getGlobal(): Promise<GlobalData> {
	return fetchData<GlobalData>('/global.json');
}

export async function getFrontendUrl(): Promise<string> {
	const global = await getGlobal();
	return global.frontendUrl;
}

// ============================================================================
// LANGUAGE FUNCTIONS
// ============================================================================

export async function getLanguages(): Promise<LanguageData> {
	const global = await getGlobal();
	return {
		translations: global.translations,
		defaultLang: global.defaultLang,
		allLang: global.allLang,
		prefixDefaultLocale: global.prefixDefaultLocale,
	};
}

// ============================================================================
// PAGE AND CONTENT FUNCTIONS
// ============================================================================

// Get all pages for a specific language or default
export async function getAllPages(lang?: string): Promise<PageData[]> {
	const path = lang ? `/${lang}/index.json` : '/index.json';
	return fetchData<PageData[]>(path);
}

// Get specific page data
export async function getPage(slug: string, lang?: string): Promise<PageData> {
	const path = lang ? `/${lang}/${slug}.json` : `/${slug}.json`;
	return fetchData<PageData>(path);
}

// Get section with its items
export async function getSection(
	section: string,
	lang?: string
): Promise<SectionData> {
	const path = lang ? `/${lang}/${section}.json` : `/${section}.json`;
	return fetchData<SectionData>(path);
}

// Get sections from all pages
export async function getSections(lang?: string): Promise<PageData[]> {
	const pages = await getAllPages(lang);
	return pages.filter((page) => page.intendedTemplate === 'section');
}

// Advanced function to get a page with optional redirection for missing pages
export async function getPageWithFallback(
	slug: string,
	lang?: string,
	fallbackUrl = '/404'
): Promise<PageData> {
	try {
		return await getPage(slug, lang);
	} catch (error) {
		if (error instanceof KirbyApiError && error.status === 404) {
			throw new Error(`REDIRECT:${fallbackUrl}`);
		}
		throw error;
	}
}

// ============================================================================
// FONT FUNCTIONS
// ============================================================================

// Create CSS for font sources
function createFontCSS(
	fontArray: FontItem[],
	usePreviewProxy = false
): FontData {
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
			if (usePreviewProxy) {
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
		// Import preview mode check
		const { isPreviewMode } = await import('@lib/preview');
		const inPreviewMode = isPreviewMode();

		// Preview mode - get fonts from API and use proxy
		if (inPreviewMode) {
			const global = await getGlobal();

			if (!global.font || global.font.length === 0) {
				return { css: '', fonts: [] };
			}

			// Create font array with proxy URLs for both CSS and preload
			const fontArray = global.font
				.map((item) => {
					// For preview mode, we don't use the original URLs at all
					// Instead, we send empty URLs in the fontArray so they don't get preloaded directly
					// The CSS will use the proxy URLs instead
					return {
						name: item.name,
						// Include original URLs as data attributes for debugging
						woff: '', // Don't preload the direct URL
						woff2: '', // Don't preload the direct URL
						originalWoff: item.url1,
						originalWoff2: item.url2,
					};
				})
				.filter((item) => item.originalWoff || item.originalWoff2);

			// Use special handling for preview mode to generate CSS with proxied URLs
			const css = fontArray
				.map((item) => {
					const sources: string[] = [];

					if (item.originalWoff2) {
						sources.push(
							`url('/preview/font-proxy?url=${encodeURIComponent(
								item.originalWoff2
							)}') format('woff2')`
						);
					}

					if (item.originalWoff) {
						sources.push(
							`url('/preview/font-proxy?url=${encodeURIComponent(
								item.originalWoff
							)}') format('woff')`
						);
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

			return { css, fonts: fontArray };
		}

		// Regular SSR or browser mode - use normal font handling
		else {
			// Server mode (not preview) - read from filesystem
			if (typeof window === 'undefined') {
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

// ============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON OPERATIONS
// ============================================================================

/**
 * Loads both page and global data at once for a given slug and language
 */
export async function getPageAndGlobal(
	slug: string,
	lang?: string
): Promise<{
	page: PageData;
	global: GlobalData;
}> {
	try {
		const pagePromise = getPage(slug, lang);
		const globalPromise = lang
			? getData<GlobalData>(`/${lang}/global.json`)
			: getGlobal();

		const [page, global] = await Promise.all([pagePromise, globalPromise]);

		return { page, global };
	} catch (error) {
		console.error(
			`Error loading data for ${slug} (${lang || 'default'})`,
			error
		);
		throw error;
	}
}

/**
 * Loads both section page, its items, and global data at once
 */
export async function getSectionAndGlobal(
	slug: string,
	lang?: string
): Promise<{
	section: PageData;
	items: PageData[];
	global: GlobalData;
}> {
	try {
		const sectionPromise = getSection(slug, lang);
		const globalPromise = lang
			? getData<GlobalData>(`/${lang}/global.json`)
			: getGlobal();

		const [sectionData, global] = await Promise.all([
			sectionPromise,
			globalPromise,
		]);

		return {
			section: sectionData,
			items: sectionData.items || [],
			global,
		};
	} catch (error) {
		console.error(
			`Error loading section data for ${slug} (${lang || 'default'})`,
			error
		);
		throw error;
	}
}

// ============================================================================
// LANGUAGE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get language information for the current context
 */
export async function getLanguageContext(currentLang?: string): Promise<{
	defaultLang: string;
	allLangs: Language[];
	translations: string[];
	prefixDefaultLocale: boolean;
	currentLang: string;
	selectedLang: Language;
}> {
	const global = await getGlobal();
	const defaultLang = global.defaultLang.code;
	const allLangs = global.allLang;
	const translations = global.translations.map((lang: Language) => lang.code);
	const prefixDefaultLocale = global.prefixDefaultLocale;

	// Determine current language
	const resolvedCurrentLang = currentLang || defaultLang;
	const selectedLang =
		allLangs.find((l: Language) => l.code === resolvedCurrentLang) ||
		global.defaultLang;

	return {
		defaultLang,
		allLangs,
		translations,
		prefixDefaultLocale,
		currentLang: resolvedCurrentLang,
		selectedLang,
	};
}

/**
 * Get the URL for a page in a specific language
 */
export async function getLocalizedPageUrl({
	targetLangCode,
	currentLang,
	currentPageSlug,
	isHome = false,
	pageUri,
}: {
	targetLangCode: string;
	currentLang: string;
	currentPageSlug: string;
	isHome?: boolean;
	pageUri?: string;
}): Promise<string> {
	const { defaultLang, prefixDefaultLocale } = await getLanguageContext();

	// Home page handling
	if (isHome || currentPageSlug === 'home') {
		return targetLangCode === defaultLang && !prefixDefaultLocale
			? '/'
			: `/${targetLangCode}`;
	}

	try {
		// Get pages in target language
		const targetPages = await getAllPages(targetLangCode);
		const currentPages = await getAllPages(currentLang);

		const currentPage = currentPages.find((page) => {
			const uri = page.uri.split('/').pop();
			return uri === currentPageSlug || page.uri === currentPageSlug;
		});

		// Find matching page in target language
		const targetPage = targetPages.find(
			(page) =>
				currentPage?.translations?.[targetLangCode] === page.uri ||
				page.translations?.[currentLang] === currentPage?.uri
		);

		if (targetPage) {
			return targetLangCode === defaultLang && !prefixDefaultLocale
				? `/${targetPage.uri}`
				: `/${targetLangCode}/${targetPage.uri}`;
		}
	} catch (error) {
		console.error('Error fetching translations:', error);
	}

	// Fallback to language root if no translation found
	return targetLangCode === defaultLang && !prefixDefaultLocale
		? '/'
		: `/${targetLangCode}`;
}

/**
 * Extract current page slug from URL path
 */
export function extractPageSlug({
	pathname,
	translations,
	isHome,
}: {
	pathname: string[];
	translations: string[];
	isHome: boolean;
}): string {
	if (isHome) {
		return 'home';
	}

	if (translations.includes(pathname[0])) {
		// URL format: /[lang]/[page]
		return pathname.slice(1).join('/') || 'home';
	}

	// URL format: /[page]
	return pathname.join('/');
}
