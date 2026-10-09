const TESTIMONIALS = [
  {
    logo: '/images/logo-rolls-royce.svg',
    logoAlt: 'Rolls Royce',
    quote: 'Repeat Business is the best testament to a team\'s ability to perform, and I have no hesitation in hiring them again. The pleasant collaboration style and high-level acumen rapidly catalyzed significant momentum towards achieving our objectives.',
    author: 'Brad M.',
    role: 'Product Manager at Rolls Royce',
    avatarColor: '#1a1a1a',
  },
  {
    logo: '/images/logo-iqvia.svg',
    logoAlt: 'IQVIA',
    quote: 'They provide amazing development and design resourcing, along with best in class account management support. We were able to speed up product delivery while reducing our costs. Hands down the best vendor decision my team has made.',
    author: 'Adam I.',
    role: 'Director of Digital Strategy',
    avatarColor: '#E8003D',
  },
  {
    logo: '/images/logo-urban-outfitters.svg',
    logoAlt: 'Urban Outfitters',
    quote: 'We optimized our website performance, leading to a 38% increase in net profits. The team was professional, highly skilled, and delivered exactly what we needed on time and within budget.',
    author: 'Sarah L.',
    role: 'Engineering Manager',
    avatarColor: '#FF6900',
  },
  {
    logo: null,
    logoAlt: 'Pinterest',
    quote: 'The team had a real commitment to quality and delivered features our users absolutely loved. Communication was seamless, and timelines were consistently met. I would not hesitate to recommend them.',
    author: 'James T.',
    role: 'VP of Engineering',
    avatarColor: '#E60023',
    logoText: 'Pinterest',
  },
  {
    logo: null,
    logoAlt: 'Google',
    quote: 'An outstanding partner for scaling our engineering capacity quickly without sacrificing quality. Every engineer placed with us hit the ground running and contributed meaningful work from day one.',
    author: 'Priya K.',
    role: 'Head of Platform Engineering',
    avatarColor: '#4285F4',
    logoText: 'Google',
  },
];

const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

export default function TestimonialsSection() {
  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-h2">
      <div className="wrap">
        <div className="testimonials-top">
          <p className="t-overline section-eyebrow">Client Stories</p>
          <h2 id="testimonials-h2">
            We've stopped counting. Over 500 brands count on us.
          </h2>
          <p>1,200+ projects executed successfully and an average relationship of over 3 years.</p>
          <a href="#" className="btn-link" style={{ marginTop: '1.5rem' }}>
            Our greatest hits
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Scrolling Cards */}
      <div className="tcard-wrap">
        <div className="tcard-track" aria-label="Client testimonials carousel">
          {doubled.map((t, i) => (
            <article key={i} className="tcard" aria-label={`Testimonial from ${t.logoAlt}`}>
              {/* Logo */}
              <div style={{ marginBottom: '1.5rem', height: '2.75rem', display: 'flex', alignItems: 'center' }}>
                {t.logo ? (
                  <img
                    src={t.logo}
                    alt={t.logoAlt}
                    className="tcard__logo"
                    loading="lazy"
                    style={{ maxHeight: '2.75rem', width: 'auto', maxWidth: '9rem', objectFit: 'contain', objectPosition: 'left' }}
                  />
                ) : (
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: t.avatarColor, letterSpacing: '-.02em' }}>
                    {t.logoText ?? t.logoAlt}
                  </span>
                )}
              </div>

              {/* Quote */}
              <div className="tcard__quote" style={{ flex: 1 }}>
                <span className="qmark">"</span>
                {t.quote}"
              </div>

              {/* Author */}
              <div className="tcard__author">
                <div
                  className="tcard__avatar"
                  style={{ background: t.avatarColor }}
                  aria-hidden="true"
                >
                  {t.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <strong>{t.author}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
