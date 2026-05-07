import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SiteSafe RAMS",
  description: "Site specific RAMS access and sign off system"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
