import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepMarket Engine | Autonomous Multi-Agent Market Research",
  description:
    "Autonomous market intelligence platform powered by specialized agents for Geo & Demand, SEO Arbitrage, Competitor Gaps, and GTM Strategy. Developed by Nile Supplies.",
  authors: [{ name: "Nile Supplies", url: "mailto:contact@nilesupplies.com" }],
  keywords: [
    "Market Research",
    "Autonomous Agents",
    "TAM SAM SOM",
    "Competitor Analysis",
    "SEO Keyword Planner",
    "GTM Strategy",
    "Nile Supplies",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}
