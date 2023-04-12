import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import image from '@astrojs/image';
import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify/functions';

// https://astro.build/config
export default defineConfig({
	// site: 'https://physioflatz.at/',
	integrations: [
		tailwind(),
		image({
			serviceEntryPoint: '@astrojs/image/sharp',
		}),
		sitemap(),
	],
	output: process.env.PUBLIC_ENV === 'preview' ? 'server' : 'static',
	adapter: process.env.PUBLIC_ENV === 'preview' ? netlify() : undefined,
});
