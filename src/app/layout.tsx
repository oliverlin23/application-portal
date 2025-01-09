import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Providers from '@/components/providers'
import { Navbar } from "@/components/navbar"

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: '--font-serif',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: "Yale Summer Debate Program",
  description: "Application portal for the Yale Summer Debate Program",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen mx-auto">
            {children}  
          </main>
        </Providers> 
      </body>
    </html>
  );
} 