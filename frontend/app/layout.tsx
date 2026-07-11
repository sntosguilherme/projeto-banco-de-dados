'use client';

import { useState } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-neutral-50 text-neutral-800 font-sans antialiased min-h-screen">
        <div className="flex min-h-screen bg-neutral-50">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

          {/* Área do Conteúdo Principal */}
          <div 
            className={`flex-1 min-w-0 transition-all duration-300 ${
              sidebarOpen ? 'md:pl-64' : 'md:pl-0'
            }`}
          >
            <main className="min-h-screen p-4 pt-20 md:p-8 md:pt-8 bg-neutral-50">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}