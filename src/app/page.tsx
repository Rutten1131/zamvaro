'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import HowItWorks from '@/components/HowItWorks';
import OrderTimeline from '@/components/OrderTimeline';
import ProductsPreview from '@/components/ProductsPreview';
import WhyZamvaro from '@/components/WhyZamvaro';
import Testimonials from '@/components/Testimonials';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <OrderTimeline />
        <ProductsPreview />
        <WhyZamvaro />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
