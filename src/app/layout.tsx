import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from './providers'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Summer Debate Program",
  description: "Application portal for the Summer Debate Program",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}
      >
        <Providers>
          <main className="max-w-7xl mx-auto">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
} 