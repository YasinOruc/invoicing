// src/app/layout.tsx

import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Invoicing App',
  description: 'An invoicing app built with Next.js and Django',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-800 p-4 text-white">
          <Link href="/" className="mr-4">
            Home
          </Link>
          <Link href="/invoices/create">Create Invoice</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
