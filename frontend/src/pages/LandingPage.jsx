import AboutSection from "@/components/landing/AboutSection";
import ContactSection from "@/components/landing/ContactSection";
import FeatureHighlight from "@/components/landing/FeatureHighlight";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/landing/Navbar";
import ServicesSection from "@/components/landing/ServicesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import TrustedCompanies from "@/components/landing/TrustedCompanies";
import React from "react";

function LandingPage() {
  return (
    <>
      <main className="min-h-screen  bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <Navbar />
        <HeroSection />
        <ServicesSection />
        <FeatureHighlight />
        <AboutSection />
        <TestimonialsSection />
        <TrustedCompanies />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}

export default LandingPage;