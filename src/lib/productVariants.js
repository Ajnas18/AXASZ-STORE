import { urlFor } from '../sanity/client.js';

/**
 * Safely resolves a Sanity image object or string to a full URL.
 */
export function resolveImageUrl(img) {
  if (!img) return '';
  if (typeof img === 'string') return img;
  try {
    if (img.asset || img._type === 'image') {
      return urlFor(img).url();
    }
  } catch (err) {
    console.error('Error resolving image asset URL:', err);
  }
  return '';
}

/**
 * Returns a hex color, CSS color, or gradient for swatch rendering.
 * Handles single colors, dual colors (e.g. "Black/White"), and special sneaker colorways.
 */
export function getColorHex(name, customHex) {
  if (customHex && customHex.startsWith('#')) {
    return customHex;
  }
  if (!name) return '#e5e7eb';

  const n = name.trim().toLowerCase();

  // Dual tone colorways
  if (n.includes('black/white') || n.includes('panda') || n.includes('shadow')) {
    return 'linear-gradient(135deg, #111111 50%, #ffffff 50%)';
  }
  if (n.includes('white/black')) {
    return 'linear-gradient(135deg, #ffffff 50%, #111111 50%)';
  }
  if (n.includes('white/red') || n.includes('chicago') || n.includes('bred toe')) {
    return 'linear-gradient(135deg, #ffffff 50%, #dc2626 50%)';
  }
  if (n.includes('white/blue') || n.includes('white/navy')) {
    return 'linear-gradient(135deg, #ffffff 50%, #2563eb 50%)';
  }
  if (n.includes('white/green') || n.includes('white/volt')) {
    return 'linear-gradient(135deg, #ffffff 50%, #16a34a 50%)';
  }
  if (n.includes('bred') || n.includes('black/red')) {
    return 'linear-gradient(135deg, #111111 50%, #dc2626 50%)';
  }
  if (n.includes('royal')) {
    return 'linear-gradient(135deg, #111111 50%, #1d4ed8 50%)';
  }
  if (n.includes('checkerboard')) {
    return 'repeating-conic-gradient(#111111 0% 25%, #ffffff 0% 50%) 50% / 10px 10px';
  }

  // Single colorways
  if (n.includes('university blue') || n.includes('unc')) return '#60a5fa';
  if (n.includes('blue') || n.includes('cyan')) return '#3b82f6';
  if (n.includes('navy')) return '#1e3a8a';
  if (n.includes('red') || n.includes('crimson')) return '#ef4444';
  if (n.includes('green') || n.includes('pine')) return '#22c55e';
  if (n.includes('volt') || n.includes('lime')) return '#84cc16';
  if (n.includes('yellow') || n.includes('gold') || n.includes('mustard')) return '#eab308';
  if (n.includes('orange') || n.includes('rust') || n.includes('lava')) return '#ea580c';
  if (n.includes('purple') || n.includes('violet')) return '#a855f7';
  if (n.includes('pink') || n.includes('rose')) return '#ec4899';
  if (n.includes('black') || n.includes('core black') || n.includes('triple black')) return '#18181b';
  if (n.includes('white') || n.includes('triple white') || n.includes('cloud white') || n.includes('true white')) return '#f8fafc';
  if (n.includes('sea salt') || n.includes('sail') || n.includes('parchment') || n.includes('cream') || n.includes('bone')) return '#fef3c7';
  if (n.includes('grey') || n.includes('gray') || n.includes('core grey') || n.includes('silver')) return '#9ca3af';

  return '#94a3b8'; // Default slate
}

/**
 * Extracts and strictly isolates the gallery URLs belonging solely to the given variant.
 * Guaranteed never to combine or bleed images from other variants.
 */
export function getVariantGallery(variant) {
  if (!variant) return ['/placeholder1.jpg'];

  const gallery = [];

  // 1. Variant Cover Image
  const coverUrl = typeof variant.image === 'string' ? variant.image : resolveImageUrl(variant.image);
  if (coverUrl && !gallery.includes(coverUrl)) {
    gallery.push(coverUrl);
  }

  // 2. Variant Gallery Images
  if (Array.isArray(variant.images)) {
    variant.images.forEach((img) => {
      const url = typeof img === 'string' ? img : resolveImageUrl(img);
      if (url && !gallery.includes(url)) {
        gallery.push(url);
      }
    });
  }

  // 3. Variant Model Wearing Image
  const modelUrl = typeof variant.modelImage === 'string' ? variant.modelImage : resolveImageUrl(variant.modelImage);
  if (modelUrl && !gallery.includes(modelUrl)) {
    gallery.push(modelUrl);
  }

  // Safe fallback if variant currently has no images attached
  if (gallery.length === 0) {
    gallery.push('/placeholder1.jpg');
  }

  return gallery;
}

/**
 * Normalizes all product variants from Sanity or fallback structures.
 * Guarantees every returned variant has:
 * - variantId, asin, color, colorHex, price, originalPrice, sizes, inStock, image, images, modelImage, gallery[]
 */
export function normalizeProductVariants(product) {
  if (!product) return [];

  // Case 1: Product has explicit variants array defined
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants
      .filter(Boolean)
      .map((v, index) => {
        const colorName = (v.color || `Variant ${index + 1}`).trim();
        const variantId = v.variantId || `${product.productCode || product._id || 'VAR'}-${colorName.toUpperCase().replace(/[^A-Z0-9]/g, '') || index + 1}`;
        const asin = v.asin || '';
        const price = typeof v.price === 'number' ? v.price : product.price;
        const originalPrice = typeof v.originalPrice === 'number' ? v.originalPrice : (product.originalPrice || price);
        const inStock = v.inStock !== false;
        const sizes = Array.isArray(v.sizes) && v.sizes.length > 0 ? v.sizes : (product.sizes || []);
        
        const coverImg = resolveImageUrl(v.image);
        const imagesList = Array.isArray(v.images) ? v.images.map(resolveImageUrl).filter(Boolean) : [];
        const modelImg = resolveImageUrl(v.modelImage);

        const normalizedVariant = {
          variantId,
          asin,
          color: colorName,
          colorHex: getColorHex(colorName, v.colorHex),
          price,
          originalPrice,
          inStock,
          sizes,
          image: coverImg || (imagesList.length > 0 ? imagesList[0] : '/placeholder1.jpg'),
          images: imagesList,
          modelImage: modelImg,
        };

        normalizedVariant.gallery = getVariantGallery(normalizedVariant);
        return normalizedVariant;
      });
  }

  // Case 2: Legacy product without explicit variants array
  // Synthesize default variant(s) from top-level product images and colors
  const mainCover = resolveImageUrl(product.image);
  const mainImages = Array.isArray(product.images) ? product.images.map(resolveImageUrl).filter(Boolean) : [];
  const mainModel = resolveImageUrl(product.modelImage);

  const colorsList = Array.isArray(product.colors) && product.colors.length > 0 
    ? product.colors 
    : ['Standard'];

  return colorsList.map((col, idx) => {
    const colorName = typeof col === 'string' ? col.trim() : 'Standard';
    const variantId = `${product.productCode || product._id || 'PROD'}-${colorName.toUpperCase().replace(/[^A-Z0-9]/g, '') || idx + 1}`;

    const normalizedVariant = {
      variantId,
      asin: product.productCode || '',
      color: colorName,
      colorHex: getColorHex(colorName),
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      inStock: true,
      sizes: product.sizes || [],
      // The primary color gets the product images, ensuring zero cross-color contamination
      image: mainCover || (mainImages.length > 0 ? mainImages[0] : '/placeholder1.jpg'),
      images: mainImages,
      modelImage: mainModel,
    };

    normalizedVariant.gallery = getVariantGallery(normalizedVariant);
    return normalizedVariant;
  });
}

/**
 * Finds a specific variant by variantId, asin, or case-insensitive color name.
 */
export function findVariant(variants, searchKey) {
  if (!Array.isArray(variants) || variants.length === 0 || !searchKey) {
    return variants?.[0] || null;
  }

  const keyLower = String(searchKey).trim().toLowerCase();

  return (
    variants.find((v) => v.variantId?.toLowerCase() === keyLower) ||
    variants.find((v) => v.asin?.toLowerCase() === keyLower) ||
    variants.find((v) => v.color?.toLowerCase() === keyLower) ||
    variants[0]
  );
}
