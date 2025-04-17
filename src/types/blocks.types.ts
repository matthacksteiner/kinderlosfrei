import type { ContentBlock } from './api.types';

// Base Block Props
export interface BaseBlockProps {
	type: string;
	id?: string;
	class?: string;
}

// Text Block
export interface BlockTextProps extends BaseBlockProps {
	content: string;
	align?: 'left' | 'center' | 'right';
}

// Image Block
export interface BlockImageProps extends BaseBlockProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	caption?: string;
}

// Video Block
export interface BlockVideoProps extends BaseBlockProps {
	url: string;
	poster?: string;
	autoplay?: boolean;
	controls?: boolean;
}

// Gallery Block
export interface BlockGalleryProps extends BaseBlockProps {
	images: Array<{
		src: string;
		alt: string;
		caption?: string;
	}>;
}

// Card Block
export interface BlockCardProps extends BaseBlockProps {
	title: string;
	content: string;
	image?: {
		src: string;
		alt: string;
	};
	link?: {
		url: string;
		text: string;
	};
}

// Slider Block
export interface BlockSliderProps extends BaseBlockProps {
	slides: ContentBlock[];
	options?: {
		autoplay?: boolean;
		delay?: number;
		loop?: boolean;
	};
}
