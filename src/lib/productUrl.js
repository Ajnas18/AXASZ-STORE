/**
 * AXASZSTORE Product URL & Slug Utilities
 */

/**
 * Returns the canonical production site URL.
 * Falls back to https://axaszstore.com if not configured or in local development.
 */
export function getProductionSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
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
 * Example: "https://axaszstore.com/product/nike-air-max-270"
 */
export function getProductUrl(product) {
  const slug = getProductSlug(product);
  const baseUrl = getProductionSiteUrl();
  return `${baseUrl}/product/${slug}`;
}

/**
 * Returns the formatted share message for social platforms and messaging apps.
 */
export function getProductShareText(product, url) {
  const productUrl = url || getProductUrl(product);
  const name = product?.name || 'Sneaker';
  return `Check out this product from AXASZSTORE: ${name} ${productUrl}`;
}
