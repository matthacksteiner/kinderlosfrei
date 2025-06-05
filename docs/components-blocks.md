# Components and Blocks

The Baukasten-Astro project heavily relies on a component-based architecture, a core feature of Astro. This is further extended by a block system for rendering structured content fetched from Kirby CMS.

## Astro Components (`src/components/`)

- **Reusable UI Elements**: Components in `src/components/` are reusable pieces of UI, such as buttons, cards, navigation bars, sliders, accordions, etc.
- **.astro Files**: Most components are defined as `.astro` files. These files can contain a mix of HTML-like syntax, JavaScript (in the frontmatter script tag), and CSS (scoped by default).
- **Props**: Components accept `props` to customize their appearance and behavior. TypeScript is often used to define the shape of these props for better type safety (see `src/types/`).
- **Slots**: Astro components can use `<slot />` elements to allow parent components to pass down children, making them flexible and composable.
- **Client-Side Interactivity**: For components requiring client-side JavaScript, Astro offers client directives (e.g., `client:load`, `client:idle`, `client:visible`) to control how and when component scripts are loaded and hydrated in the browser. This helps in keeping the JavaScript footprint minimal.

## Content Blocks (`src/blocks/`)

The block system is a cornerstone of how content from Kirby CMS is rendered dynamically on the pages.

- **Mapping to Kirby Blocks**: Content in Kirby is often structured using "blocks" (e.g., a text block, an image block, a video block, a grid). Each type of block defined in Kirby has a corresponding Astro component in the `src/blocks/` directory.
  - For example, if Kirby has a "BlockText" type, there will be a `src/blocks/BlockText.astro` component.
- **Dynamic Rendering**: When a page is rendered, it iterates through the array of content blocks fetched from the CMS (e.g., the `contentBlocks` array in the JSON example from `content-management-api.md`).
- **`Astro.glob` or Dynamic Imports**: A common pattern is to use `Astro.glob('../blocks/*.astro')` to get references to all block components, or to dynamically import the correct block component based on the `type` property of the block data.
- **Props from CMS**: Each block component receives the data for that specific block from the CMS as props.
  - Example: `BlockImage.astro` might receive `props` like `image`, `alt`, `caption`.
- **Common Blocks**: The project includes a comprehensive set of common blocks:
  - `BlockText.astro`
  - `BlockImage.astro`
  - `BlockVideo.astro`
  - `BlockCard.astro`
  - `BlockSlider.astro`
  - `BlockGallery.astro`
  - `BlockAccordion.astro`
  - `BlockButtonBar.astro`
  - `BlockColumns.astro`
  - `BlockIconList.astro`
  - `BlockMenu.astro`
  - `BlockQuoteSlider.astro`
  - `BlockGrid.astro`
  - `BlockCode.astro`
  - `BlockVector.astro` (for SVG graphics)
  - `BlockLine.astro` / `BlockDivider.astro`
  - `BlockTitle.astro`

### Example: Rendering Blocks

A page component (e.g., `[...slug].astro`) might render blocks like this:

```astro
---
// Example: Simplified block rendering logic
import { Astro } from 'astro';

// Assume all block components are available or dynamically imported
// This is a conceptual example; actual implementation might vary
const blockComponents = {
	text: (await import('../blocks/BlockText.astro')).default,
	image: (await import('../blocks/BlockImage.astro')).default,
	// ... other block types
};

export async function getStaticPaths() {
	/* ... fetch paths ... */
}

const { entry } = Astro.props; // Assuming entry contains page data with contentBlocks
const contentBlocks = entry.data.contentBlocks || [];
---

<BaseLayout {...entry.data.seo}>
	<h1>{entry.data.title}</h1>
	<article>
		{
			contentBlocks.map((block) => {
				const Component = blockComponents[block.type];
				return Component ? (
					<Component {...block} />
				) : (
					<p>Unknown block type: {block.type}</p>
				);
			})
		}
	</article>
</BaseLayout>
```

This dynamic approach allows content editors to build diverse page layouts in Kirby, which are then faithfully rendered by Astro using the corresponding block components.

## Layouts (`src/layouts/`)

Layouts are special Astro components that define the overall structure of a page (e.g., header, footer, main content area). Content pages and components are typically rendered within a layout.

- `BaseLayout.astro`: Often a root layout providing HTML boilerplate, head metadata, and global styles.
- Other layouts might exist for specific page types (e.g., `PostLayout.astro`, `ProductLayout.astro`).
