// src/app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Invoicing App',
  description: 'An invoicing app built with Next.js and Django',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
