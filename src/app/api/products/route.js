import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { ALL_PRODUCTS_QUERY } from '@/sanity/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await client.fetch(ALL_PRODUCTS_QUERY);
    return NextResponse.json(products || []);
  } catch (err) {
    console.error("Error fetching products in API route:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
