import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
const API_URL = process.env.KIRBY_URL;
const response = await fetch(API_URL + '/global.json');
const data = await response.json();
const defaultLanguage = data.defaultLang.code;
const defaultLanguageLocale = data.defaultLang.locale.replace(/_/g, '-');
const translations = data.translations.map((lang) => lang.code);
const translationsLocales = data.translations.map((lang) =>
	lang.locale.replace(/_/g, '-')
);
const frontendUrl = data.frontendUrl.endsWith('/')
	? data.frontendUrl
	: data.frontendUrl + '/';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify/functions';

// https://astro.build/config
export default defineConfig({
	site: frontendUrl,
	i18n: {
		defaultLocale: defaultLanguage,
		locales: [defaultLanguage, ...translations],
		routing: {
			prefixDefaultLocale: true,
		},
	},
	integrations: [
		tailwind(),
		sitemap({
			i18n: {
				defaultLocale: defaultLanguage,
				locales: {
					[defaultLanguage]: defaultLanguageLocale,
					...translations.reduce((acc, lang, index) => {
						acc[lang] = translationsLocales[index];
						return acc;
					}, {}),
				},
			},
		}),
	],
	image: {
		domains: [API_URL],
	},
	output: process.env.PUBLIC_ENV === 'preview' ? 'server' : 'static',
	adapter: process.env.PUBLIC_ENV === 'preview' ? netlify() : undefined,
});
