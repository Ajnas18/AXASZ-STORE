import { NextResponse } from 'next/server';
import { client, urlFor } from '@/sanity/client';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return new Response('Missing product ID', { status: 400 });
    }

    // 1. Fetch product image metadata from Sanity
    const product = await client.fetch(
      `*[_type == "product" && _id == $id][0]{ image }`,
      { id }
    );

    if (!product || !product.image) {
      return new Response('Product or image not found', { status: 404 });
    }

    // 2. Generate Sanity CDN URL (Forcing JPG format and resizing to a safe 1000px width)
    let cdnUrl = urlFor(product.image).url();
    if (cdnUrl.includes('?')) {
      cdnUrl += '&fm=jpg&w=1000';
    } else {
      cdnUrl += '?fm=jpg&w=1000';
    }

    // 3. Fetch image binary from Sanity CDN
    const imageResponse = await fetch(cdnUrl);
    if (!imageResponse.ok) {
      return new Response('Failed to fetch image from source CDN', { status: 502 });
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Return the JPEG image binary with standard caching headers
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, must-revalidate',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error in Instagram image proxy route:', error);
    return new Response(error.message, { status: 500 });
  }
}
