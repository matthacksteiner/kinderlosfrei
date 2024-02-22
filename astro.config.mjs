import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
const API_URL = process.env.KIRBY_URL;
const response = await fetch(API_URL + '/global.json');
const data = await response.json();
const defaultLanguage = data.defaultLang.code;
const translations = data.translations.map((lang) => lang.code);

const frontendUrl = data.frontendUrl.endsWith('/')
	? data.frontendUrl
	: data.frontendUrl + '/';
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
						prefixDefaultLocale: true,
					},
			  }
			: undefined,
	integrations: [tailwind()],
	image: {
		domains: [API_URL],
	},
	output: process.env.PUBLIC_ENV === 'preview' ? 'server' : 'hybrid',
	// adapter: process.env.PUBLIC_ENV === 'preview' ? netlify() : undefined,
	adapter: netlify(),
});
