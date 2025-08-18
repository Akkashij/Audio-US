'use client';
import './globals.css';
import React from 'react';
import Footer from '../components/Footer';
import { usePathname } from 'next/navigation';
import { FooterVisibilityProvider, useFooterVisibility } from '../context/FooterVisibilityContext';
import { ModalProvider } from '../context/ModalContext';

function LayoutWithFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { showFooter } = useFooterVisibility();
  return (
    <>
      {children}
      {pathname !== '/login' && showFooter && <Footer />}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Audio Chat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen w-full" style={{ background: 'linear-gradient(135deg, #1e2746 0%, #263159 100%)' }}>
        <ModalProvider>
          <FooterVisibilityProvider>
            <LayoutWithFooter>{children}</LayoutWithFooter>
          </FooterVisibilityProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
