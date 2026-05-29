import type { Metadata } from "next";
import AppProviders from "@/components/feedback/AppProviders";
import {
  BRAND_APPLE_TOUCH_ICON_PATH,
  BRAND_FAVICON_PATH,
  BRAND_ICON_192_PATH,
  BRAND_ICON_512_PATH,
  BRAND_LOGO_PATH,
  BRAND_MANIFEST_PATH,
  BRAND_THEME_COLOR
} from "@/lib/seo/brand-assets";
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
  manifest: BRAND_MANIFEST_PATH,
  themeColor: BRAND_THEME_COLOR,
  icons: {
    icon: [
      { url: BRAND_FAVICON_PATH },
      { url: BRAND_ICON_192_PATH, sizes: "192x192", type: "image/png" },
      { url: BRAND_ICON_512_PATH, sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: BRAND_APPLE_TOUCH_ICON_PATH, sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    type: "website",
    siteName: "ReadWays",
    title: "ReadWays - Learn vocabulary while reading PDFs",
    description:
      "Upload PDFs, click words in context, save vocabulary as flashcards, and review what you learn.",
    url: "/",
    images: [
      {
        url: BRAND_LOGO_PATH,
        width: 512,
        height: 512,
        alt: "ReadWays logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ReadWays - Learn vocabulary while reading PDFs",
    description:
      "Upload PDFs, click words in context, save vocabulary as flashcards, and review what you learn.",
    images: [BRAND_LOGO_PATH]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
