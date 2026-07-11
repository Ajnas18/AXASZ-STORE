import { client } from '@/sanity/client';
import { ALL_PRODUCTS_QUERY } from '@/sanity/queries';
import HomeClient from './HomeClient';

export default async function Home() {
  let products = [];
  try {
    products = await client.fetch(
      ALL_PRODUCTS_QUERY,
      {},
      { next: { tags: ['products'] } }
    );
  } catch (err) {
    console.error("Failed to fetch products from Sanity:", err);
  }

  return <HomeClient initialProducts={products} />;
}
