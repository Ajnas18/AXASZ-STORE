export const ALL_PRODUCTS_QUERY = `*[_type == "product"] | order(_createdAt desc)[0...100] {
  _id,
  name,
  brand,
  productCode,
  price,
  originalPrice,
  rating,
  reviews,
  badge,
  sizes,
  colors,
  image,
  modelImage,
  images,
  slug
}`;

export const SINGLE_PRODUCT_QUERY = `*[_type == "product" && _id == $id][0] {
  _id,
  name,
  brand,
  productCode,
  price,
  originalPrice,
  rating,
  reviews,
  badge,
  sizes,
  colors,
  image,
  modelImage,
  images,
  slug
}`;

export const PRODUCT_BY_IDENTIFIER_QUERY = `*[_type == "product" && (
  slug.current == $slug ||
  _id == $slug ||
  productCode == $slug ||
  lower(name) == lower($slug) ||
  lower(productCode) == lower($slug)
)][0] {
  _id,
  name,
  brand,
  productCode,
  price,
  originalPrice,
  rating,
  reviews,
  badge,
  sizes,
  colors,
  image,
  modelImage,
  images,
  slug
}`;

