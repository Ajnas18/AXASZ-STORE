import { client } from '@/sanity/client';
import { ALL_PRODUCTS_QUERY } from '@/sanity/queries';
import HomeClient from './HomeClient';

export default async function Home() {
  const products = await client.fetch(ALL_PRODUCTS_QUERY);

  // You can set up revalidation here if you want:
  // e.g. export const revalidate = 60; // revalidate every 60 seconds

  return <HomeClient initialProducts={products} />;
}
