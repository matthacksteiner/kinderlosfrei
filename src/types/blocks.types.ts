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

// Contact Form Block
export interface BlockContactFormProps extends BaseBlockProps {
	formName: string;
	emailSubject: string;
	successPage?: {
		url?: string;
		text?: string;
	};
	spamProtection: 'captcha' | 'honeypot' | 'none';
	fields?: {
		firstname?: {
			label?: string;
			placeholder?: string;
			help?: string;
		};
		lastname?: {
			label?: string;
			placeholder?: string;
			help?: string;
		};
		email?: {
			label?: string;
			placeholder?: string;
			help?: string;
		};
		message?: {
			label?: string;
			placeholder?: string;
			rows?: number;
			help?: string;
		};
		submitButton?: {
			label?: string;
			placeholder?: string;
		};
	};
	fieldSpacing?: 'small' | 'medium' | 'large';
	formWidth?: 'full' | 'large' | 'medium' | 'small';
	formAlign?: 'left' | 'center' | 'right';
	textGroup?: {
		textfont?: string;
		textcolor?: string;
		textsize?: string;
	};
	buttonLocal?: boolean;
	buttonSettings?: {
		buttonfont?: string;
		buttonfontsize?: string;
		buttonpadding?: number;
		buttonborderradius?: number;
		buttonborderwidth?: number;
	};
	buttonColors?: {
		buttontextcolor?: string;
		buttontextcoloractive?: string;
		buttonbackgroundcolor?: string;
		buttonbackgroundcoloractive?: string;
		buttonbordercolor?: string;
		buttonbordercoloractive?: string;
	};
	buttonAlign?: 'start' | 'center' | 'end';
}
