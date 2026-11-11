import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepMarket Engine | Pure-White Market Opportunity Intelligence",
  description:
    "Ultra-clean market research engine powered by live Google & Bing autocomplete, real Reddit/HackerNews discussions, and live scraped competitor teardowns. Developed by Nile Supplies.",
  authors: [{ name: "Nile Supplies", url: "mailto:contact@nilesupplies.com" }],
  keywords: [
    "Market Research",
    "Live SEO Keywords",
    "Reddit Sentiment",
    "Competitor Analysis",
    "GTM Playbook",
    "Nile Supplies",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="bg-white text-[#0B1221] antialiased selection:bg-[#1862F6]/15 selection:text-[#1862F6]">
        {children}
      </body>
    </html>
  );
}
