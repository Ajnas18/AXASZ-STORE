import { redirect } from 'next/navigation';

export const metadata = {
  title: 'All Sneakers & Collection | AXASZ STORE',
  description: 'Explore the complete authentic sneaker collection at AXASZ STORE. Nike, Adidas, Puma, New Balance, Jordan & more with free pan-India shipping.',
};

export default function ProductsPage() {
  redirect('/#products');
}
