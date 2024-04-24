import type { APIRoute } from 'astro';

interface GlobalData {
	frontendUrl: string;
}

const getGlobalData = async (): Promise<GlobalData> => {
	const API_URL = import.meta.env.KIRBY_URL;
	const response = await fetch(API_URL + '/global.json');
	const data = await response.json();
	return data;
};

const robotsTxt = async (frontendUrl: string) =>
	`
User-agent: *
Allow: /
Disallow: /preview

Sitemap: ${new URL('sitemap-index.xml', frontendUrl).href}
`.trim();

export const GET: APIRoute = async () => {
	const globalData = await getGlobalData();
	const frontendUrl = globalData.frontendUrl.endsWith('/')
		? globalData.frontendUrl
		: globalData.frontendUrl + '/';

	return new Response(await robotsTxt(frontendUrl), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
