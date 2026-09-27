export const metadata = {
  title: "OddsHub API",
  description: "Backend API for the OddsHub mobile app.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
