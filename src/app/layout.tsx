import type { Metadata } from "next";
import "./globals.css";
import NavbarWrapper from "@/components/layout/NavbarWrapper";

export const metadata: Metadata = {
  title: "NPC - Contractual Engagement & Empanelment Portal",
  description:
    "National Productivity Council (NPC) portal for contractual engagement and empanelment of professionals. NPC is an autonomous body under the Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce & Industry, Government of India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-700 focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>
        <NavbarWrapper />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
