import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/layout/NavbarWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
      <body className={`${inter.variable} font-sans antialiased`}>
        <NavbarWrapper />
        <main>{children}</main>
      </body>
    </html>
  );
}
