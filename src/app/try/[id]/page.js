import { client } from '@/sanity/client';
import { SINGLE_PRODUCT_QUERY } from '@/sanity/queries';
import { urlFor } from '@/sanity/client';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import styles from './page.module.css';

export default async function TryPage({ params }) {
  const { id } = await params;
  let product = null;
  try {
    product = await client.fetch(SINGLE_PRODUCT_QUERY, { id });
  } catch (err) {
    console.error("Failed to fetch product detail from Sanity:", err);
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product Not Found</h1>
        <Link href="/">
          <button className={styles.backBtn}>Back to Store</button>
        </Link>
      </div>
    );
  }

  // Use modelImage if available, else fallback to standard image
  const displayImageUrl = product.modelImage 
    ? urlFor(product.modelImage).url() 
    : (product.image 
        ? urlFor(product.image).url() 
        : (product.images && product.images.length > 0 
            ? urlFor(product.images[0]).url() 
            : '/placeholder1.jpg'));


  return (
    <main className={styles.container}>
      <div className={styles.imageWrapper}>
        <img src={displayImageUrl} alt={`Model wearing ${product.name}`} className={styles.heroImage} />
        <div className={styles.overlay}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <Link href="/#products" className={styles.backLink}>
            <ArrowLeft size={24} />
            <span>Back to Store</span>
          </Link>
        </div>

        <div className={styles.productInfo}>
          <div className={styles.brandBadge}>{product.brand}</div>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.price}>₹{product.price.toLocaleString()}</p>
          
          {!product.modelImage && (
            <p className={styles.fallbackNotice}>
              *Model view not available yet. Showing standard product image.
            </p>
          )}

          <div className={styles.actions}>
            <Link href={`/#products`}>
              <button className={styles.buyBtn}>
                <ShoppingBag size={20} />
                Buy Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
