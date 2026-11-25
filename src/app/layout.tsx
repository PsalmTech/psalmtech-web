import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PsalmTech Solutions — Data Analytics, Machine Learning & Research Support",
  description:
    "Power BI, Python, machine learning, cybersecurity research and publication support for students, researchers, schools and organisations. Training through PsalmTech Academy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
