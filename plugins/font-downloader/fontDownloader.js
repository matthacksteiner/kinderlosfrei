import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export default function fontDownloader() {
	return {
		name: 'font-downloader',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				try {
					const API_URL = process.env.KIRBY_URL;
					if (!API_URL) {
						logger.warn('KIRBY_URL environment variable is not set');
						return;
					}

					// Create fonts directory
					const fontsDir = path.resolve('./public/fonts');
					if (!fs.existsSync(fontsDir)) {
						fs.mkdirSync(fontsDir, { recursive: true });
					}

					// Clean old font files except fonts.json
					const files = fs.readdirSync(fontsDir);
					for (const file of files) {
						if (file !== 'fonts.json') {
							fs.unlinkSync(path.join(fontsDir, file));
						}
					}

					// Fetch global data
					const response = await fetch(API_URL + '/global.json');
					if (!response.ok) {
						logger.error(`Failed to fetch global.json: ${response.status}`);
						return;
					}

					const global = await response.json();
					const fonts = global.font;

					if (!fonts || fonts.length === 0) {
						fs.writeFileSync(
							path.join(fontsDir, 'fonts.json'),
							JSON.stringify({ fonts: [] })
						);
						return;
					}

					// Download fonts
					const fontData = [];

					for (const font of fonts) {
						const safeName = font.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

						// Process both formats together
						const formats = [
							{ url: font.url2, filename: `${safeName}.woff2`, type: 'woff2' },
							{ url: font.url1, filename: `${safeName}.woff`, type: 'woff' },
						];

						const fontEntry = { name: font.name };
						let anySuccess = false;

						for (const format of formats) {
							if (!format.url) continue;

							try {
								const fontResponse = await fetch(format.url);
								if (fontResponse.ok) {
									const arrayBuffer = await fontResponse.arrayBuffer();
									const buffer = Buffer.from(arrayBuffer);
									fs.writeFileSync(
										path.join(fontsDir, format.filename),
										buffer
									);
									fontEntry[format.type] = `/fonts/${format.filename}`;
									anySuccess = true;
								}
							} catch (error) {
								logger.error(
									`Error downloading ${format.type} for ${font.name}`
								);
							}
						}

						if (anySuccess) {
							fontData.push(fontEntry);
							logger.info(`Downloaded font: ${font.name}`);
						}
					}

					// Save font metadata
					fs.writeFileSync(
						path.join(fontsDir, 'fonts.json'),
						JSON.stringify({ fonts: fontData })
					);

					logger.info(`Downloaded ${fontData.length} fonts to public/fonts`);
				} catch (error) {
					logger.error('Error in font-downloader plugin:', error);
				}
			},
		},
	};
}
