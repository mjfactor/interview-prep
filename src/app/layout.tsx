import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const productionUrl = `https://prep-interview-vapi.vercel.app`;

const ogImageUrl = `${productionUrl}/api/og`;

export const metadata: Metadata = {
  title: "Interview Prep Platform", // Updated title
  description: "Sharpen your skills and ace your technical interviews with our AI-powered preparation platform.", // Updated description
  openGraph: {
    title: "Interview Prep Platform",
    description: "Ace your next technical interview.",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Interview Prep Platform OG Image',
      },
    ],
    type: 'website',
  },
  twitter: { // Optional: Add Twitter card metadata
    card: 'summary_large_image',
    title: "Interview Prep Platform",
    description: "Ace your next technical interview.",
    images: [ogImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
