import './globals.css';

import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'AXASZSTORE | Premium Authentic Sneakers',
  description: 'Every Step Starts With the Right Pair. Discover authentic sneakers from the world\'s leading brands.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

