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
	defaultLang: {
		code: string;
		name: string;
	};
	translations: Array<{
		code: string;
		name: string;
	}>;
	frontendUrl: string;
	prefixDefaultLocale: boolean;
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
