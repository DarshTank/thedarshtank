import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darsh Tank — Full-Stack Developer",
  description:
    "Portfolio of Darsh Tank — a Computer Science student at Nirma University building real-world applications with Java, Spring Boot, Next.js, and Django.",
  keywords: [
    "Darsh Tank",
    "portfolio",
    "full-stack developer",
    "Java",
    "Spring Boot",
    "Next.js",
    "Django",
    "Nirma University",
  ],
  authors: [{ name: "Darsh Tank" }],
  openGraph: {
    title: "Darsh Tank — Full-Stack Developer",
    description: "Coding with purpose, building with care.",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Inter Tight */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
