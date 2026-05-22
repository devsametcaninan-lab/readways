import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReadWays | Language Learning Platform",
  description: "Learn smarter with contextual reading, flashcards, and quizzes."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
