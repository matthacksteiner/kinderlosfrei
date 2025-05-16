# Netlify Remote Images Plugin

This plugin automatically updates the `remote_images` setting in the `netlify.toml` file to use the `KIRBY_URL` from your environment variables.

## How it works

1. Reads the `KIRBY_URL` from your `.env` file
2. Updates the `netlify.toml` file's `remote_images` setting to point to `KIRBY_URL/media/.*`
3. Provides console feedback about the update

## Usage

Add the plugin to your `astro.config.mjs` file:

```js
import netlifyRemoteImages from './plugins/netlify-remote-images/netlifyRemoteImages.js';

// In your Astro config
export default defineConfig({
	integrations: [
		netlifyRemoteImages(),
		// other integrations...
	],
});
```

Make sure your `.env` file has the `KIRBY_URL` variable set:

```
KIRBY_URL=https://your-kirby-cms-url.com
```

The plugin will run during the Astro build process and update the `netlify.toml` file automatically.
