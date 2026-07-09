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
  ],
};
