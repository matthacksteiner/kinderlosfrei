import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';
import langFolderRename from './plugins/lang-folder-rename/langFolderRename.js';

const API_URL = process.env.KIRBY_URL;
const response = await fetch(API_URL + '/global.json');
const global = await response.json();
const defaultLanguage = global.defaultLang.code;
const translations = global.translations.map((lang) => lang.code);
const prefixDefaultLocale = global.prefixDefaultLocale;
const frontendUrl = global.frontendUrl.endsWith('/')
	? global.frontendUrl
	: global.frontendUrl + '/';

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
	integrations: [tailwind(), icon(), langFolderRename()],
	image: {
		domains: [API_URL],
	},
	adapter: netlify({
		imageCDN: false,
	}),
});
