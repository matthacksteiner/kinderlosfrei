// Simple Astro integration for astro-kirby-sync
export default function astroKirbySync() {
	return {
		name: 'astro-kirby-sync',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				// In development, just log that we're skipping sync
				if (process.env.NODE_ENV === 'development') {
					logger.info(
						'🔄 Development mode: Content sync handled by Netlify Build Plugin'
					);
					return;
				}

				// In production, the actual sync is handled by the Netlify Build Plugin
				logger.info(
					'🔄 Production mode: Content sync handled by Netlify Build Plugin'
				);
			},
		},
	};
}
