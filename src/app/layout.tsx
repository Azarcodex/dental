import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { AuthProvider } from "@/context/AuthContext";
import { Metadata } from "next";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADAMS Poly Clinic | Excellence in Holistic Healthcare",
  description: "Modern clinical facilities and specialized medical care. Book your appointment online with ADAMS Poly Clinic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${plusJakarta.variable} ${inter.variable} font-sans antialiased`}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
