export const metadata = {
  title: "SiteSafe RAMS",
  description: "Site specific RAMS system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif", background: "#f3f4f6", color: "#111827" }}>
        {children}
      </body>
    </html>
  );
}
