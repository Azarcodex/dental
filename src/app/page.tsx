"use client";

import { Toaster } from "react-hot-toast";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { HeroSection } from "@/components/public/HeroSection";
import { WhyChooseUs } from "@/components/public/WhyChooseUs";
import { OurServices } from "@/components/public/OurServices";
import { HowItWorks } from "@/components/public/HowItWorks";
import { OurDoctors } from "@/components/public/OurDoctors";
import { PublicBookingForm } from "@/components/public/PublicBookingForm";
import { Testimonials } from "@/components/public/Testimonials";
import { ContactSection } from "@/components/public/ContactSection";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function RootPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-primary-green selection:text-white">
      <Toaster position="top-right" />

      <PublicNavbar />

      {/* Sections - Each handles its own padding & internal container */}
      <div id="home" className="scroll-mt-screen">
        <HeroSection />
      </div>

      <div id="doctors" className="scroll-mt-24">
        <OurDoctors />
      </div>
      <HowItWorks />

      <PublicBookingForm />

      <div id="about" className="scroll-mt-24">
        <WhyChooseUs />
      </div>

      <div id="services" className="scroll-mt-24">
        <OurServices />
      </div>

      {/* <Testimonials /> */}

      <div id="contact" className="scroll-mt-24">
        <ContactSection />
      </div>

      <PublicFooter />
    </main>
  );
}
