import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProductByIdentifier } from '@/lib/productFetch';
import { getProductUrl, getProductionSiteUrl } from '@/lib/productUrl';
import { readClient, urlFor } from '@/sanity/client';
import { ALL_PRODUCTS_QUERY } from '@/sanity/queries';
import ProductDetails from '@/components/store/ProductDetails';
import ProductCard from '@/components/store/ProductCard';
import styles from './page.module.css';

/**
 * Generate Dynamic SEO & Open Graph Metadata for Social Previews
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductByIdentifier(slug);

  if (!product) {
    return {
      title: 'Product Not Found | AXASZSTORE',
      description: 'The requested sneaker could not be found on AXASZSTORE.',
    };
  }

  const siteUrl = getProductionSiteUrl();
  const canonicalUrl = getProductUrl(product);
  const title = `${product.name} | AXASZSTORE`;
  const description = `Shop ${product.name} by ${product.brand || 'AXASZ'} at AXASZSTORE. 100% authentic sneakers with free delivery across India. ₹${product.price?.toLocaleString() || ''}`;

  let imageUrl = `${siteUrl}/logo.png`;
  try {
    if (product.image) {
      imageUrl = urlFor(product.image).width(1200).height(630).fit('crop').url();
    } else if (product.images && product.images.length > 0) {
      imageUrl = urlFor(product.images[0]).width(1200).height(630).fit('crop').url();
    }
  } catch (err) {
    console.error("Error generating OG image URL:", err);
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'AXASZSTORE',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductByIdentifier(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products (e.g. same brand or other popular sneakers)
  let relatedProducts = [];
  try {
    const allProducts = await readClient.fetch(
      ALL_PRODUCTS_QUERY,
      {},
      { next: { tags: ['products'], revalidate: 60 } }
    );
    if (Array.isArray(allProducts)) {
      // Filter out current product, prioritize same brand
      const sameBrand = allProducts.filter(
        (p) => p._id !== product._id && p.brand?.toLowerCase() === product.brand?.toLowerCase()
      );
      const otherBrands = allProducts.filter(
        (p) => p._id !== product._id && p.brand?.toLowerCase() !== product.brand?.toLowerCase()
      );
      relatedProducts = [...sameBrand, ...otherBrands].slice(0, 4);
    }
  } catch (err) {
    console.error("Error fetching related products:", err);
  }

  return (
    <main className={styles.pageContainer}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbWrapper}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={14} />
          <Link href="/#products">Store</Link>
          <ChevronRight size={14} />
          {product.brand && (
            <>
              <Link href={`/#products`}>{product.brand}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className={styles.breadcrumbActive}>{product.name}</span>
        </nav>
      </div>

      {/* Main Product Details Component */}
      <ProductDetails product={product} />

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <h2 className={styles.relatedTitle}>You May Also Like</h2>
            <Link href="/#products" style={{ color: '#777', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              View All Collection &rarr;
            </Link>
          </div>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
