import type { Metadata } from "next";
import AppProviders from "@/components/feedback/AppProviders";
import { buildRootMetadata } from "@/lib/seo/metadata";
import "./globals.css";

export const metadata: Metadata = buildRootMetadata();

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
