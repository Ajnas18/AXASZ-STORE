import { useStore } from './src/store/useStore.js';

console.log('==================================================');
console.log('🧪 RUNNING CART MULTI-VARIANT ISOLATION TEST');
console.log('==================================================');

const store = useStore.getState();

// Clear cart
useStore.setState({ cart: [], wishlist: [] });

const product = {
  _id: 'sneaker-101',
  name: 'Nike Dunk Low',
  price: 10999,
  brand: 'Nike',
  productCode: 'NK-DUNK-01',
  image: '/placeholder.jpg'
};

// 1. Add White (UK 9, qty 1)
useStore.getState().addToCart(product, 9, 1, { variantId: 'NK-DUNK-01-WHITE', color: 'White', price: 10999 });

// 2. Add Black (UK 9, qty 2)
useStore.getState().addToCart(product, 9, 2, { variantId: 'NK-DUNK-01-BLACK', color: 'Black', price: 11499 });

// 3. Add White (UK 10, qty 1)
useStore.getState().addToCart(product, 10, 1, { variantId: 'NK-DUNK-01-WHITE', color: 'White', price: 10999 });

let currentCart = useStore.getState().cart;
console.log(`\nInitial Cart items count: ${currentCart.length} (Expected: 3)`);
if (currentCart.length !== 3) throw new Error('Failed: Expected 3 separate cart items');

console.log('Line 1:', currentCart[0].name, 'Color:', currentCart[0].selectedColor, 'Size:', currentCart[0].selectedSize, 'Qty:', currentCart[0].quantity);
console.log('Line 2:', currentCart[1].name, 'Color:', currentCart[1].selectedColor, 'Size:', currentCart[1].selectedSize, 'Qty:', currentCart[1].quantity);
console.log('Line 3:', currentCart[2].name, 'Color:', currentCart[2].selectedColor, 'Size:', currentCart[2].selectedSize, 'Qty:', currentCart[2].quantity);

// 4. Update quantity of Black UK 9 from 2 -> 5
useStore.getState().updateQuantity(product._id, 9, 5, 'Black');
currentCart = useStore.getState().cart;

const white9 = currentCart.find(i => i.selectedSize === 9 && i.selectedColor === 'White');
const black9 = currentCart.find(i => i.selectedSize === 9 && i.selectedColor === 'Black');

console.log('\nAfter updating Black UK 9 qty to 5:');
console.log('White UK 9 Qty:', white9.quantity, '(Expected: 1)');
console.log('Black UK 9 Qty:', black9.quantity, '(Expected: 5)');

if (white9.quantity !== 1 || black9.quantity !== 5) {
  throw new Error('Failed: Updating Black quantity contaminated White variant!');
}

// 5. Remove White UK 9
useStore.getState().removeFromCart(product._id, 9, 'White');
currentCart = useStore.getState().cart;

console.log(`\nAfter removing White UK 9: Cart count = ${currentCart.length} (Expected: 2)`);
const remainingBlack9 = currentCart.find(i => i.selectedSize === 9 && i.selectedColor === 'Black');
const remainingWhite10 = currentCart.find(i => i.selectedSize === 10 && i.selectedColor === 'White');

if (!remainingBlack9 || remainingBlack9.quantity !== 5) {
  throw new Error('Failed: Removing White UK 9 accidentally deleted or corrupted Black UK 9!');
}

if (!remainingWhite10 || remainingWhite10.quantity !== 1) {
  throw new Error('Failed: White UK 10 was corrupted!');
}

console.log('✅ PASS: Black UK 9 and White UK 10 are completely intact!');
console.log('\n==================================================');
console.log('🎉 ALL CART MULTI-VARIANT ISOLATION TESTS PASSED!');
console.log('==================================================\n');
