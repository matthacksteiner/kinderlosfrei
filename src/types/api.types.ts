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

// Content Types
export interface GlobalData {
	translations: Array<{
		code: string;
		name: string;
		[key: string]: any;
	}>;
	defaultLang: {
		code: string;
		name: string;
		[key: string]: any;
	};
	allLang: Array<{
		code: string;
		name: string;
		[key: string]: any;
	}>;
	prefixDefaultLocale: boolean;
	frontendUrl: string;
	paginationElements?: number;
	font?: Array<{
		name: string;
		url1?: string;
		url2?: string;
	}>;
	fontSize: Array<{
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
	}>;
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
	[key: string]: any;
}

export interface SectionData extends PageData {
	items: PageData[];
}
