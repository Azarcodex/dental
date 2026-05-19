"use client";

import { Suspense } from "react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { HeroSection } from "@/components/public/HeroSection";
import { OurServices } from "@/components/public/OurServices";
import { HowItWorks } from "@/components/public/HowItWorks";
import { OurDoctors } from "@/components/public/OurDoctors";
import { PublicBookingForm } from "@/components/public/PublicBookingForm";
import { BookingBanner } from "@/components/public/BookingBanner";
import { ContactSection } from "@/components/public/ContactSection";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ThreeBackground } from "@/components/public/ThreeBackground";
import { ReviewsSection } from "@/components/public/ReviewsSection";
import GallerySection from "@/components/public/GallerySection";


export default function RootPage() {
  return (
    <main className="min-h-screen bg-black selection:bg-[#C49228] selection:text-black overflow-clip relative">
      <ThreeBackground />

      <div className="relative z-10">

        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-transparent"><div className="w-10 h-10 border-4 border-primary-green border-t-transparent rounded-full animate-spin" /></div>}>
          <PublicNavbar />

        {/* Hero Section */}
        <div id="home">
          <HeroSection />
        </div>

        {/* Services Section */}
        <div id="services">
          <OurServices />
        </div>

        {/* Doctors Section */}
        <div id="doctors">
          <OurDoctors />
        </div>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Booking CTA Banner */}
        <BookingBanner />

        {/* Booking Form Section */}
        <div id="booking">
          <PublicBookingForm />
        </div>

        {/* Gallery Section */}
        <GallerySection />

        {/* Reviews Section */}
        <ReviewsSection />


        {/* Contact Section */}
        <div id="contact">
          <ContactSection />
        </div>

        <PublicFooter />
        </Suspense>
      </div>
    </main>
  );
}

