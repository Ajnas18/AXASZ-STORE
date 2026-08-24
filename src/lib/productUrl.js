/**
 * AXASZSTORE Product URL & Slug Utilities
 */

/**
 * Returns the canonical production site URL.
 * Automatically resolves current browser origin in the client,
 * and Vercel / environment variables on the server.
 */
export function getProductionSiteUrl() {
  // 1. In browser, use the current active domain/origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // 2. On server, check environment variables in priority order
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '') ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

  if (rawUrl) {
    const formatted = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    return formatted.replace(/\/$/, '');
  }

  return 'https://axaszstore.com';
}

/**
 * Converts any string into a clean, URL-safe slug.
 * Example: "Nike Air Max 270" -> "nike-air-max-270"
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Generates or extracts the unique slug for a given product.
 */
export function getProductSlug(product) {
  if (!product) return '';
  if (product.slug?.current) {
    return product.slug.current;
  }
  if (typeof product.slug === 'string' && product.slug) {
    return product.slug;
  }
  if (product.name) {
    return slugify(product.name);
  }
  if (product.productCode) {
    return slugify(product.productCode);
  }
  return product._id || product.id || '';
}

/**
 * Returns the absolute canonical URL for a product.
 * Example: "https://your-vercel-domain.vercel.app/product/nike-air-max-270"
 */
export function getProductUrl(product) {
  const slug = getProductSlug(product);
  const baseUrl = getProductionSiteUrl();
  return baseUrl ? `${baseUrl}/product/${slug}` : `/product/${slug}`;
}

/**
 * Returns the formatted share message for social platforms and messaging apps.
 */
export function getProductShareText(product, url) {
  const productUrl = url || getProductUrl(product);
  const name = product?.name || 'Sneaker';
  return `Check out this product from AXASZSTORE: ${name} ${productUrl}`;
}
