import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
const API_URL = process.env.KIRBY_URL;
const response = await fetch(API_URL + '/global.json');
const data = await response.json();
const frontendUrl = data.frontendUrl.endsWith('/')
	? data.frontendUrl
	: data.frontendUrl + '/';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify/functions';

// https://astro.build/config
export default defineConfig({
	site: frontendUrl,
	integrations: [tailwind(), sitemap()],
	image: {
		domains: ['cms.baukasten.matthiashacksteiner.net', 'cms.baukasten.test'],
	},
	output: process.env.PUBLIC_ENV === 'preview' ? 'server' : 'static',
	adapter: process.env.PUBLIC_ENV === 'preview' ? netlify() : undefined,
	// output: 'server',
	// adapter: netlify(),
});
