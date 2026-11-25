import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import TechStackSection from '../components/TechStackSection';
import ProcessSection from '../components/ProcessSection';
import FaqSection, { getFaqPageJsonLd } from '../components/FaqSection';
import CTABanner from '../components/CTABanner';
import SEOHead from '../components/SEOHead';

export default function HomePage() {
  const faqSchema = getFaqPageJsonLd();

  return (
    <>
      <SEOHead
        title="Enterprenex Solutions | Software Development & AI/ML Solutions Company"
        description="Enterprenex Solutions builds scalable enterprise software, AI/ML models, cloud web & mobile apps, and custom ERP systems engineered for growth."
        canonical="https://enterprenexsolution.com/"
        jsonLd={faqSchema}
      />
      <main id="main-content">
        <HeroSection />
        <ServicesSection />
        <TechStackSection />
        <ProcessSection />
        <FaqSection />
        <CTABanner />
      </main>
    </>
  );
}
