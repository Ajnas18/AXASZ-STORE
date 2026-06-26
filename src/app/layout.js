import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'AXASZSTORE | Premium Authentic Sneakers',
  description: 'Every Step Starts With the Right Pair. Discover authentic sneakers from the world\'s leading brands.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
