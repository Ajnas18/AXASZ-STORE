import { client } from '@/sanity/client';
import { ALL_PRODUCTS_QUERY } from '@/sanity/queries';
import HomeClient from './HomeClient';

export default async function Home() {
  const products = await client.fetch(
    ALL_PRODUCTS_QUERY,
    {},
    { next: { tags: ['products'] } }
  );

  return <HomeClient initialProducts={products} />;
}
