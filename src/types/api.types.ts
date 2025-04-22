// API Response Types
export interface ApiResponse<T> {
	data: T;
	status: number;
	error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
	meta: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
	};
}

// Error Types
export interface KirbyError {
	status: number;
	url: string;
	message: string;
}

// Language Types
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

// Content Types
export interface GlobalData {
	translations: Language[];
	defaultLang: Language;
	allLang: Language[];
	prefixDefaultLocale: boolean;
	frontendUrl: string;
	paginationElements?: number;
	font?: Array<{
		name: string;
		url1?: string;
		url2?: string;
	}>;
	fontSize: FontSizeItem[];
}

export interface ContentBlock {
	type: string;
	content: Record<string, unknown>;
}

export interface PageData {
	title: string;
	uri: string;
	intendedTemplate: string;
	layouts?: any[];
	translations?: Record<string, string>;
	[key: string]: any;
}

export interface SectionData extends PageData {
	items: PageData[];
}

// Font Types
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
