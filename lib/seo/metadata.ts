import type { Metadata } from "next";
import {
  BRAND_APPLE_TOUCH_ICON_PATH,
  BRAND_FAVICON_PATH,
  BRAND_ICON_192_PATH,
  BRAND_ICON_512_PATH,
  BRAND_MANIFEST_PATH,
  BRAND_OG_IMAGE_PATH,
  BRAND_THEME_COLOR
} from "@/lib/seo/brand-assets";
import { getSiteUrl } from "@/lib/seo/site-url";

export const SEO_SITE_NAME = "ReadWays";

/** Brand-first default title for Turkish search and sharing. */
export const SEO_DEFAULT_TITLE = "ReadWays — PDF Okurken AI ile İngilizce Öğren";

export const SEO_TITLE_TEMPLATE = "%s | ReadWays";

export const SEO_DEFAULT_DESCRIPTION =
  "PDF yükle, bilmediğin kelimelere tıkla, AI ile anlamlarını öğren ve flash kartlarla kalıcı hale getir.";

export const SEO_OG_TITLE = "PDF Okurken AI ile Kelime Öğren | ReadWays";

export const SEO_OG_DESCRIPTION =
  "İngilizce PDF'leri okurken bilmediğin kelimeleri anında öğren. AI destekli açıklamalar, flash kartlar ve tekrar sistemi tek yerde.";

export const SEO_KEYWORDS = [
  "ReadWays",
  "AI ile İngilizce öğren",
  "PDF okuma uygulaması",
  "İngilizce kelime öğrenme",
  "AI sözlük",
  "Readlang alternatifi",
  "PDF vocabulary learning",
  "İngilizce okuma pratiği",
  "flashcard uygulaması",
  "bağlam içinde kelime öğrenme",
  "İngilizce PDF okuma"
] as const;

const OG_IMAGE = {
  url: BRAND_OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: "ReadWays — PDF okurken AI ile İngilizce öğren"
} as const;

function sharedIcons(): Metadata["icons"] {
  return {
    icon: [
      { url: BRAND_FAVICON_PATH },
      { url: BRAND_ICON_192_PATH, sizes: "192x192", type: "image/png" },
      { url: BRAND_ICON_512_PATH, sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: BRAND_APPLE_TOUCH_ICON_PATH, sizes: "180x180", type: "image/png" }]
  };
}

function sharedOpenGraph(overrides?: Partial<Metadata["openGraph"]>): Metadata["openGraph"] {
  return {
    type: "website",
    siteName: SEO_SITE_NAME,
    locale: "tr_TR",
    title: SEO_OG_TITLE,
    description: SEO_OG_DESCRIPTION,
    url: "/",
    images: [OG_IMAGE],
    ...overrides
  };
}

function sharedTwitter(overrides?: Partial<Metadata["twitter"]>): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title: SEO_OG_TITLE,
    description: SEO_OG_DESCRIPTION,
    images: [BRAND_OG_IMAGE_PATH],
    ...overrides
  };
}

/** Root layout defaults — Turkish-first, production SEO. */
export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: SEO_DEFAULT_TITLE,
      template: SEO_TITLE_TEMPLATE
    },
    description: SEO_DEFAULT_DESCRIPTION,
    keywords: [...SEO_KEYWORDS],
    applicationName: SEO_SITE_NAME,
    manifest: BRAND_MANIFEST_PATH,
    themeColor: BRAND_THEME_COLOR,
    icons: sharedIcons(),
    openGraph: sharedOpenGraph(),
    twitter: sharedTwitter(),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    }
  };
}

/** Landing page — canonical home URL and focused social previews. */
export function buildHomeMetadata(): Metadata {
  return {
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    keywords: [...SEO_KEYWORDS],
    alternates: {
      canonical: "/"
    },
    openGraph: sharedOpenGraph({
      url: "/",
      title: SEO_OG_TITLE,
      description: SEO_OG_DESCRIPTION
    }),
    twitter: sharedTwitter()
  };
}
