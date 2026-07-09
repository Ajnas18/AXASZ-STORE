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
  images
}`;

export const SINGLE_PRODUCT_QUERY = `*[_type == "product" && _id == $id][0] {
  _id,
  name,
  brand,
  productCode,
  price,
  image,
  modelImage,
  images
}`;
