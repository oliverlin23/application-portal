import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from './providers'
import { Navbar } from "@/components/navbar"

const inter = Inter({
  subsets: ["latin"],
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
      <body 
        className={inter.className} 
      >
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