export const colorVariantSchema = {
  name: 'colorVariant',
  title: 'Color Variant',
  type: 'object',
  fields: [
    {
      name: 'variantId',
      title: 'Variant ID / SKU',
      type: 'string',
      description: 'Unique identifier for this variant (e.g. AXS0011-RED, NIKE-001-WHITE)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'asin',
      title: 'ASIN / Amazon ID',
      type: 'string',
      description: 'Amazon ASIN for this specific variant (e.g. B08N5WRWNW)',
    },
    {
      name: 'color',
      title: 'Color Name',
      type: 'string',
      description: 'E.g. White, University Blue, Bred, Black/White',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'colorHex',
      title: 'Color Hex / Swatch Code',
      type: 'string',
      description: 'Hex color code for swatch display (e.g. #3b82f6 or #ffffff). Optional.',
    },
    {
      name: 'price',
      title: 'Variant Price Override',
      type: 'number',
      description: 'Leave blank to use the main sneaker price',
    },
    {
      name: 'originalPrice',
      title: 'Variant Original MRP Override',
      type: 'number',
      description: 'Leave blank to use main sneaker MRP',
    },
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'sizes',
      title: 'Variant Sizes Available',
      type: 'array',
      of: [{ type: 'number' }],
      description: 'Sizes available specifically for this color variant. Defaults to main sizes if empty.',
    },
    {
      name: 'image',
      title: 'Variant Cover / Main Image',
      type: 'image',
      description: 'Main front/profile image for this color variant',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'images',
      title: 'Variant Gallery Images',
      type: 'array',
      description: 'Additional photos strictly for THIS color variant (side, back, sole, top, etc.)',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: 'modelImage',
      title: 'Variant Model / Wearing Image',
      type: 'image',
      description: 'Model photo wearing this specific color variant (Optional)',
      options: {
        hotspot: true,
      },
    },
  ],
  preview: {
    select: {
      title: 'color',
      subtitle: 'variantId',
      media: 'image',
      price: 'price',
    },
    prepare(selection) {
      const { title, subtitle, media, price } = selection;
      return {
        title: `${title || 'Color Variant'}`,
        subtitle: `${subtitle || 'No ID'}${price ? ` • ₹${price}` : ''}`,
        media: media,
      };
    },
  },
};

export const productSchema = {
  name: 'product',
  title: 'Sneaker',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Sneaker Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      description: 'Click Generate to automatically create a clean URL slug from the name.',
      options: {
        source: 'name',
        maxLength: 96,
      },
    },
    {
      name: 'productCode',
      title: 'Product Code (SKU)',
      type: 'string',
      description: 'E.g. AXS0011',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
      options: {
        list: [
          { title: 'Nike', value: 'Nike' },
          { title: 'Adidas', value: 'Adidas' },
          { title: 'Puma', value: 'Puma' },
          { title: 'New Balance', value: 'New Balance' },
          { title: 'Converse', value: 'Converse' },
          { title: 'Vans', value: 'Vans' },
          { title: 'Jordan', value: 'Jordan' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Current Price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: 'originalPrice',
      title: 'Original Price',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    },
    {
      name: 'dealer',
      title: 'Dealer / Supplier',
      type: 'reference',
      to: [{ type: 'dealer' }],
      description: 'Select the dealer responsible for fulfilling this product',
    },
    {
      name: 'badge',
      title: 'Badge',
      type: 'string',
      description: 'E.g. Best Seller, Trending, Sale (Optional)',
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Average Rating (1-5)',
      validation: (Rule) => Rule.min(1).max(5),
    },
    {
      name: 'reviews',
      title: 'Total Reviews',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    },
    {
      name: 'sizes',
      title: 'Available Sizes',
      type: 'array',
      of: [{ type: 'number' }],
    },
    {
      name: 'colors',
      title: 'Available Colors',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'image',
      title: 'Sneaker Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'images',
      title: 'Sneaker Images Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      description: 'Upload additional sneaker photos for the gallery.',
    },
    {
      name: 'modelImage',
      title: 'Model Wearing Image',
      type: 'image',
      description: 'An image showing a model wearing this sneaker (Optional)',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'variants',
      title: 'Color Variants (Gallery per Color)',
      type: 'array',
      description: 'Define specific color variants each with their own dedicated image gallery, ASIN, and stock.',
      of: [
        { type: 'colorVariant' },
      ],
    },
  ],
};
