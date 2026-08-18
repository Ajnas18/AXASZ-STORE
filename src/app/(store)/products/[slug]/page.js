import { redirect } from 'next/navigation';

export default async function ProductsRedirectPage({ params }) {
  const { slug } = await params;
  redirect(`/product/${slug}`);
}
