import { Toaster } from "@outfit-builder/ui";
import type { Metadata } from "next";
import { Zalando_Sans } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/site-header";

const zalandoSans = Zalando_Sans({
  variable: "--font-zalando-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Outfit Builder & Style Dashboard",
    template: "%s | Outfit Builder",
  },
  description:
    "Browse fashion items, build complete outfits and manage your style with live price and compatibility rules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${zalandoSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:flex focus:min-h-11 focus:items-center focus:rounded-md focus:bg-primary focus:px-4 focus:text-base focus:font-medium focus:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
