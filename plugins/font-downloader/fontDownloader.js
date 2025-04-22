import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import chalk from 'chalk';

export default function fontDownloader() {
	return {
		name: 'font-downloader',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				try {
					const pluginName = chalk.magenta.bold('🔤 [Font Downloader]');
					const API_URL = process.env.KIRBY_URL;
					if (!API_URL) {
						logger.warn(
							`${pluginName} ${chalk.yellow(
								'⚠️ KIRBY_URL environment variable is not set'
							)}`
						);
						return;
					}

					// Create fonts directory
					const fontsDir = path.resolve('./public/fonts');
					if (!fs.existsSync(fontsDir)) {
						fs.mkdirSync(fontsDir, { recursive: true });
						logger.info(
							`${pluginName} ${chalk.green('✓')} ${chalk.dim(
								'Created fonts directory'
							)}`
						);
					}

					// Clean old font files except fonts.json
					const files = fs.readdirSync(fontsDir);
					for (const file of files) {
						if (file !== 'fonts.json') {
							fs.unlinkSync(path.join(fontsDir, file));
						}
					}
					logger.info(
						`${pluginName} ${chalk.green('✓')} ${chalk.dim(
							'Cleaned old font files'
						)}`
					);

					// First check if we have local content
					const contentDir = path.resolve('./public/content');
					const globalPath = path.join(contentDir, 'global.json');

					let global;
					if (fs.existsSync(globalPath)) {
						// Use local content
						logger.info(
							`${pluginName} ${chalk.cyan('ℹ')} ${chalk.dim(
								'Using local content for font download'
							)}`
						);
						const globalContent = fs.readFileSync(globalPath, 'utf-8');
						global = JSON.parse(globalContent);
					} else {
						// Fetch global data from API as fallback
						logger.info(
							`${pluginName} ${chalk.cyan('ℹ')} ${chalk.dim(
								'Fetching global data from API for font download'
							)}`
						);
						const response = await fetch(API_URL + '/global.json');
						if (!response.ok) {
							logger.error(
								`${pluginName} ${chalk.red('✖')} Failed to fetch global.json: ${
									response.status
								}`
							);
							return;
						}
						global = await response.json();
					}

					const fonts = global.font;

					if (!fonts || fonts.length === 0) {
						fs.writeFileSync(
							path.join(fontsDir, 'fonts.json'),
							JSON.stringify({ fonts: [] })
						);
						logger.info(
							`${pluginName} ${chalk.yellow('⚠️')} ${chalk.dim(
								'No fonts found in configuration'
							)}`
						);
						return;
					}

					// Download fonts
					const fontData = [];
					for (const font of fonts) {
						const fontName = font.name;
						let woffPath = null;
						let woff2Path = null;

						// Download WOFF
						if (font.url1) {
							const woffResponse = await fetch(font.url1);
							if (woffResponse.ok) {
								const woffBuffer = Buffer.from(
									await woffResponse.arrayBuffer()
								);
								const fileName = path.basename(font.url1);
								fs.writeFileSync(path.join(fontsDir, fileName), woffBuffer);
								woffPath = `/fonts/${fileName}`;
								logger.info(
									`${pluginName} ${chalk.green('✓')} ${chalk.dim(
										`Downloaded WOFF: ${fontName}`
									)}`
								);
							}
						}

						// Download WOFF2
						if (font.url2) {
							const woff2Response = await fetch(font.url2);
							if (woff2Response.ok) {
								const woff2Buffer = Buffer.from(
									await woff2Response.arrayBuffer()
								);
								const fileName = path.basename(font.url2);
								fs.writeFileSync(path.join(fontsDir, fileName), woff2Buffer);
								woff2Path = `/fonts/${fileName}`;
								logger.info(
									`${pluginName} ${chalk.green('✓')} ${chalk.dim(
										`Downloaded WOFF2: ${fontName}`
									)}`
								);
							}
						}

						fontData.push({
							name: fontName,
							woff: woffPath,
							woff2: woff2Path,
						});
					}

					// Save font metadata
					fs.writeFileSync(
						path.join(fontsDir, 'fonts.json'),
						JSON.stringify({ fonts: fontData }, null, 2)
					);

					logger.info(
						`${pluginName} ${chalk.green.bold(
							'✨ Successfully downloaded'
						)} ${chalk.cyan.bold(fontData.length)} ${chalk.green.bold('fonts')}`
					);
				} catch (error) {
					const pluginName = chalk.magenta.bold('🔤 [Font Downloader]');
					logger.error(
						`${pluginName} ${chalk.red('✖ Error:')} ${chalk.red.dim(
							error.message
						)}`
					);
					// Don't fail the build if plugin errors
					if (process.env.NETLIFY) {
						logger.warn(
							`${pluginName} ${chalk.yellow(
								'⚠️ Continuing build despite plugin error on Netlify'
							)}`
						);
					}
				}
			},
		},
	};
}
