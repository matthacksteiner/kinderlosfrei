export const prerender = false;

export async function GET({ request, url }) {
	// Get the font URL from the query parameter
	const fontUrl = url.searchParams.get('url');

	if (!fontUrl) {
		return new Response('Font URL is required', { status: 400 });
	}

	try {
		// Fetch the font file from the CMS
		const response = await fetch(fontUrl);

		if (!response.ok) {
			return new Response(`Failed to fetch font: ${response.status}`, {
				status: response.status,
			});
		}

		// Get the font data as array buffer
		const fontData = await response.arrayBuffer();

		// Determine content type based on file extension
		let contentType = 'font/woff';
		if (fontUrl.endsWith('.woff2')) {
			contentType = 'font/woff2';
		} else if (fontUrl.endsWith('.ttf')) {
			contentType = 'font/ttf';
		}

		// Return the font with proper headers
		return new Response(fontData, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000',
				'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
			},
		});
	} catch (error) {
		console.error('Error proxying font:', error);
		return new Response(`Error proxying font: ${error.message}`, {
			status: 500,
		});
	}
}
