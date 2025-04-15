export const prerender = false;

export async function GET({ request, url }) {
	// Get the font URL from the query parameter
	const fontUrl = url.searchParams.get('url');
	console.log('Font proxy request for:', fontUrl);

	if (!fontUrl) {
		console.error('Font URL is missing in request');
		return new Response('Font URL is required', { status: 400 });
	}

	try {
		// Fetch the font file from the CMS
		console.log('Fetching font from:', fontUrl);
		const response = await fetch(fontUrl);

		if (!response.ok) {
			console.error(
				`Failed to fetch font: ${response.status} - ${response.statusText}`
			);
			return new Response(`Failed to fetch font: ${response.status}`, {
				status: response.status,
			});
		}

		// Get the font data as array buffer
		const fontData = await response.arrayBuffer();
		console.log('Font fetched successfully, size:', fontData.byteLength);

		// Determine content type based on file extension
		let contentType = 'font/woff';
		if (fontUrl.endsWith('.woff2')) {
			contentType = 'font/woff2';
		} else if (fontUrl.endsWith('.ttf')) {
			contentType = 'font/ttf';
		}
		console.log('Using content type:', contentType);

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
