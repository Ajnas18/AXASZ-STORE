import { productSchema } from './product';
import customer from './customer';
import order from './order';

export const schema = {
  types: [productSchema, customer, order],
};
