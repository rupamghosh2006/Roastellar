import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { dark } from '@clerk/themes';
import './globals.css';

export const metadata: Metadata = {
  title: 'Roastellar - Roast. Battle. Earn.',
  description: 'The gamified social battle platform powered by Stellar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#8b5cf6',
          colorTextOnPrimaryBackground: '#ffffff',
          colorBackground: '#0a0a0a',
          colorInputBackground: '#1a1a1a',
          colorInputText: '#ffffff',
        },
        elements: {
          formButtonPrimary: 'bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90',
          card: 'bg-zinc-900 border-zinc-800',
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="min-h-screen antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}