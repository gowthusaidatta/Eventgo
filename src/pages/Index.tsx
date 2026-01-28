import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedEvents } from '@/components/home/FeaturedEvents';
import { FeaturedOpportunities } from '@/components/home/FeaturedOpportunities';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturedEvents />
        <FeaturedOpportunities />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
