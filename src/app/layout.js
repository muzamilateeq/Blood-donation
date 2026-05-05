import "./globals.css";

export const metadata = {
  title: "LifeLink Pakistan | Find Blood Donors Fast",
  description:
    "Arrange blood donors across Pakistan with a fast, mobile-first emergency lead form.",
  icons: {
    apple: "/favicon.svg",
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html className="bg-white" lang="en">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
