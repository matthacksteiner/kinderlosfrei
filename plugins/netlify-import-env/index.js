import fs from 'fs';
import toml from '@iarna/toml';
import dotenv from 'dotenv';

export default {
	onPreBuild: async ({ utils }) => {
		try {
			// Load .env file
			dotenv.config();

			// Get KIRBY_URL from .env
			const kirbyUrl = process.env.KIRBY_URL + '/media/.*';

			// Load netlify.toml
			const netlifyConfig = toml.parse(
				await fs.promises.readFile('./netlify.toml', 'utf-8')
			);

			// Update remote_images
			netlifyConfig.images.remote_images = [kirbyUrl];

			// Write back to netlify.toml
			await fs.promises.writeFile(
				'./netlify.toml',
				toml.stringify(netlifyConfig)
			);
		} catch (error) {
			utils.build.failBuild('Failure message', { error });
		}
	},
};
