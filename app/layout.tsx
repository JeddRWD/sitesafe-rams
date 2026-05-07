import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteSafe RAMS",
  description: "Site specific RAMS access, review and operative sign-off system."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
