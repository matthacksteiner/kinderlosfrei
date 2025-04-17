import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

async function fetchAndSaveJson(url, savePath) {
	try {
		// Make sure URL ends with .json
		if (!url.endsWith('.json')) {
			url = `${url}.json`;
		}

		console.log(`Fetching: ${url}`);
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status} for ${url}`);
		}

		const data = await response.json();
		fs.mkdirSync(path.dirname(savePath), { recursive: true });
		fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
		console.log(`Saved to: ${savePath}`);
		return data;
	} catch (error) {
		console.error(`Error fetching ${url}:`, error.message);
		return null;
	}
}

async function fetchPageById(
	KIRBY_URL,
	lang,
	pageId,
	contentDir,
	processedIds
) {
	if (!pageId || processedIds.has(pageId)) {
		return null;
	}

	processedIds.add(pageId);
	console.log(`Fetching page: ${lang ? lang + '/' : ''}${pageId}`);

	const pageUrl = lang
		? `${KIRBY_URL}/${lang}/${pageId}`
		: `${KIRBY_URL}/${pageId}`;
	const pageSavePath = lang
		? path.join(contentDir, lang, `${pageId}.json`)
		: path.join(contentDir, `${pageId}.json`);

	return await fetchAndSaveJson(pageUrl, pageSavePath);
}

async function processAllPages(KIRBY_URL, lang, pages, contentDir) {
	if (!Array.isArray(pages) || pages.length === 0) {
		console.log('No pages to process or pages is not an array');
		return;
	}

	const processedIds = new Set();
	const totalPages = pages.length;
	console.log(`Found ${totalPages} pages in index for ${lang || 'root'}`);

	// Process all pages from the index
	for (const page of pages) {
		if (!page || !page.id) {
			console.log('Skipping invalid page entry:', page);
			continue;
		}

		// Fetch the page data
		const pageData = await fetchPageById(
			KIRBY_URL,
			lang,
			page.id,
			contentDir,
			processedIds
		);

		// If the page has a parent, make sure to fetch that too
		if (page.parent && !processedIds.has(page.parent)) {
			await fetchPageById(
				KIRBY_URL,
				lang,
				page.parent,
				contentDir,
				processedIds
			);
		}
	}

	console.log(
		`Processed ${processedIds.size} total pages for ${lang || 'root'}`
	);
}

// Function to fetch additional content pages that might not be in the index
async function fetchAdditionalPages(
	KIRBY_URL,
	contentDir,
	languages,
	translatedPageIds
) {
	console.log('\n=== Processing additional content pages ===');

	// Define known additional pages to fetch for each language
	const additionalPages = new Set(['images', 'bilder']); // Start with known pages

	// Add translations of these pages if we have any mapped
	const pagesToAdd = new Set();
	for (const pageId of additionalPages) {
		if (translatedPageIds && translatedPageIds.has(pageId)) {
			for (const translatedId of translatedPageIds.get(pageId)) {
				pagesToAdd.add(translatedId);
			}
		}
	}
	// Add all translations to our set
	for (const pageId of pagesToAdd) {
		additionalPages.add(pageId);
	}

	// Add pages from layouts that might be referenced but not in the index
	try {
		// Look through all JSON files we've already saved to find additional page references
		const findAdditionalPages = (dir) => {
			const files = fs.readdirSync(dir, { withFileTypes: true });

			for (const file of files) {
				const fullPath = path.join(dir, file.name);

				if (file.isDirectory()) {
					findAdditionalPages(fullPath);
				} else if (file.name.endsWith('.json')) {
					try {
						const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

						// Look for page IDs in layout content or other structures
						if (content.layouts) {
							// Extract page IDs from layouts
							extractPageIdsFromLayouts(content.layouts, additionalPages);
						}

						// Check for other common page reference patterns
						if (content.related) {
							// Add any related page IDs
							if (Array.isArray(content.related)) {
								content.related.forEach((item) => {
									if (item && item.id) additionalPages.add(item.id);
								});
							} else if (content.related.id) {
								additionalPages.add(content.related.id);
							}
						}

						// Check for section items that might contain page references
						if (content.items && Array.isArray(content.items)) {
							content.items.forEach((item) => {
								if (item && item.id) additionalPages.add(item.id);
							});
						}
					} catch (err) {
						console.error(`Error parsing ${fullPath}:`, err.message);
					}
				}
			}
		};

		// Extract page IDs from layout content
		const extractPageIdsFromLayouts = (layouts, pageIdSet) => {
			if (!Array.isArray(layouts)) return;

			for (const layout of layouts) {
				// Check content columns
				if (layout.content && layout.content.columns) {
					for (const column of layout.content.columns) {
						if (column.blocks && Array.isArray(column.blocks)) {
							for (const block of column.blocks) {
								if (
									block.type === 'pages' &&
									block.content &&
									block.content.pages
								) {
									// Add page IDs from pages blocks
									if (Array.isArray(block.content.pages)) {
										block.content.pages.forEach((pageId) =>
											pageIdSet.add(pageId)
										);
									} else if (typeof block.content.pages === 'string') {
										pageIdSet.add(block.content.pages);
									}
								}

								// Check for other references in block content
								if (block.content && typeof block.content === 'object') {
									Object.keys(block.content).forEach((key) => {
										if (
											key.endsWith('Id') &&
											typeof block.content[key] === 'string'
										) {
											pageIdSet.add(block.content[key]);
										}
									});
								}
							}
						}
					}
				}
			}
		};

		// Scan all already saved content for additional page references
		findAdditionalPages(contentDir);

		// Add all translations of discovered pages
		const newDiscoveredPages = new Set();
		for (const pageId of additionalPages) {
			if (translatedPageIds && translatedPageIds.has(pageId)) {
				translatedPageIds.get(pageId).forEach((translatedId) => {
					newDiscoveredPages.add(translatedId);
				});
			}
		}

		// Add new discovered translations to our set
		for (const pageId of newDiscoveredPages) {
			additionalPages.add(pageId);
		}

		console.log(
			`Discovered additional pages to fetch: ${Array.from(additionalPages).join(
				', '
			)}`
		);
	} catch (err) {
		console.error('Error while searching for additional pages:', err);
	}

	// Fetch each additional page for each language
	for (const lang of languages) {
		console.log(`Fetching additional pages for language: ${lang}`);

		for (const pageId of additionalPages) {
			const pageUrl = `${KIRBY_URL}/${lang}/${pageId}`;
			const pageSavePath = path.join(contentDir, lang, `${pageId}.json`);

			await fetchAndSaveJson(pageUrl, pageSavePath);
		}
	}

	// Also fetch root versions of additional pages (without language prefix)
	console.log('Fetching additional pages for root (no language prefix)');
	for (const pageId of additionalPages) {
		const pageUrl = `${KIRBY_URL}/${pageId}`;
		const pageSavePath = path.join(contentDir, `${pageId}.json`);

		await fetchAndSaveJson(pageUrl, pageSavePath);
	}
}

// Function to fetch the non-language specific versions of all pages
async function fetchRootPages(KIRBY_URL, contentDir, indexData) {
	console.log(`\n=== Processing root pages (no language prefix) ===`);
	const rootProcessedIds = new Set();

	// Process each page in the root index
	await processAllPages(KIRBY_URL, null, indexData, contentDir);
}

export default function astroKirbySync() {
	return {
		name: 'astro-kirby-sync',
		hooks: {
			'astro:config:setup': async ({ config }) => {
				try {
					// Ensure KIRBY_URL doesn't end with a slash
					const KIRBY_URL = process.env.KIRBY_URL?.replace(/\/$/, '');
					if (!KIRBY_URL) {
						throw new Error('KIRBY_URL environment variable is required');
					}

					console.log(`Using Kirby URL: ${KIRBY_URL}`);
					const contentDir = path.join(process.cwd(), 'public', 'content');
					console.log(`Content directory: ${contentDir}`);

					// Clear existing content directory if it exists
					if (fs.existsSync(contentDir)) {
						console.log('Clearing existing content directory...');
						fs.rmSync(contentDir, { recursive: true, force: true });
					}
					fs.mkdirSync(contentDir, { recursive: true });

					// Fetch the root global.json first
					console.log('Fetching root global configuration...');
					const rootGlobal = await fetchAndSaveJson(
						`${KIRBY_URL}/global`,
						path.join(contentDir, 'global.json')
					);

					if (!rootGlobal) {
						throw new Error('Failed to fetch root global configuration');
					}

					// Fetch the root index.json (contains all pages)
					console.log('Fetching root index...');
					const rootIndex = await fetchAndSaveJson(
						`${KIRBY_URL}/index`,
						path.join(contentDir, 'index.json')
					);

					if (!rootIndex) {
						console.warn(
							'Failed to fetch root index, continuing with language-specific indexes'
						);
					} else {
						// Fetch all root-level pages (without language prefix)
						await fetchRootPages(KIRBY_URL, contentDir, rootIndex);
					}

					// Determine languages
					const languages = [
						rootGlobal.defaultLang.code,
						...rootGlobal.translations.map((t) => t.code),
					];
					console.log(`Found languages: ${languages.join(', ')}`);

					// Create a map to store known page translations
					const translatedPageIds = new Map();

					// Process each language
					for (const lang of languages) {
						console.log(`\n=== Processing language: ${lang} ===`);

						// Create language directory
						const langDir = path.join(contentDir, lang);
						fs.mkdirSync(langDir, { recursive: true });

						// Fetch language-specific global.json
						console.log(`Fetching ${lang} global configuration...`);
						const langGlobal = await fetchAndSaveJson(
							`${KIRBY_URL}/${lang}/global`,
							path.join(contentDir, lang, 'global.json')
						);

						// Fetch main index
						const indexUrl = `${KIRBY_URL}/${lang}/index`;
						const indexPath = path.join(contentDir, lang, 'index.json');
						const indexData = await fetchAndSaveJson(indexUrl, indexPath);

						if (!indexData) {
							console.error(`Failed to fetch index for language ${lang}`);
							continue;
						}

						// Extract translated page IDs from index data
						if (Array.isArray(indexData)) {
							for (const page of indexData) {
								if (page && page.id && page.translations) {
									// Store translations for this page
									if (!translatedPageIds.has(page.id)) {
										translatedPageIds.set(page.id, new Set([page.id]));
									}

									// Add all translations of this page
									const translations = translatedPageIds.get(page.id);
									Object.values(page.translations).forEach((translatedId) => {
										if (translatedId) {
											translations.add(translatedId);

											// Also create bi-directional mapping
											if (!translatedPageIds.has(translatedId)) {
												translatedPageIds.set(
													translatedId,
													new Set([translatedId, page.id])
												);
											} else {
												translatedPageIds.get(translatedId).add(page.id);
											}
										}
									});
								}
							}
						}

						// Process all pages (the index is an array of pages)
						await processAllPages(KIRBY_URL, lang, indexData, contentDir);
					}

					// Fetch additional content pages that might not be in the index
					// Pass the translatedPageIds map to ensure we get all translation variants
					await fetchAdditionalPages(
						KIRBY_URL,
						contentDir,
						languages,
						translatedPageIds
					);

					console.log('\n✨ Kirby content sync completed');
				} catch (error) {
					console.error('Error in astro-kirby-sync plugin:', error);
					throw error;
				}
			},
		},
	};
}
