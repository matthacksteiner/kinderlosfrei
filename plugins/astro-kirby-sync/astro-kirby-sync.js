import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import chalk from 'chalk';

// Helper function to clean directory
function cleanDirectory(dirPath) {
	if (fs.existsSync(dirPath)) {
		fs.rmSync(dirPath, { recursive: true, force: true });
	}
	fs.mkdirSync(dirPath, { recursive: true });
}

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

// Helper function to fetch JSON from URL with retries
async function fetchJson(url, retries = 3, delay = 1000) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				if (attempt === retries) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				// Wait before retrying
				await new Promise((resolve) => setTimeout(resolve, delay));
				continue;
			}
			return await response.json();
		} catch (error) {
			if (attempt === retries) {
				console.error(
					`Error fetching ${url} after ${retries} attempts:`,
					error
				);
				throw error;
			}
			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
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
		// In production, we want to fail fast if we can't save content
		if (process.env.NODE_ENV === 'production') {
			throw error;
		}
	}
}

// Main plugin function
export default function astroKirbySync() {
	return {
		name: 'astro-kirby-sync',
		hooks: {
			'astro:config:setup': async ({ command, logger }) => {
				// Skip content sync in development mode
				if (command === 'dev') {
					logger.info(
						chalk.blue(
							'\n🔄 Development mode detected, skipping content sync...'
						)
					);
					logger.info(
						chalk.gray('Content will be fetched directly from the CMS API')
					);
					return;
				}

				// We're in production/build mode - content sync is REQUIRED
				logger.info(
					chalk.blue('\n🔄 Production build detected, running content sync...')
				);

				try {
					const API_URL = process.env.KIRBY_URL;
					if (!API_URL) {
						throw new Error('KIRBY_URL environment variable is not set');
					}

					logger.info(chalk.blue('\n🔄 Starting Kirby CMS content sync...'));

					// Create and clean content directory
					const contentDir = path.resolve('./public/content');
					logger.info(chalk.gray('🧹 Cleaning existing content...'));
					cleanDirectory(contentDir);

					// Fetch global data first to get language information
					let global;
					try {
						global = await fetchJson(`${API_URL}/global.json`);
					} catch (error) {
						throw new Error(
							`Failed to fetch global configuration: ${error.message}`
						);
					}

					if (!global || !global.defaultLang || !global.defaultLang.code) {
						throw new Error('Invalid global configuration received from CMS');
					}

					const defaultLanguage = global.defaultLang.code;
					const translations = global.translations.map((lang) => lang.code);

					logger.info(
						chalk.gray(
							`📚 Found languages: ${[defaultLanguage, ...translations].join(
								', '
							)}`
						)
					);

					// Save global.json in root
					await saveJsonFile(path.join(contentDir, 'global.json'), global);

					// Create default language directory
					const defaultLangDir = path.join(contentDir, defaultLanguage);
					ensureDirectoryExists(defaultLangDir);

					// Save global.json in default language directory
					await saveJsonFile(path.join(defaultLangDir, 'global.json'), global);

					// Fetch and save root index.json
					logger.info(
						chalk.yellow(
							`\n📥 Syncing default language (${defaultLanguage})...`
						)
					);
					const rootIndex = await fetchJson(`${API_URL}/index.json`);
					// Save in both root and language directory
					await saveJsonFile(path.join(contentDir, 'index.json'), rootIndex);
					await saveJsonFile(
						path.join(defaultLangDir, 'index.json'),
						rootIndex
					);

					// Process each page from root index for default language
					for (const page of rootIndex) {
						logger.info(chalk.gray(`  ↳ Fetching ${page.uri}.json`));
						const pageData = await fetchJson(`${API_URL}/${page.uri}.json`);
						// Save in both root and language directory
						await saveJsonFile(
							path.join(contentDir, `${page.uri}.json`),
							pageData
						);
						await saveJsonFile(
							path.join(defaultLangDir, `${page.uri}.json`),
							pageData
						);

						// If page is a section, fetch its items
						if (page.intendedTemplate === 'section') {
							const sectionData = await fetchJson(
								`${API_URL}/${page.uri}.json`
							);
							// Save in both root and language directory
							await saveJsonFile(
								path.join(contentDir, `${page.uri}.json`),
								sectionData
							);
							await saveJsonFile(
								path.join(defaultLangDir, `${page.uri}.json`),
								sectionData
							);
						}
					}

					// Process translations
					for (const lang of translations) {
						if (lang === defaultLanguage) continue;

						logger.info(chalk.yellow(`\n📥 Syncing language: ${lang}...`));

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
							logger.info(chalk.gray(`  ↳ Fetching ${lang}/${page.uri}.json`));
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

					logger.info(chalk.green('\n✨ Content sync completed successfully!'));
				} catch (error) {
					logger.error(chalk.red('\n❌ Error during content sync:'));
					logger.error(chalk.red(error.message));

					// Fail the build in production unless on Netlify
					if (command === 'build' && !process.env.NETLIFY) {
						logger.error(
							chalk.red(
								'\n🛑 BUILD FAILED: Content sync is required for production builds'
							)
						);
						throw error;
					}

					// Don't fail the build if plugin errors on Netlify
					if (process.env.NETLIFY) {
						logger.warn(
							chalk.yellow(
								'\n⚠️ Continuing build despite plugin error on Netlify'
							)
						);
					}
				}
			},
		},
	};
}
