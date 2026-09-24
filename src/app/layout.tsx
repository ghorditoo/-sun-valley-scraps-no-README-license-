import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookingProvider } from "@/components/booking/BookingContext";
import { BookingModal } from "@/components/booking/BookingModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sun Valley Scraps | Family-Owned Hardscaping & Yard Design",
  description:
    "Bilingual, family-owned landscaping and hardscaping company in Sun Valley. Pavers, turf, drainage, and full yard redesigns with online booking and referral rewards.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-orange-50 text-stone-900">
        <LanguageProvider>
          <BookingProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BookingModal />
          </BookingProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
