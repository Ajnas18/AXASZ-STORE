import { NextResponse } from 'next/server';
import { urlFor } from '@/sanity/client';

export async function OPTIONS(request) {
  const origin = request.headers.get('origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-revalidate-secret',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request) {
  const origin = request.headers.get('origin') || '*';
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-revalidate-secret',
  };

  try {
    // 1. Verify webhook secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret') || request.headers.get('x-revalidate-secret');

    if (!secret || secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing token' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { _id, name, brand, price, productCode, image } = body;

    if (!_id || !name) {
      return NextResponse.json(
        { error: 'Bad Request: Missing product ID or name' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Resolve image URL to our local JPEG proxy endpoint
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const imageUrl = `${appUrl}/api/instagram-image/${_id}/sneaker.jpg`;

    // 4. Construct beautiful Instagram caption
    const tryUrl = `${appUrl}/try/${_id}`;
    
    const cleanBrandTag = brand ? brand.toLowerCase().replace(/[^a-z0-9]/g, '') : 'sneakers';

    const caption = `🔥 NEW DROP: ${name}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Brand: ${brand || 'AXASZ'}\n` +
      `SKU: ${productCode || 'N/A'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Check our website for price & details! 👟\n` +
      `Virtual Try-on & Shop → ${tryUrl}\n\n` +
      `#sneakers #axaszstore #sneakerhead #kicks #${cleanBrandTag} #freshkicks`;

    // 5. Send to Zapier
    const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;
    if (!zapierUrl) {
      console.log('ZAPIER_WEBHOOK_URL is not set. Mocking success response:', { imageUrl, caption });
      return NextResponse.json({
        success: true,
        mocked: true,
        message: 'Zapier URL is not configured. Mocked payload generated successfully.',
        data: {
          productId: _id,
          name,
          brand,
          price,
          productCode,
          imageUrl,
          tryUrl,
          caption
        }
      }, { headers: corsHeaders });
    }

    const response = await fetch(zapierUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: _id,
        name,
        brand,
        price,
        productCode,
        imageUrl,
        tryUrl,
        caption
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: `Zapier webhook rejected request: ${response.status} - ${errorText}`
      }, { status: 502, headers: corsHeaders });
    }

    return NextResponse.json({
      success: true,
      message: 'Product formatted and forwarded to Zapier successfully!'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error in Instagram webhook route:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
