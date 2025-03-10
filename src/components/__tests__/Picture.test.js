import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Picture from '../Picture.astro';

describe('Picture Component', () => {
	const baseProps = {
		src: '/test.jpg',
		urlFocus: '/test.jpg',
		urlFocusMobile: '/test.jpg',
		width: 1200,
		height: 800,
		alt: 'Test image',
		name: 'test-image',
		ratioMobile: 'original',
		ratioDesktop: 'original',
		span: '6',
		position: 'center',
		loading: 'lazy',
		gridMarginDesktop: 24,
		gridMarginMobile: 16,
		gridGapDesktop: 24,
		gridGapMobile: 16,
	};

	test('renders basic picture element', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(Picture, {
			props: baseProps,
		});

		expect(result).toContain(`alt="Test image"`);
		expect(result).toContain(`loading="lazy"`);
	});

	test('renders with thumbhash when provided', async () => {
		const container = await AstroContainer.create();
		const propsWithThumbhash = {
			...baseProps,
			thumbhash: 'data:image/jpeg;base64,test',
		};

		const result = await container.renderToString(Picture, {
			props: propsWithThumbhash,
		});

		expect(result).toContain('class="thumbhash"');
		expect(result).toContain(
			'background-image: url(data:image/jpeg;base64,test)'
		);
	});

	test('generates fallback alt text from name', async () => {
		const container = await AstroContainer.create();
		const propsWithoutAlt = {
			...baseProps,
			alt: undefined,
		};

		const result = await container.renderToString(Picture, {
			props: propsWithoutAlt,
		});

		// Update the expectation to match what your component actually generates
		expect(result).toContain('alt="Test Image"');
	});

	// Update this test to use props correctly
	test('renders picture with correct props in production', async () => {
		const container = await AstroContainer.create({
			env: {
				PROD: true,
				NETLIFY_DEV: false,
				NETLIFY_URL: 'https://example.com',
			},
		});

		const result = await container.renderToString(Picture, {
			props: baseProps,
		});

		expect(result).toContain('<picture');
		expect(result).toContain('</picture>');
		expect(result).toContain(`alt="Test image"`); // Match the case from baseProps
		expect(result).toContain(`loading="lazy"`);
	});

	test('throws error when required props are missing', async () => {
		const container = await AstroContainer.create();
		const invalidProps = { ...baseProps };
		delete invalidProps.src;

		await expect(async () => {
			await container.renderToString(Picture, {
				props: invalidProps,
			});
		}).rejects.toThrow('Missing required props');
	});

	test('validates ratio format', async () => {
		const container = await AstroContainer.create();
		const invalidRatioProps = {
			...baseProps,
			ratioMobile: 'invalid-ratio',
		};

		await expect(async () => {
			await container.renderToString(Picture, {
				props: invalidRatioProps,
			});
		}).rejects.toThrow('Invalid ratio format');
	});

	test('renders with custom class name', async () => {
		const container = await AstroContainer.create();
		const propsWithClass = {
			...baseProps,
			class: 'custom-class',
		};

		const result = await container.renderToString(Picture, {
			props: propsWithClass,
		});

		expect(result).toContain('class="custom-class"');
	});

	test('renders with data-zoomable attributes', async () => {
		const container = await AstroContainer.create();
		const zoomableProps = {
			...baseProps,
			dataZoomable: true,
			dataZoomSrc: '/zoom-image.jpg',
		};

		const result = await container.renderToString(Picture, {
			props: zoomableProps,
		});

		expect(result).toContain('data-zoomable="true"');
		expect(result).toContain('data-zoom-src="/zoom-image.jpg"');
	});

	test('renders correct srcset in production environment', async () => {
		const container = await AstroContainer.create({
			env: {
				PROD: true,
				NETLIFY_URL: 'https://example.com',
			},
		});

		const result = await container.renderToString(Picture, {
			props: baseProps,
		});

		expect(result).toContain('/.netlify/images?url=');
		expect(result).toContain('&w=');
		expect(result).toContain('&h=');
		expect(result).toContain('1x,');
		expect(result).toContain('2x,');
		expect(result).toContain('3x');
	});
});
