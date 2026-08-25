import { productSchema, colorVariantSchema } from './product';
import dealer from './dealer';
import customer from './customer';
import order from './order';

export const schema = {
  types: [productSchema, colorVariantSchema, dealer, customer, order],
};
