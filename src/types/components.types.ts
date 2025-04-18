import type { PageData, GlobalData } from './api.types';

// Common Component Props
export interface BaseComponentProps {
	class?: string;
	id?: string;
}

// Layout Components
export interface LayoutProps extends BaseComponentProps {
	title?: string;
	description?: string;
	lang?: string;
}

// Navigation Components
export interface NavigationProps extends BaseComponentProps {
	items: Array<{
		label: string;
		href: string;
		active?: boolean;
		children?: Array<{
			label: string;
			href: string;
		}>;
	}>;
}

// SEO Components
export interface SeoProps {
	title?: string;
	description?: string;
	image?: string;
	canonicalURL?: string;
	type?: string;
	lang?: string;
}

// Media Components
export interface ImageProps extends BaseComponentProps {
	src: string;
	alt?: string;
	width?: number;
	height?: number;
	loading?: 'lazy' | 'eager';
	decoding?: 'async' | 'sync' | 'auto';
	class?: string;
}

// Interactive Components
export interface ButtonProps extends BaseComponentProps {
	variant?: 'primary' | 'secondary' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	type?: 'button' | 'submit' | 'reset';
	onClick?: () => void;
}

// Page Components
export interface PageRendererProps {
	slug: string;
	lang?: string;
	data?: PageData;
	global?: GlobalData;
	page?: any;
}
