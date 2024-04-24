import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
const API_URL = process.env.KIRBY_URL;
const response = await fetch(API_URL + '/global.json');
const global = await response.json();
const defaultLanguage = global.defaultLang.code;
const translations = global.translations.map((lang) => lang.code);
const prefixDefaultLocale = global.prefixDefaultLocale;
const frontendUrl = global.frontendUrl.endsWith('/')
	? global.frontendUrl
	: global.frontendUrl + '/';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify/functions';

// https://astro.build/config
export default defineConfig({
	site: frontendUrl,
	i18n:
		translations && translations.length > 0
			? {
					defaultLocale: defaultLanguage,
					locales: [defaultLanguage, ...translations],
					routing: {
						prefixDefaultLocale: prefixDefaultLocale,
					},
			  }
			: undefined,
	integrations: [tailwind(), icon()],
	image: {
		domains: [API_URL],
	},
	output: 'hybrid',
	adapter: netlify(),
});
