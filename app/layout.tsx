import type { Metadata } from "next";
import AppProviders from "@/components/feedback/AppProviders";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "ReadWays - Learn vocabulary while reading PDFs",
    template: "%s | ReadWays"
  },
  description:
    "Upload PDFs, click words in context, save vocabulary as flashcards, and review what you learn.",
  keywords: [
    "ReadWays",
    "vocabulary learning",
    "PDF reader",
    "language learning",
    "flashcards",
    "learn words in context"
  ],
  applicationName: "ReadWays",
  openGraph: {
    type: "website",
    siteName: "ReadWays",
    title: "ReadWays - Learn vocabulary while reading PDFs",
    description:
      "Upload PDFs, click words in context, save vocabulary as flashcards, and review what you learn.",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ReadWays preview image"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ReadWays - Learn vocabulary while reading PDFs",
    description:
      "Upload PDFs, click words in context, save vocabulary as flashcards, and review what you learn.",
    images: ["/og-image.png"]
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
