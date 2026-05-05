import "./globals.css";

export const metadata = {
  title: "LifeLink Pakistan | Find Blood Donors Fast",
  description:
    "Arrange blood donors across Pakistan with a fast, mobile-first emergency lead form.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
