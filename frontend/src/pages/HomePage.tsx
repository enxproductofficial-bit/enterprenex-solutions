import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import TechStackSection from '../components/TechStackSection';
import ProcessSection from '../components/ProcessSection';
import CTABanner from '../components/CTABanner';

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      <ServicesSection />
      <TechStackSection />
      <ProcessSection />
      <CTABanner />
    </main>
  );
}
