import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Bot } from "lucide-react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cool Girls AI Assistant",
  description: "Your AI Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen pt-0`}
      >
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200">
          <div className="bg-gray-50 text-black p-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Bot className="w-6 h-6 text-black" />
              <Link href="/"> Cool Girls AI Assistant </Link> 
              {/* | <Link href="/upload" className="text-blue-600 hover:text-blue-500">Go to Upload</Link> */}
            </h2>
            
          </div>

          
        
        </header>
        

        <main>
          
          {children}
        </main>
      </body>
    </html>
  );
}