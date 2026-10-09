export interface ServiceData {
  title: string;
  heroDescription: string;
  sections: string[];
  technologies: string[];
  businessProblemsWeSolve: string[];
  whyChooseThisService: string;
}

export const SERVICES_DATA: Record<string, ServiceData> = {
  'ai-development': {
    title: 'AI Development',
    heroDescription: 'Build Intelligent AI Solutions That Transform Your Business',
    sections: [
      'AI Consulting',
      'Generative AI',
      'AI Chatbots',
      'AI Agents',
      'LLM Integration',
      'Computer Vision',
      'NLP',
      'Recommendation Systems',
      'AI Automation',
      'Custom AI Models'
    ],
    technologies: [
      'OpenAI',
      'Gemini',
      'Claude',
      'Llama',
      'LangChain',
      'Python',
      'FastAPI',
      'TensorFlow',
      'PyTorch',
      'Vector Database'
    ],
    businessProblemsWeSolve: [
      'Manual processes slowing down operations',
      'Inefficient customer support',
      'Lack of personalized recommendations',
      'Unstructured data making insights difficult to extract'
    ],
    whyChooseThisService: 'We provide state-of-the-art AI solutions tailored to your specific business needs, ensuring high accuracy and seamless integration with existing systems.'
  },
  'web-development': {
    title: 'Web Development',
    heroDescription: 'Build High-Performance Modern Websites & Web Applications',
    sections: [
      'Business Websites',
      'Enterprise Portals',
      'SaaS Products',
      'Admin Dashboards',
      'Customer Portals',
      'PWAs',
      'API Integration',
      'CMS'
    ],
    technologies: [
      'React',
      'Next.js',
      'Vue',
      'Angular',
      'Node',
      'FastAPI',
      'Laravel',
      'MongoDB',
      'PostgreSQL'
    ],
    businessProblemsWeSolve: [
      'Outdated web presence affecting brand image',
      'Poor user experience leading to low conversion rates',
      'Lack of scalability in current systems',
      'Slow load times and performance issues'
    ],
    whyChooseThisService: 'Our expert team builds secure, scalable, and visually stunning web applications using the latest modern technologies.'
  },
  'mobile-app-development': {
    title: 'Mobile App Development',
    heroDescription: 'Build Beautiful Android & iOS Apps',
    sections: [
      'Android',
      'iOS',
      'Flutter',
      'React Native',
      'Cross Platform',
      'Native Apps',
      'Enterprise Apps',
      'App Maintenance'
    ],
    technologies: [
      'Flutter',
      'React Native',
      'Kotlin',
      'Swift',
      'Firebase',
      'FastAPI',
      'AWS'
    ],
    businessProblemsWeSolve: [
      'Inability to reach mobile-first audiences',
      'Poor mobile user experience',
      'High costs of maintaining separate iOS and Android codebases',
      'Lack of offline functionality in existing apps'
    ],
    whyChooseThisService: 'We develop high-quality, performant mobile apps that engage users and work flawlessly across all devices.'
  },
  'backend-development': {
    title: 'Backend Development',
    heroDescription: 'Scalable, Secure Backend Infrastructure',
    sections: [
      'REST API',
      'GraphQL',
      'Authentication',
      'Payment Gateway',
      'Database Design',
      'Microservices',
      'API Security',
      'Caching'
    ],
    technologies: [
      'FastAPI',
      'Node.js',
      'Spring Boot',
      'Django',
      'Redis',
      'RabbitMQ',
      'PostgreSQL',
      'MongoDB',
      'Docker'
    ],
    businessProblemsWeSolve: [
      'Frequent system crashes under high load',
      'Data security and compliance risks',
      'Slow API response times',
      'Complex legacy infrastructure slowing down feature development'
    ],
    whyChooseThisService: 'We design robust, scalable, and secure backend systems that power your applications efficiently.'
  },
  'frontend-development': {
    title: 'Frontend Development',
    heroDescription: 'Interactive & Modern User Interfaces',
    sections: [
      'Responsive UI',
      'React',
      'Next.js',
      'Vue',
      'Angular',
      'Tailwind',
      'Animations',
      'Accessibility'
    ],
    technologies: [
      'React',
      'Next.js',
      'Vue',
      'Angular',
      'Tailwind CSS',
      'TypeScript',
      'HTML5',
      'CSS3',
      'Webpack'
    ],
    businessProblemsWeSolve: [
      'Clunky and unresponsive user interfaces',
      'Poor accessibility compliance',
      'Inconsistent design across different screens',
      'High bounce rates due to unengaging UI'
    ],
    whyChooseThisService: 'Our frontend experts create pixel-perfect, highly interactive, and responsive user interfaces that captivate your audience.'
  },
  'saas-development': {
    title: 'SaaS Development',
    heroDescription: 'End-to-End SaaS Development Services',
    sections: [
      'Multi-Tenant',
      'Authentication',
      'Subscription Billing',
      'Stripe',
      'Analytics',
      'Admin Panel',
      'Dashboard',
      'APIs'
    ],
    technologies: [
      'Next.js',
      'React',
      'Node.js',
      'PostgreSQL',
      'Stripe',
      'Redis',
      'Docker',
      'AWS'
    ],
    businessProblemsWeSolve: [
      'Difficulty in managing subscription billing',
      'Challenges in isolating tenant data securely',
      'Lack of scalable architecture for growing user bases',
      'Need for a comprehensive admin dashboard'
    ],
    whyChooseThisService: 'We build fully-featured, secure, and highly scalable SaaS products that help you monetize your software effortlessly.'
  },
  'ui-ux-design': {
    title: 'UI/UX Design',
    heroDescription: 'Intuitive & User-Centric Design Solutions',
    sections: [
      'Research',
      'Wireframes',
      'Design Systems',
      'Figma',
      'Prototypes',
      'UX Audit',
      'Mobile Design',
      'Web Design'
    ],
    technologies: [
      'Figma',
      'Adobe XD',
      'Sketch',
      'InVision',
      'Zeplin',
      'Framer'
    ],
    businessProblemsWeSolve: [
      'Low user engagement due to confusing navigation',
      'Inconsistent branding across platforms',
      'Lack of user research leading to poor product-market fit',
      'High drop-off rates in key user journeys'
    ],
    whyChooseThisService: 'We create intuitive, beautiful, and user-centric designs that elevate your brand and improve user satisfaction.'
  },
  'qa-testing': {
    title: 'QA Testing',
    heroDescription: 'Comprehensive Quality Assurance & Testing',
    sections: [
      'Manual Testing',
      'Automation',
      'Performance',
      'Security Testing',
      'API Testing',
      'Selenium',
      'Cypress',
      'Playwright'
    ],
    technologies: [
      'Selenium',
      'Cypress',
      'Playwright',
      'JUnit',
      'Postman',
      'JMeter',
      'Appium'
    ],
    businessProblemsWeSolve: [
      'Frequent bugs in production',
      'Slow testing cycles delaying releases',
      'Poor application performance under stress',
      'Security vulnerabilities in software'
    ],
    whyChooseThisService: 'Our rigorous testing processes ensure your software is bug-free, highly performant, and secure before it reaches your users.'
  },
  'machine-learning': {
    title: 'Machine Learning',
    heroDescription: 'Advanced Machine Learning Models for Data-Driven Insights',
    sections: [
      'Prediction Models',
      'Classification',
      'Computer Vision',
      'NLP',
      'Forecasting',
      'Recommendation',
      'MLOps'
    ],
    technologies: [
      'Python',
      'TensorFlow',
      'PyTorch',
      'Scikit-learn',
      'Pandas',
      'MLflow',
      'AWS SageMaker'
    ],
    businessProblemsWeSolve: [
      'Inability to forecast trends accurately',
      'Manual sorting and classification of large datasets',
      'Lack of automated decision-making',
      'Underutilization of historical data'
    ],
    whyChooseThisService: 'We build and deploy sophisticated machine learning models that turn your data into actionable business intelligence.'
  },
  'data-engineering': {
    title: 'Data Engineering',
    heroDescription: 'Robust Data Engineering & Pipelines',
    sections: [
      'ETL',
      'Data Warehouse',
      'Pipelines',
      'Spark',
      'Kafka',
      'Snowflake',
      'BigQuery'
    ],
    technologies: [
      'Apache Spark',
      'Apache Kafka',
      'Snowflake',
      'Google BigQuery',
      'Airflow',
      'dbt',
      'Python'
    ],
    businessProblemsWeSolve: [
      'Siloed data across different platforms',
      'Slow data processing and reporting',
      'Inconsistent and unreliable data quality',
      'Inability to scale data storage efficiently'
    ],
    whyChooseThisService: 'We design and implement reliable, scalable data architectures that ensure your data is always accessible, accurate, and ready for analysis.'
  },
  'business-intelligence': {
    title: 'Business Intelligence',
    heroDescription: 'Actionable Insights with Advanced Business Intelligence',
    sections: [
      'Dashboards',
      'Reports',
      'Power BI',
      'Tableau',
      'KPI Analytics',
      'Data Visualization'
    ],
    technologies: [
      'Power BI',
      'Tableau',
      'Looker',
      'Metabase',
      'SQL',
      'Excel',
      'QlikView'
    ],
    businessProblemsWeSolve: [
      'Difficulty in tracking key performance indicators',
      'Time-consuming manual reporting processes',
      'Lack of real-time visibility into business metrics',
      'Poorly visualized data leading to misinterpretation'
    ],
    whyChooseThisService: 'We transform your raw data into interactive, easy-to-understand dashboards that empower you to make informed business decisions.'
  },
  'cms-development': {
    title: 'CMS Development',
    heroDescription: 'Custom & Scalable Content Management Systems',
    sections: [
      'WordPress',
      'Headless CMS',
      'Strapi',
      'Contentful',
      'Sanity',
      'Custom CMS'
    ],
    technologies: [
      'WordPress',
      'Strapi',
      'Contentful',
      'Sanity',
      'PHP',
      'Node.js',
      'React',
      'Next.js'
    ],
    businessProblemsWeSolve: [
      'Inability for non-technical staff to update website content',
      'Slow website performance due to bloated monolithic CMS',
      'Difficulty in delivering content across multiple channels',
      'Security vulnerabilities in outdated CMS platforms'
    ],
    whyChooseThisService: 'We implement flexible, secure, and high-performance CMS solutions that give you full control over your content.'
  },
  'ecommerce-development': {
    title: 'eCommerce Development',
    heroDescription: 'Powerful & High-Converting eCommerce Stores',
    sections: [
      'Shopify',
      'WooCommerce',
      'Magento',
      'Custom Store',
      'Payment Gateway',
      'Inventory',
      'Orders'
    ],
    technologies: [
      'Shopify',
      'WooCommerce',
      'Magento',
      'BigCommerce',
      'Stripe',
      'PayPal',
      'React'
    ],
    businessProblemsWeSolve: [
      'Low conversion rates and high cart abandonment',
      'Inefficient inventory and order management',
      'Lack of secure and seamless payment options',
      'Poor mobile shopping experience'
    ],
    whyChooseThisService: 'We build robust, visually appealing, and highly optimized eCommerce platforms that drive sales and streamline your operations.'
  },
  'cloud-applications': {
    title: 'Cloud Applications',
    heroDescription: 'Secure & Scalable Cloud-Native Applications',
    sections: [
      'AWS',
      'Azure',
      'GCP',
      'Serverless',
      'Kubernetes',
      'Docker',
      'CI/CD'
    ],
    technologies: [
      'AWS',
      'Microsoft Azure',
      'Google Cloud Platform',
      'Docker',
      'Kubernetes',
      'Terraform',
      'Serverless Framework'
    ],
    businessProblemsWeSolve: [
      'High IT infrastructure costs and maintenance overhead',
      'Inability to scale applications quickly based on demand',
      'Frequent downtime and reliability issues',
      'Slow deployment cycles'
    ],
    whyChooseThisService: 'We architect and develop resilient cloud-native applications that offer unparalleled scalability, security, and cost-efficiency.'
  },
  'devops': {
    title: 'DevOps',
    heroDescription: 'Streamlined Development & Operations Pipelines',
    sections: [
      'Docker',
      'Kubernetes',
      'CI/CD',
      'Monitoring',
      'AWS',
      'GitHub Actions',
      'Jenkins',
      'Terraform'
    ],
    technologies: [
      'Docker',
      'Kubernetes',
      'Jenkins',
      'GitHub Actions',
      'GitLab CI',
      'Terraform',
      'Ansible',
      'Prometheus'
    ],
    businessProblemsWeSolve: [
      'Manual and error-prone deployment processes',
      'Lack of alignment between development and operations teams',
      'Slow time-to-market for new features',
      'Inadequate monitoring leading to undetected system failures'
    ],
    whyChooseThisService: 'Our DevOps experts automate your software delivery pipelines, enhancing collaboration, reducing errors, and accelerating your time to market.'
  },
  'cybersecurity': {
    title: 'Cybersecurity',
    heroDescription: 'Comprehensive Cybersecurity & Risk Management',
    sections: [
      'Security Audit',
      'Pen Testing',
      'API Security',
      'Cloud Security',
      'IAM',
      'SOC',
      'Compliance'
    ],
    technologies: [
      'Kali Linux',
      'Wireshark',
      'Metasploit',
      'Nessus',
      'Burp Suite',
      'AWS Security Hub',
      'Splunk'
    ],
    businessProblemsWeSolve: [
      'Vulnerabilities exposing sensitive customer data',
      'Non-compliance with industry security standards',
      'Lack of visibility into potential security threats',
      'Insecure APIs leading to data breaches'
    ],
    whyChooseThisService: 'We provide end-to-end cybersecurity services to protect your digital assets, ensure compliance, and mitigate risks.'
  },
  'crm-development': {
    title: 'CRM Development',
    heroDescription: 'Custom CRM Solutions for Better Customer Relationships',
    sections: [
      'Sales CRM',
      'Lead Management',
      'Customer Portal',
      'Automation',
      'Reporting',
      'Integrations'
    ],
    technologies: [
      'Salesforce',
      'HubSpot APIs',
      'Node.js',
      'React',
      'PostgreSQL',
      'Python',
      'REST APIs'
    ],
    businessProblemsWeSolve: [
      'Disorganized customer data and lost leads',
      'Inefficient sales processes and lack of automation',
      'Poor visibility into the sales pipeline',
      'Difficulty in tracking customer interactions'
    ],
    whyChooseThisService: 'We build tailored CRM systems that centralize your customer data, automate workflows, and boost your sales team\'s productivity.'
  },
  'erp-development': {
    title: 'ERP Development',
    heroDescription: 'Integrated ERP Systems for Enterprise Efficiency',
    sections: [
      'HR',
      'Finance',
      'Inventory',
      'Attendance',
      'Payroll',
      'Manufacturing',
      'Education ERP'
    ],
    technologies: [
      'SAP',
      'Odoo APIs',
      'Java',
      'Spring Boot',
      'PostgreSQL',
      'Angular',
      'React'
    ],
    businessProblemsWeSolve: [
      'Fragmented business processes across different departments',
      'Inefficient inventory and resource management',
      'Manual payroll and HR processes',
      'Lack of real-time financial reporting'
    ],
    whyChooseThisService: 'We develop comprehensive ERP solutions that unify your business operations, streamline processes, and provide real-time insights.'
  },
  'big-data': {
    title: 'Big Data',
    heroDescription: 'Unlock the Power of Big Data Analytics',
    sections: [
      'Hadoop',
      'Spark',
      'Kafka',
      'Data Lake',
      'Streaming',
      'Analytics'
    ],
    technologies: [
      'Apache Hadoop',
      'Apache Spark',
      'Apache Kafka',
      'Amazon EMR',
      'Google Dataproc',
      'Scala',
      'Python'
    ],
    businessProblemsWeSolve: [
      'Inability to process and analyze massive volumes of data',
      'Lack of real-time streaming data insights',
      'Inefficient storage of unstructured data',
      'High costs of traditional data processing systems'
    ],
    whyChooseThisService: 'We implement scalable Big Data architectures that allow you to process, store, and analyze massive datasets efficiently.'
  },
  'digital-transformation': {
    title: 'Digital Transformation',
    heroDescription: 'Future-Proof Your Business with Digital Transformation',
    sections: [
      'Process Automation',
      'Legacy Modernization',
      'Cloud Migration',
      'AI Integration',
      'Enterprise Consulting'
    ],
    technologies: [
      'Cloud Platforms',
      'AI/ML',
      'RPA',
      'Microservices',
      'IoT',
      'Data Analytics'
    ],
    businessProblemsWeSolve: [
      'Outdated legacy systems hindering growth',
      'Manual and inefficient business processes',
      'Lack of agility in responding to market changes',
      'Poor integration between disparate IT systems'
    ],
    whyChooseThisService: 'We guide you through comprehensive digital transformation, modernizing your infrastructure and processes to keep you competitive.'
  },
  'backup-solutions': {
    title: 'Backup Solutions',
    heroDescription: 'Reliable Cloud Backup & Disaster Recovery',
    sections: [
      'Cloud Backup',
      'Disaster Recovery',
      'Automated Backup',
      'Security',
      'Monitoring'
    ],
    technologies: [
      'AWS Backup',
      'Veeam',
      'Acronis',
      'Azure Backup',
      'Google Cloud Storage',
      'Rsync'
    ],
    businessProblemsWeSolve: [
      'Risk of permanent data loss due to hardware failure or ransomware',
      'Lengthy downtime during system disasters',
      'Manual and unreliable backup processes',
      'Non-compliance with data retention policies'
    ],
    whyChooseThisService: 'We provide robust, automated backup and disaster recovery solutions that ensure your critical data is always safe and recoverable.'
  },
  'dedicated-teams': {
    title: 'Dedicated Teams',
    heroDescription: 'Hire Expert Dedicated Development Teams',
    sections: [
      'Hire Developers',
      'Dedicated Team',
      'Managed Team',
      'Agile Process',
      'Monthly Billing'
    ],
    technologies: [
      'Agile',
      'Scrum',
      'Jira',
      'Trello',
      'Slack',
      'GitHub',
      'Git'
    ],
    businessProblemsWeSolve: [
      'Lack of in-house technical expertise',
      'High costs and time involved in recruiting talent',
      'Inability to scale the development team quickly',
      'Need for focused experts on a long-term project'
    ],
    whyChooseThisService: 'We provide highly skilled, dedicated teams that seamlessly integrate with your processes and deliver high-quality software on time.'
  },
  'staff-augmentation': {
    title: 'Staff Augmentation',
    heroDescription: 'Flexible IT Staff Augmentation Services',
    sections: [
      'Remote Developers',
      'Contract Developers',
      'Team Extension',
      'Short-term Projects',
      'Long-term Hiring'
    ],
    technologies: [
      'Full-Stack Development',
      'Mobile Development',
      'QA Automation',
      'DevOps',
      'UI/UX'
    ],
    businessProblemsWeSolve: [
      'Skill gaps in your existing team',
      'Need for specialized talent for short-term projects',
      'Delays in project delivery due to understaffing',
      'Rigid hiring constraints'
    ],
    whyChooseThisService: 'Our staff augmentation services allow you to quickly scale your team with top-tier talent, giving you the flexibility and expertise you need.'
  },
  'software-outsourcing': {
    title: 'Software Outsourcing',
    heroDescription: 'Reliable End-to-End Software Outsourcing',
    sections: [
      'End-to-End Development',
      'Offshore Team',
      'Nearshore Team',
      'Dedicated PM',
      'Quality Assurance'
    ],
    technologies: [
      'Web Development',
      'Mobile Development',
      'Cloud Services',
      'AI/ML',
      'Blockchain'
    ],
    businessProblemsWeSolve: [
      'High local development costs',
      'Distraction from core business activities',
      'Lack of end-to-end project management capabilities',
      'Need for high-quality software within a tight budget'
    ],
    whyChooseThisService: 'We handle your entire software development lifecycle, providing cost-effective, high-quality results while you focus on your core business.'
  },
  'ai-transformation': {
    title: 'AI Transformation',
    heroDescription: 'Enterprise AI Transformation & Strategy',
    sections: [
      'AI Strategy',
      'AI Consulting',
      'AI Roadmap',
      'Process Automation',
      'Enterprise AI',
      'Custom AI Solutions'
    ],
    technologies: [
      'OpenAI',
      'Hugging Face',
      'AI Agents',
      'Enterprise Data Platforms',
      'Cloud ML'
    ],
    businessProblemsWeSolve: [
      'Uncertainty on how to adopt AI effectively',
      'Lack of a clear AI strategy and roadmap',
      'Manual, repetitive tasks consuming valuable time',
      'Falling behind competitors leveraging AI technologies'
    ],
    whyChooseThisService: 'We provide strategic consulting and implementation to embed AI deep into your enterprise operations, driving efficiency and innovation.'
  }
};
