import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prism - AI-Powered React Native App Builder",
  description: "Build React Native apps with crystal clarity using AI. Transform your ideas into production-ready code. Professional, reliable, and modern.",
  keywords: "React Native, AI, App Builder, Mobile Development, Code Generation, Professional",
  openGraph: {
    title: "Prism - AI-Powered React Native App Builder",
    description: "Build React Native apps with crystal clarity using AI. Professional, reliable, and modern.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.05)',
                backdropFilter: 'blur(20px)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f8fafc',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f8fafc',
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
