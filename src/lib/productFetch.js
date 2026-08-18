import { readClient } from '@/sanity/client';
import { PRODUCT_BY_IDENTIFIER_QUERY, ALL_PRODUCTS_QUERY } from '@/sanity/queries';
import { getProductSlug, slugify } from '@/lib/productUrl';

/**
 * Fetches a product by slug, ID, or SKU with intelligent fallback resolution.
 */
export async function getProductByIdentifier(identifier) {
  if (!identifier) return null;
  const cleanId = decodeURIComponent(identifier).trim();

  try {
    // 1. Direct query matching slug, _id, productCode, or exact name
    const directProduct = await readClient.fetch(
      PRODUCT_BY_IDENTIFIER_QUERY,
      { slug: cleanId },
      { next: { tags: ['products', `product-${cleanId}`], revalidate: 60 } }
    );

    if (directProduct) {
      return directProduct;
    }

    // 2. Fallback: match against all products in catalog using generated slugs
    const allProducts = await readClient.fetch(
      ALL_PRODUCTS_QUERY,
      {},
      { next: { tags: ['products'], revalidate: 60 } }
    );

    if (Array.isArray(allProducts) && allProducts.length > 0) {
      const targetSlug = slugify(cleanId);
      const matched = allProducts.find((p) => {
        const pSlug = getProductSlug(p);
        const pNameSlug = slugify(p.name);
        const pCodeSlug = slugify(p.productCode);
        return (
          pSlug === targetSlug ||
          pNameSlug === targetSlug ||
          pCodeSlug === targetSlug ||
          p._id === cleanId ||
          p._id === identifier ||
          (p.productCode && p.productCode.toLowerCase() === cleanId.toLowerCase())
        );
      });

      if (matched) {
        return matched;
      }
    }
  } catch (error) {
    console.error("Error fetching product by identifier:", identifier, error);
  }

  return null;
}
