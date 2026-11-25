import { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string[];
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'Enterprenex Solutions | Enterprise Software & AI/ML Development Company';
const DEFAULT_DESC = 'Enterprenex Solutions is a leading software development company delivering custom enterprise platforms, AI/ML solutions, web and mobile apps, and ERP digital transformation.';
const BASE_URL = 'https://enterprenexsolution.com';
const DEFAULT_IMAGE = `${BASE_URL}/android-chrome-512x512.png`;

const DEFAULT_KEYWORDS = [
  'Software Development Company',
  'AI and Machine Learning Services',
  'Custom Software Development',
  'Web Application Development',
  'Mobile App Development',
  'ERP Software Development',
  'Digital Transformation Services',
  'IT Staff Augmentation',
  'Enterprise Software Solutions',
  'Cloud Architecture & DevOps'
];

/**
 * Standard Organization Schema for Enterprenex Solutions Pvt. Ltd. (GEO Citation)
 */
export const ENTERPRENEX_ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'Enterprenex Solutions Pvt. Ltd.',
  alternateName: ['Enterprenex Solutions', 'Enterprenex'],
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.svg`,
  image: `${BASE_URL}/android-chrome-512x512.png`,
  description: 'Enterprise software development, artificial intelligence systems, custom web/mobile platforms, and digital workforce transformation.',
  email: 'contact@enterprenex.solutions',
  telephone: '+91-9226860060',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Plot No. 148, Shrinand Plaza, CIDCO Waluj Mahanagar 1',
    addressLocality: 'Chhatrapati Sambhajinagar',
    addressRegion: 'Maharashtra',
    postalCode: '431136',
    addressCountry: 'IN'
  },
  sameAs: [
    'https://www.linkedin.com/company/enterprenex-solution-pvt-ltd/',
    'https://www.facebook.com/profile.php?id=61596866191640&mibextid=ZbWKwL',
    'https://x.com/Enterprenex',
    'https://www.instagram.com/enterprenexsolution'
  ],
  knowsAbout: [
    'Enterprise Software Engineering',
    'Artificial Intelligence & Machine Learning',
    'Autonomous AI Agents & Copilots',
    'Custom ERP & CRM Development',
    'Cloud Native Infrastructure & DevOps',
    'Biometric Attendance & EWMS Systems',
    'SaaS Product Architecture'
  ]
};

/**
 * ProfessionalService & LocalBusiness Schema
 */
export const ENTERPRENEX_LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${BASE_URL}/#service`,
  name: 'Enterprenex Solutions Pvt. Ltd.',
  image: `${BASE_URL}/android-chrome-512x512.png`,
  url: BASE_URL,
  telephone: '+91-9226860060',
  priceRange: '₹₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Plot No. 148, Shrinand Plaza, CIDCO Waluj Mahanagar 1',
    addressLocality: 'Chhatrapati Sambhajinagar',
    addressRegion: 'Maharashtra',
    postalCode: '431136',
    addressCountry: 'IN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 19.8437,
    longitude: 75.2534
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00'
    }
  ]
};

export default function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical = BASE_URL,
  keywords = DEFAULT_KEYWORDS,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  jsonLd
}: SEOHeadProps) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (nameAttr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${nameAttr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set or create link tag
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 2. Standard Meta Tags
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords.join(', '));
    setMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMeta('name', 'author', 'Enterprenex Solutions Pvt. Ltd.');

    // 3. Canonical URL
    setLink('canonical', canonical);

    // 4. OpenGraph Metadata
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', 'Enterprenex Solutions');
    setMeta('property', 'og:image', ogImage);

    // 5. Twitter Card Metadata
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:site', '@Enterprenex');
    setMeta('name', 'twitter:creator', '@Enterprenex');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    // 6. JSON-LD Structured Data Injection
    const scriptId = 'enx-seo-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemas = [
      ENTERPRENEX_ORGANIZATION_SCHEMA,
      ENTERPRENEX_LOCAL_BUSINESS_SCHEMA,
      ...(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [])
    ];

    scriptEl.textContent = JSON.stringify(schemas);
  }, [title, description, canonical, keywords, ogType, ogImage, jsonLd]);

  return null;
}
