// Centralized data — no external URLs, no personal info
// All images use local public/assets or inline SVG

export const NAV_LINKS = [
  {
    label: 'Services',
    items: [
      'Staff Augmentation',
      'Dedicated Teams',
      'Software Outsourcing',
      'AI Transformation',
    ],
    topServices: [
      'AI Development', 'Android App Development', 'Back-end Development',
      'Business Intelligence', 'CMS Development', 'Data Engineering',
      'Cryptocurrency & Blockchain', 'eCommerce Development',
      'Front-end Development', 'iOS App Development', 'Machine Learning',
      'Mobile App Development', 'QA Testing & Automation', 'SaaS Development',
      'UX/UI Design', 'Web Development',
    ],
  },
  {
    label: 'Technologies',
    items: [
      '.NET', 'AI', 'Angular', 'AWS', 'C#', 'C++', 'Django', 'Golang',
      'Google Cloud', 'Java', 'JavaScript', 'Kotlin', 'Machine Learning',
      'Microsoft Azure', 'Node.js', 'PHP', 'Power BI', 'Python',
      'React', 'Ruby on Rails', 'Scala', 'Swift', 'TypeScript', 'Vue.js',
    ],
  },
  { label: 'Industries', items: ['FinTech', 'Healthcare', 'Media & Entertainment', 'Retail', 'Education', 'Automotive'] },
  { label: 'Insights', items: ['Blog', 'Case Studies', 'Reports', 'Webinars'] },
  { label: 'Company', items: ['About Us', 'Careers', 'Press', 'Awards', 'Partners'] },
];

export const CLIENT_LOGOS = [
  { name: 'Google',    color: '#4285F4' },
  { name: 'Pinterest', color: '#E60023' },
  { name: 'Salesforce',color: '#00A1E0' },
  { name: 'Rolls Royce',color:'#1A1A1A' },
  { name: 'IQVIA',     color: '#E8003D' },
  { name: 'GitHub',    color: '#181717' },
];

export const SERVICES = [
  {
    icon: '👥',
    title: 'Staff Augmentation',
    description:
      'Scale your existing team with top-tier engineers who integrate seamlessly into your processes and culture.',
  },
  {
    icon: '🚀',
    title: 'Dedicated Teams',
    description:
      'Get a fully managed, cross-functional engineering team built around your product goals and roadmap.',
  },
  {
    icon: '💻',
    title: 'Software Outsourcing',
    description:
      'Delegate your entire software development lifecycle to our expert engineers and project managers.',
  },
  {
    icon: '🤖',
    title: 'AI Transformation',
    description:
      'Integrate AI into your business workflows to increase productivity, cut costs, and gain competitive edge.',
  },
  {
    icon: '📱',
    title: 'Mobile Development',
    description:
      'Native iOS and Android apps built by specialists who understand platform best practices and UX standards.',
  },
  {
    icon: '🛡️',
    title: 'QA & Testing',
    description:
      'Comprehensive quality assurance services — from manual testing to end-to-end automation frameworks.',
  },
];

export const TECHNOLOGIES = [
  'Java', 'React', '.NET', 'Python', 'Angular', 'Node.js', 'AWS', 'Golang',
  'TypeScript', 'Kotlin', 'Swift', 'PHP', 'Django', 'Vue.js', 'Ruby on Rails',
  'C#', 'C++', 'Scala', 'Google Cloud', 'Microsoft Azure', 'Power BI',
  'Machine Learning', 'AI', 'Spark', 'Kubernetes', 'Docker', 'GraphQL',
  'PostgreSQL', 'MongoDB', 'Redis', 'Terraform', 'Jenkins',
];

export const STATS = [
  { number: '4,000+', label: 'Software Engineers', sub: 'Top 1% of talent' },
  { number: '1,350+', label: 'Projects Delivered', sub: 'Across 50+ countries' },
  { number: '500+',   label: 'Global Clients', sub: 'Including Fortune 500' },
  { number: '100%',   label: 'Time-Zone Aligned', sub: 'Nearshore delivery' },
];

export const TESTIMONIALS = [
  {
    company: 'Rolls Royce',
    quote:
      'Repeat Business is the best testament to a team\'s ability to perform, and I have no hesitation in hiring them again. The pleasant collaboration style and high-level acumen rapidly catalyzed significant momentum towards achieving our objectives.',
    author: 'Brad M.',
    role: 'Product Manager',
    accentColor: '#1A1A1A',
  },
  {
    company: 'IQVIA',
    quote:
      'They provide amazing development and design resourcing, along with best in class account management support. We were able to speed up product delivery while reducing costs. Hands down the best vendor decision my team has made.',
    author: 'Adam I.',
    role: 'Director of Digital Strategy',
    accentColor: '#E8003D',
  },
  {
    company: 'Pinterest',
    quote:
      'The team had a real commitment to quality and delivered features our users absolutely loved. Communication was seamless, and timelines were consistently met. I would not hesitate to recommend them to any tech organization.',
    author: 'Sarah L.',
    role: 'Senior Engineering Manager',
    accentColor: '#E60023',
  },
  {
    company: 'Salesforce',
    quote:
      'We were incredibly impressed by the caliber of engineers placed with our team. They hit the ground running and contributed meaningful work from day one. The entire experience exceeded our expectations.',
    author: 'James T.',
    role: 'VP of Engineering',
    accentColor: '#00A1E0',
  },
  {
    company: 'GitHub',
    quote:
      'An outstanding partner for scaling our engineering capacity quickly without sacrificing quality. The vetting process ensures every engineer is immediately productive. We have extended our partnership three times.',
    author: 'Priya K.',
    role: 'Head of Platform Engineering',
    accentColor: '#181717',
  },
];

export const TEAM_ROLES = [
  { label: 'Software\ndevelopers', emoji: '💻' },
  { label: 'QA\nengineers',       emoji: '🧪' },
  { label: 'UX\ndesigners',       emoji: '🎨' },
  { label: 'Data\nscientists',    emoji: '📊' },
  { label: 'Project\nmanagers',   emoji: '📋' },
];

export const PROCESS_STEPS = [
  {
    step: 'Step 1',
    icon: '📞',
    title: 'Join exploration call.',
    body: 'Tell us more about your business on a discovery call. We\'ll discuss team structure, success criteria, timescale, budget, and required skill sets to see how we can help.',
  },
  {
    step: 'Step 2',
    icon: '🧩',
    title: 'Discuss solution and team structure.',
    body: 'In a matter of days, we\'ll present the ideal team structure for your project, including CVs of our top candidates who match your exact requirements.',
  },
  {
    step: 'Step 3',
    icon: '📈',
    title: 'Onboard your team and track performance.',
    body: 'Your dedicated team starts contributing from day one. We track performance with transparent metrics and regular reporting to ensure your goals are met.',
  },
];

export const AWARDS = [
  { icon: '🏆', title: 'Clutch Global Leader',    sub: '2024 Award' },
  { icon: '⭐', title: 'G2 Top Rated',            sub: 'IT Services' },
  { icon: '🥇', title: 'Inc. 5000',               sub: 'Fastest Growing' },
  { icon: '🌟', title: 'Great Place to Work',     sub: 'Certified' },
  { icon: '🎖️', title: 'Glassdoor Top Employer', sub: '4.6 Rating' },
];

export const FOOTER_LINKS = {
  Services: [
    'Staff Augmentation', 'Dedicated Teams', 'Software Outsourcing',
    'AI Transformation', 'QA Testing', 'UX/UI Design',
  ],
  Technologies: [
    'Java', 'Python', 'React', 'Node.js', 'Angular', 'AWS',
  ],
  Company: [
    'About Us', 'Careers', 'Press', 'Partners', 'Awards',
  ],
  Resources: [
    'Blog', 'Case Studies', 'Reports', 'Webinars', 'Documentation',
  ],
};
