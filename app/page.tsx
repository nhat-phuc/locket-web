
"use client";

// import Navbar from "@/components/Navbar";


import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Marquee from "@/components/Marquee";
import IconShowcase from "@/components/IconShowcase";
import Reviews from "@/components/Reviews";
import RecentTransactions from "@/components/RecentTransactions";
import LocketShowcase from "@/components/LocketShowcase";
import Gallery from "@/components/Gallery";
import CTA from "@/components/CTA";
import Steps from "@/components/Steps";
import Privileges from "@/components/Privileges";
import FAQ from "@/components/FAQ";

import SalesPopup from "@/components/SalesPopup";
import SocialProofPopup from "@/components/SocialProofPopup";
import RechargeSuccessPopup from "@/components/RechargeSuccessPopup";
import NotificationPopup from "@/components/NotificationPopup";
import NoticeModal from "@/components/NoticeModal";




import Jiggle from "@/components/Jiggle";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function HomePage() {
  return (
    <>
      

      <div className="bg-3d-glow bg-3d-glow-1" />
      <div className="bg-3d-glow bg-3d-glow-2" />
      <div className="bg-3d-glow bg-3d-glow-3" />

      


      <main className="wrap center-y">
        <div className="page-shell">
          <Hero />
          <Stats />
          <Marquee />
          <IconShowcase />
          <RecentTransactions />
          <Reviews />
          <LocketShowcase />
          <Gallery />
          <CTA />
          <Steps />
          <Privileges />
          <FAQ />
        </div>
      </main>

      
      {/* <Navbar /> */}
      
      <NotificationPopup />
      <SalesPopup />
      <SocialProofPopup />
      <RechargeSuccessPopup />
      <NoticeModal />

      
      
      <Jiggle />
      <RevealOnScroll />
    </>
  );
}
