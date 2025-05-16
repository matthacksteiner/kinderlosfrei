# Astro Kirby Sync Plugin

This plugin synchronizes content from a Kirby CMS installation to your Astro project during build time, enabling static site generation with content from Kirby.

## How it works

1. Fetches content from the Kirby CMS using the `KIRBY_URL` environment variable
2. Downloads and saves all content as JSON files to `public/content`
3. Organizes content by language, preserving the original content structure
4. Skips content sync in development mode (for faster local development)

## Features

- Robust error handling with retries for network issues
- Language-aware content structure
- Production build requirements (ensures content is available)
- Special handling for Netlify builds
- Preserves content structure with proper nesting

## Usage

Add the plugin to your `astro.config.mjs` file:

```js
import astroKirbySync from './plugins/astro-kirby-sync/astro-kirby-sync.js';

// In your Astro config
export default defineConfig({
	integrations: [
		astroKirbySync(),
		// other integrations...
	],
});
```

Make sure your `.env` file has the `KIRBY_URL` variable set:

```
KIRBY_URL=https://your-kirby-cms-url.com
```

The plugin will:

- Skip content sync during development (`astro dev`)
- Perform a full content sync during builds (`astro build`)
- Create a structured content directory for static generation
