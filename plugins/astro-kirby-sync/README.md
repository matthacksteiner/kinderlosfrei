# Astro Kirby Sync Plugin

This plugin synchronizes content from a Kirby CMS installation to your Astro project during build time, enabling static site generation with content from Kirby. **Now with intelligent incremental sync!**

## How it works

1. Fetches content from the Kirby CMS using the `KIRBY_URL` environment variable
2. **Uses SHA-256 content hashing to detect changes and only sync modified content**
3. Downloads and saves content as JSON files to `public/content`
4. Organizes content by language, preserving the original content structure
5. Skips content sync in development mode (for faster local development)
6. **Maintains a sync state file (`.sync-state.json`) to track content changes**

## Features

### ✨ Incremental Sync (New!)

- **Smart content detection**: Only downloads content that has actually changed
- **SHA-256 hashing**: Generates content fingerprints to detect modifications
- **Sync state tracking**: Maintains a history of content hashes and sync timestamps
- **Automatic fallback**: Falls back to full sync if incremental sync fails
- **Performance boost**: Significantly faster builds for large content repositories

### 🛡️ Reliability

- Robust error handling with retries for network issues
- Language-aware content structure
- Production build requirements (ensures content is available)
- Special handling for Netlify builds
- Preserves content structure with proper nesting

### 🔧 Control Options

- **Force full sync**: Set `FORCE_FULL_SYNC=true` to bypass incremental sync
- **Development mode**: Automatically skips sync during `astro dev`
- **Build mode**: Performs intelligent sync during `astro build`

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

## Environment Variables

### Required

```env
KIRBY_URL=https://your-kirby-cms-url.com
```

### Optional

```env
# Force a complete content sync (bypasses incremental sync)
FORCE_FULL_SYNC=true

# Set to production for stricter error handling
NODE_ENV=production
```

## How Incremental Sync Works

1. **First Build**: Performs a full sync and creates `.sync-state.json`
2. **Subsequent Builds**:

   - Loads the previous sync state
   - Fetches content from CMS
   - Compares SHA-256 hashes of each piece of content
   - Only downloads and saves content that has changed
   - Updates sync state with new hashes and timestamp

3. **Fallback Strategy**: If incremental sync fails for any reason, automatically falls back to full sync

## Sync State File

The plugin creates a `kirby-sync-state.json` file in your `.astro` directory (not in `public/content`):

```json
{
	"lastSync": "2024-01-15T10:30:00.000Z",
	"version": "1.0.0",
	"contentHashes": {
		"https://cms.example.com/global.json": "a1b2c3d4...",
		"https://cms.example.com/index.json": "e5f6g7h8...",
		"https://cms.example.com/about.json": "i9j0k1l2..."
	}
}
```

## Build Output Examples

### Incremental Sync (Content Changed)

```
🔄 Production build detected, running content sync...
🔄 Performing incremental content sync...
🕐 Last sync: 1/15/2024, 10:30:00 AM

🔍 Checking default language (en)...
  ↳ Updated about.json
  ↳ Updated services.json

🔍 Checking language: de...
  ↳ Updated about.json

✨ Incremental sync completed! Updated 3/25 files.
```

### Incremental Sync (No Changes)

```
🔄 Production build detected, running content sync...
🔄 Performing incremental content sync...
🕐 Last sync: 1/15/2024, 10:30:00 AM

🔍 Checking default language (en)...
🔍 Checking language: de...

✨ Content is up-to-date! Checked 25 files, no changes found.
```

### First Build or Forced Full Sync

```
🔄 Production build detected, running content sync...
🔄 Performing incremental content sync...
📦 No previous sync found, performing full sync...

🔄 Performing full content sync...
🧹 Cleaning existing content...
📚 Found languages: en, de

📥 Syncing default language (en)...
  ↳ Updated global.json
  ↳ Updated index.json
  ↳ Updated about.json
  ↳ Updated services.json
  ...

📥 Syncing language: de...
  ↳ Updated global.json
  ↳ Updated index.json
  ↳ Updated about.json
  ...

✨ Full content sync completed successfully!
```

## Performance Benefits

- **Faster builds**: Only processes changed content
- **Reduced bandwidth**: Downloads only what's necessary
- **Better CI/CD**: Shorter build times in continuous deployment
- **Scalability**: Performance improves as content grows

## Troubleshooting

### Force Full Sync

If you suspect sync issues, force a complete rebuild:

```bash
FORCE_FULL_SYNC=true npm run build
```

### Clear Sync State

Delete the sync state to start fresh:

```bash
rm .astro/kirby-sync-state.json
```

### Debug Sync Issues

The plugin provides detailed logging of what content is being checked and updated during each build.
