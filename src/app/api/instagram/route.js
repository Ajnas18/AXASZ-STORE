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
    const validSecret = process.env.SANITY_REVALIDATE_SECRET || process.env.NEXT_PUBLIC_SANITY_REVALIDATE_SECRET;

    if (!secret || (validSecret && secret !== validSecret)) {
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
    const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://axasz-store.vercel.app';
    const appUrl = rawAppUrl.replace(/\/+$/, '');
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

    // 5. Post directly to Instagram via Meta Graph API (or fallback to Zapier/mock)
    const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
    const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;

    // Direct Instagram Graph API Integration
    if (instagramAccountId && instagramAccessToken) {
      // Step 5a: Create Media Container
      const containerUrl = new URL(`https://graph.facebook.com/v21.0/${instagramAccountId}/media`);
      containerUrl.searchParams.append('image_url', imageUrl);
      containerUrl.searchParams.append('caption', caption);
      containerUrl.searchParams.append('access_token', instagramAccessToken);

      const containerRes = await fetch(containerUrl.toString(), { method: 'POST' });
      const containerData = await containerRes.json();

      if (!containerRes.ok || !containerData.id) {
        console.error('Meta API Container Error:', containerData);
        return NextResponse.json({
          success: false,
          error: `Failed to create Instagram container: ${containerData.error?.message || JSON.stringify(containerData)}`
        }, { status: 502, headers: corsHeaders });
      }

      const creationId = containerData.id;

      // Small delay to ensure container processing is ready
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 5b: Publish Media Container
      const publishUrl = new URL(`https://graph.facebook.com/v21.0/${instagramAccountId}/media_publish`);
      publishUrl.searchParams.append('creation_id', creationId);
      publishUrl.searchParams.append('access_token', instagramAccessToken);

      const publishRes = await fetch(publishUrl.toString(), { method: 'POST' });
      const publishData = await publishRes.json();

      if (!publishRes.ok || !publishData.id) {
        console.error('Meta API Publish Error:', publishData);
        return NextResponse.json({
          success: false,
          error: `Failed to publish to Instagram: ${publishData.error?.message || JSON.stringify(publishData)}`
        }, { status: 502, headers: corsHeaders });
      }

      return NextResponse.json({
        success: true,
        message: 'Product successfully published directly to Instagram feed!',
        instagramPostId: publishData.id
      }, { headers: corsHeaders });
    }

    // Fallback: Check if Zapier URL is provided
    if (zapierUrl) {
      const response = await fetch(zapierUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    }

    // Fallback: Mock mode if neither is configured
    console.log('Neither INSTAGRAM_* nor ZAPIER_WEBHOOK_URL is set. Mocking success response:', { imageUrl, caption });
    return NextResponse.json({
      success: true,
      mocked: true,
      message: 'Instagram credentials not configured yet. Mock payload generated successfully.',
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

  } catch (error) {
    console.error('Error in Instagram webhook route:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
