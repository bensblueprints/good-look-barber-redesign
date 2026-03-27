import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Good Look Barber Shop | Marietta, GA",
  description: "Let Our Grooming Experts Serve You. Premium haircuts, shaves, and grooming services in Marietta, GA. Book your appointment online today.",
  keywords: "barber, barbershop, haircut, shave, grooming, Marietta, GA, Georgia",
  openGraph: {
    title: "Good Look Barber Shop | Marietta, GA",
    description: "Let Our Grooming Experts Serve You. Premium haircuts, shaves, and grooming services in Marietta, GA.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
