import fs from 'fs';
import path from 'path';

export default function langFolderRename() {
	return {
		name: 'lang-folder-rename',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				try {
					const API_URL = process.env.KIRBY_URL;
					if (!API_URL) {
						logger.warn('KIRBY_URL environment variable is not set');
						return;
					}

					const response = await fetch(API_URL + '/global.json');
					const global = await response.json();
					const translations = global.translations;

					const pagesDir = path.resolve('./src/pages');
					const langFolder = path.join(pagesDir, '[lang]');
					const noLangFolder = path.join(pagesDir, '_[lang]');

					// Check if translations is empty or has length 0
					if (!translations || translations.length === 0) {
						// Only rename if [lang] exists and _[lang] doesn't
						if (fs.existsSync(langFolder) && !fs.existsSync(noLangFolder)) {
							fs.renameSync(langFolder, noLangFolder);
							logger.info(
								'NO translations found. Renamed [lang] folder to _[lang]'
							);
						}
					} else {
						// Rename back to [lang] if translations exist and _[lang] exists
						if (fs.existsSync(noLangFolder) && !fs.existsSync(langFolder)) {
							fs.renameSync(noLangFolder, langFolder);
							logger.info(
								'Translation found. Renamed _[lang] folder back to [lang]'
							);
						}
					}
				} catch (error) {
					logger.error('Error in lang-folder-rename plugin:', error);
					// Don't fail the build if plugin errors
					if (process.env.NETLIFY) {
						logger.warn('Continuing build despite plugin error on Netlify');
					}
				}
			},
			'astro:build:done': async ({ logger }) => {
				try {
					const pagesDir = path.resolve('./src/pages');
					const langFolder = path.join(pagesDir, '[lang]');
					const noLangFolder = path.join(pagesDir, '_[lang]');

					// Always try to restore to [lang] after build
					if (fs.existsSync(noLangFolder) && !fs.existsSync(langFolder)) {
						fs.renameSync(noLangFolder, langFolder);
						logger.info('Restored folder name back to [lang] after build');
					}
				} catch (error) {
					logger.error('Error restoring folder name:', error);
					// Don't fail the build if plugin errors
					if (process.env.NETLIFY) {
						logger.warn('Continuing build despite plugin error on Netlify');
					}
				}
			},
		},
	};
}
