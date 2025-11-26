import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <header className="flex-shrink-0">
        <div className="bg-transparent px-4 py-3">
          <Navbar />
        </div>
      </header>
      
      <main className="flex-1 px-4 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
      
      <Footer className="mt-auto" />
    </div>
  );
}