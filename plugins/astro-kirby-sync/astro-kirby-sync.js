import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

// Helper function to fetch JSON from URL
async function fetchJson(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error(`Error fetching ${url}:`, error);
		throw error;
	}
}

// Helper function to save JSON file
function saveJsonFile(filePath, data) {
	try {
		const dirPath = path.dirname(filePath);
		ensureDirectoryExists(dirPath);
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
	} catch (error) {
		console.error(`Error saving file ${filePath}:`, error);
		throw error;
	}
}

// Main plugin function
export default function astroKirbySync() {
	return {
		name: 'astro-kirby-sync',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				try {
					const API_URL = process.env.KIRBY_URL;
					if (!API_URL) {
						logger.warn('KIRBY_URL environment variable is not set');
						return;
					}

					logger.info('Starting Kirby CMS content sync...');

					// Create content directory
					const contentDir = path.resolve('./public/content');
					ensureDirectoryExists(contentDir);

					// Fetch global data first to get language information
					const global = await fetchJson(`${API_URL}/global.json`);
					const defaultLanguage = global.defaultLang.code;
					const translations = global.translations.map((lang) => lang.code);

					// Save global.json in root
					await saveJsonFile(path.join(contentDir, 'global.json'), global);

					// Fetch and save root index.json
					const rootIndex = await fetchJson(`${API_URL}/index.json`);
					await saveJsonFile(path.join(contentDir, 'index.json'), rootIndex);

					// Process each page from root index
					for (const page of rootIndex) {
						// Save default language version in root
						const pageData = await fetchJson(`${API_URL}/${page.uri}.json`);
						await saveJsonFile(
							path.join(contentDir, `${page.uri}.json`),
							pageData
						);

						// If page is a section, fetch its items
						if (page.intendedTemplate === 'section') {
							const sectionData = await fetchJson(
								`${API_URL}/${page.uri}.json`
							);
							await saveJsonFile(
								path.join(contentDir, `${page.uri}.json`),
								sectionData
							);
						}
					}

					// Process translations
					for (const lang of translations) {
						if (lang === defaultLanguage) continue;

						// Create language directory
						const langDir = path.join(contentDir, lang);
						ensureDirectoryExists(langDir);

						// Save translated global.json
						const translatedGlobal = await fetchJson(
							`${API_URL}/${lang}/global.json`
						);
						await saveJsonFile(
							path.join(langDir, 'global.json'),
							translatedGlobal
						);

						// Fetch and save translated index.json
						const translatedIndex = await fetchJson(
							`${API_URL}/${lang}/index.json`
						);
						await saveJsonFile(
							path.join(langDir, 'index.json'),
							translatedIndex
						);

						// Process each page from translated index
						for (const page of translatedIndex) {
							const translatedPageData = await fetchJson(
								`${API_URL}/${lang}/${page.uri}.json`
							);
							await saveJsonFile(
								path.join(langDir, `${page.uri}.json`),
								translatedPageData
							);

							// If page is a section, fetch its items
							if (page.intendedTemplate === 'section') {
								const translatedSectionData = await fetchJson(
									`${API_URL}/${lang}/${page.uri}.json`
								);
								await saveJsonFile(
									path.join(langDir, `${page.uri}.json`),
									translatedSectionData
								);
							}
						}
					}

					logger.info('Kirby CMS content sync completed successfully');
				} catch (error) {
					logger.error('Error in astro-kirby-sync plugin:', error);
					// Don't fail the build if plugin errors
					if (process.env.NETLIFY) {
						logger.warn('Continuing build despite plugin error on Netlify');
					}
				}
			},
		},
	};
}
