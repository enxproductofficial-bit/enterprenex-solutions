import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Contact Options Data ─── */
const CONTACT_OPTIONS = [
  {
    title: 'Support',
    description: 'Need help with an ongoing project or technical issue?',
    value: '+91-9226860060',
    href: 'tel:+919226860060',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    title: 'Sales & Partnerships',
    description: 'Explore enterprise collaboration opportunities.',
    value: '+91-9226860060',
    href: 'tel:+919226860060',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
  {
    title: 'Visit Headquarters',
    description: 'Stop by our physical office in Chhatrapati Sambhajinagar.',
    value: 'Plot No. 148, Waluj Mahanagar 1, MH',
    href: 'https://maps.app.goo.gl/GfBYcfCXTAjaq6Dn8',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Email Inquiry',
    description: 'Send us detailed project specifications.',
    value: 'hr@enterprenexsolution.com',
    href: 'mailto:hr@enterprenexsolution.com',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

/* ─── Why Us Features ─── */
const WHY_FEATURES = [
  { title: 'Free Consultation', description: 'Schedule a zero-obligation discovery call to discuss your business goals and technical requirements with our experts.', icon: '💬' },
  { title: 'Fast Response Guarantee', description: 'Our team guarantees a dedicated response within 24 business hours for all inquiries.', icon: '⚡' },
  { title: 'Enterprise Standards', description: 'We follow industry-leading security, data protection, and scalable architecture patterns.', icon: '🛡️' },
  { title: 'Agile Delivery', description: 'Iterative sprint releases ensuring you see tangible progress fast and frequently.', icon: '🚀' },
  { title: 'Senior Tech Experts', description: 'Work directly with top-tier product designers, cloud architects, and full-stack engineers.', icon: '🏆' },
  { title: 'Data-Driven ROI', description: 'Every solution is designed around measurable metrics, performance, and business growth.', icon: '📊' },
];

/* ─── FAQs ─── */
const FAQS = [
  {
    question: 'Do you sign NDAs before discussing technical details?',
    answer: 'Absolutely. We respect your intellectual property rights and gladly sign a Non-Disclosure Agreement (NDA) before diving into sensitive project requirements.',
  },
  {
    question: 'Do you work with international clients across time zones?',
    answer: 'Yes, we partner with startups and enterprises globally. Our team is accustomed to asynchronous communication and scheduled overlap hours for seamless collaboration.',
  },
  {
    question: 'What is the typical timeline for a custom software project?',
    answer: 'Project timelines vary based on scope. MVP development typically takes 6–10 weeks, while full enterprise platforms range from 3–6 months. We outline clear sprint milestones during discovery.',
  },
  {
    question: 'What pricing and engagement models do you offer?',
    answer: 'We offer flexible engagement models: Fixed-Price milestones for clearly scoped projects, or Dedicated Team / Time & Materials for evolving product development.',
  },
  {
    question: 'Can I hire a dedicated team of engineers and designers?',
    answer: 'Yes! We offer dedicated software development teams tailored to your tech stack, giving you full control over product roadmaps without recruitment overhead.',
  },
];

/* ─── Complete States & Cities Data (All 36 Indian States & UTs + Global) ─── */
const STATES_AND_CITIES: Record<string, string[]> = {
  // Indian States & Union Territories (36 Total)
  'Andaman & Nicobar Islands (UT)': ['Port Blair', 'Diglipur', 'Mayabunder', 'Garacharma', 'Bambooflat', 'Other'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada', 'Tirupati', 'Rajahmundry', 'Kadapa', 'Anantapur', 'Eluru', 'Vizianagaram', 'Ongole', 'Nandyal', 'Machilipatnam', 'Chittoor', 'Hindupur', 'Other'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Tezu', 'Changlang', 'Along', 'Khonsa', 'Other'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Diphu', 'North Lakhimpur', 'Karimganj', 'Goalpara', 'Other'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Bettiah', 'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Other'],
  'Chandigarh (UT)': ['Chandigarh', 'Other'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Durg', 'Chirmiri', 'Dhamtari', 'Other'],
  'Dadra & Nagar Haveli and Daman & Diu (UT)': ['Daman', 'Diu', 'Silvassa', 'Other'],
  'Delhi NCR (UT)': ['New Delhi', 'Noida', 'Gurugram', 'Ghaziabad', 'Faridabad', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Other'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Cansaulim', 'Other'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Bharuch', 'Mehsana', 'Bhuj', 'Porbandar', 'Valsad', 'Vapi', 'Patan', 'Palanpur', 'Other'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Rewari', 'Palwal', 'Other'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Baddi', 'Bilaspur', 'Kullu', 'Hamirpur', 'Una', 'Chamba', 'Palampur', 'Manali', 'Other'],
  'Jammu & Kashmir (UT)': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Udhampur', 'Sopore', 'Rajouri', 'Punch', 'Other'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Phusro', 'Medininagar', 'Chirkunda', 'Dumka', 'Other'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Vijayapura', 'Shimoga', 'Tumakuru', 'Raichur', 'Bidar', 'Hosapete', 'Gadag', 'Udupi', 'Hassan', 'Chitradurga', 'Other'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad', 'Manjeri', 'Thalassery', 'Ponnani', 'Vatakara', 'Kasaragod', 'Pathanamthitta', 'Other'],
  'Ladakh (UT)': ['Leh', 'Kargil', 'Other'],
  'Lakshadweep (UT)': ['Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Other'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Other'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Pimpri-Chinchwad', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Navi Mumbai', 'Solapur', 'Mira-Bhayandar', 'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Akola', 'Ulhasnagar', 'Sangli', 'Malegaon', 'Jalgaon', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna', 'Ambarnath', 'Bhusawal', 'Panvel', 'Badlapur', 'Gondia', 'Satara', 'Yavatmal', 'Achalpur', 'Osmanabad', 'Nandurbar', 'Wardha', 'Palghar', 'Baramati', 'Ratnagiri', 'Sindhudurg', 'Other'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul', 'Senapati', 'Tamenglong', 'Other'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Baghmara', 'Resubelpara', 'Nongstoin', 'Other'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Lawngtlai', 'Other'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon', 'Phek', 'Other'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Bargarh', 'Jeypore', 'Rayagada', 'Other'],
  'Puducherry (UT)': ['Puducherry', 'Karaikal', 'Yanam', 'Mahe', 'Other'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga', 'Abohar', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Firozpur', 'Kapurthala', 'Other'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Baran', 'Dholpur', 'Hanumangarh', 'Beawar', 'Jhunjhunu', 'Churu', 'Other'],
  'Sikkim': ['Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Jorethang', 'Singtam', 'Other'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam (Ooty)', 'Hosur', 'Kanchipuram', 'Nagercoil', 'Cuddalore', 'Kumbakonam', 'Other'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet', 'Miryalaguda', 'Jagtial', 'Other'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Khowai', 'Other'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Prayagraj (Allahabad)', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Ayodhya', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Mau', 'Hapur', 'Greater Noida', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jaunpur', 'Other'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital', 'Almora', 'Pithoragarh', 'Other'],
  'West Bengal': ['Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Other'],

  // International States & Regions
  'California (USA)': ['Los Angeles', 'San Francisco', 'San Jose', 'San Diego', 'Sacramento', 'Fresno', 'Oakland', 'Long Beach', 'Irvine', 'Other'],
  'New York (USA)': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'Other'],
  'Texas (USA)': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Plano', 'Other'],
  'Florida (USA)': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Port St. Lucie', 'Other'],
  'Illinois (USA)': ['Chicago', 'Aurora', 'Joliet', 'Naperville', 'Rockford', 'Other'],
  'Washington (USA)': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Other'],
  'England (UK)': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Newcastle', 'Bristol', 'Sheffield', 'Other'],
  'Scotland (UK)': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Other'],
  'Dubai / UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Other'],
  'Ontario (Canada)': ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Other'],
  'British Columbia (Canada)': ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria', 'Other'],
  'New South Wales (Australia)': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Other'],
  'Victoria (Australia)': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Other'],
  'Bavaria (Germany)': ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Other'],
  'Singapore': ['Singapore City', 'Jurong East', 'Woodlands', 'Tampines', 'Other'],
  'Other State / Province / Territory': ['Other City']
};

/* ─── Animation Variants ─── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFocused, setActiveFocused] = useState<string | null>(null);
  const [mapTouched, setMapTouched] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [customBudget, setCustomBudget] = useState('');
  
  // Touch unused vars for TS compiler
  void openFaq;
  void setOpenFaq;
  void activeFocused;
  void mapTouched;
  void setMapTouched;

  // Form State & Validation
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    service: '',
    budget: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.address.trim()) newErrors.address = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State / Province is required';
    if (!formData.country.trim()) newErrors.country = 'Please select a country';
    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a brief description of your project';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Resolve effective budget value (custom budget input or selected option)
    const effectiveBudget = formData.budget === 'Custom Amount' && customBudget.trim() 
      ? (customBudget.startsWith('₹') ? customBudget.trim() : `₹ ${customBudget.trim()}`)
      : (formData.budget || 'Not Specified');
    
    const adminEmailPayload = {
      from: 'Enterprenex Portal <onboarding@resend.dev>',
      to: ['hr@enterprenexsolution.com'],
      reply_to: formData.email,
      subject: `⚡ New Project Inquiry: ${formData.fullName} - ${formData.company || 'Individual'} (${formData.city}, ${formData.state})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Inquiry Submission</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 650px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
                  
                  <!-- HEADER -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 32px; text-align: center; border-bottom: 4px solid #F66135;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <span style="display: inline-block; background: rgba(246, 97, 53, 0.2); border: 1px solid rgba(246, 97, 53, 0.4); color: #F66135; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 14px; border-radius: 99px; margin-bottom: 12px;">
                              New Client Lead
                            </span>
                            <h1 style="margin: 8px 0 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Enterprenex Solutions</h1>
                            <p style="margin: 6px 0 0; font-size: 14px; color: #94a3b8;">High-Priority Project Consultation Request</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- MAIN BODY -->
                  <tr>
                    <td style="padding: 36px 32px; background-color: #ffffff;">
                      
                      <!-- CLIENT CONTACT DETAILS SECTION -->
                      <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 800; color: #F66135; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #fff1ed; padding-bottom: 8px;">
                        👤 Client Overview
                      </h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <tr>
                          <td width="35%" style="padding: 12px 16px; background-color: #f8fafc; font-weight: 700; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Full Name</td>
                          <td style="padding: 12px 16px; background-color: #ffffff; font-weight: 700; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${formData.fullName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; background-color: #f8fafc; font-weight: 700; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Company / Org</td>
                          <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${formData.company || 'Not Provided'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; background-color: #f8fafc; font-weight: 700; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Email Address</td>
                          <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; border-bottom: 1px solid #e2e8f0;">
                            <a href="mailto:${formData.email}" style="color: #F66135; font-weight: 700; text-decoration: none;">${formData.email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; background-color: #f8fafc; font-weight: 700; font-size: 13px; color: #475569;">Phone Number</td>
                          <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; color: #0f172a;">${formData.phone || 'Not Provided'}</td>
                        </tr>
                      </table>

                      <!-- LOCATION & ADDRESS SECTION -->
                      <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 800; color: #F66135; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #fff1ed; padding-bottom: 8px;">
                        📍 Location & Address
                      </h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <tr>
                          <td width="35%" style="padding: 12px 16px; background-color: #f8fafc; font-weight: 700; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Street Address</td>
                          <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${formData.address}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; background-color: #f8fafc; font-weight: 700; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">City</td>
                          <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${formData.city}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; background-color: #f8fafc; font-weight: 700; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">State / Province</td>
                          <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${formData.state}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; background-color: #f8fafc; font-weight: 700; font-size: 13px; color: #475569;">Country</td>
                          <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; color: #0f172a; font-weight: 600;">${formData.country}</td>
                        </tr>
                      </table>

                      <!-- PROJECT SPECIFICATIONS SECTION -->
                      <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 800; color: #F66135; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #fff1ed; padding-bottom: 8px;">
                        💼 Project Scope & Budget
                      </h2>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <tr>
                          <td width="35%" style="padding: 12px 16px; background-color: #f8fafc; font-weight: 700; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Service Required</td>
                          <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${formData.service || 'General Software Consultation'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; background-color: #f8fafc; font-weight: 700; font-size: 13px; color: #475569;">Estimated Budget</td>
                          <td style="padding: 12px 16px; background-color: #ffffff; font-size: 14px; color: #16a34a; font-weight: 800;">${effectiveBudget}</td>
                        </tr>
                      </table>

                      <!-- PROJECT DESCRIPTION BOX -->
                      <h2 style="margin: 0 0 12px; font-size: 14px; font-weight: 800; color: #F66135; text-transform: uppercase; letter-spacing: 1px;">
                        📝 Detailed Project Description
                      </h2>
                      <div style="background-color: #f8fafc; border-left: 4px solid #F66135; border-radius: 8px; padding: 20px; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #1e293b; white-space: pre-wrap;">${formData.description}</p>
                      </div>

                      <!-- ACTION BUTTON -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                        <tr>
                          <td align="center">
                            <a href="mailto:${formData.email}?subject=Re:%20Inquiry%20from%20Enterprenex%20Solutions" style="display: inline-block; background-color: #F66135; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 99px; box-shadow: 0 4px 14px rgba(246, 97, 53, 0.35);">
                              Reply Directly to Client →
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background-color: #0f172a; padding: 24px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #1e293b;">
                      <p style="margin: 0 0 4px; color: #94a3b8; font-weight: 600;">Enterprenex Solutions Pvt Ltd</p>
                      <p style="margin: 0;">Automated Lead Notification System • ${new Date().toLocaleString()}</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const clientEmail = formData.email.trim();

    const clientConfirmationPayload = {
      from: 'Enterprenex Solutions <onboarding@resend.dev>',
      to: [clientEmail],
      subject: `✅ Thank you for your inquiry, ${formData.fullName.split(' ')[0] || 'valued client'} – Enterprenex Solutions`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Inquiry Received</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
                  
                  <!-- HEADER -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 32px; text-align: center; border-bottom: 4px solid #F66135;">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Enterprenex Solutions</h1>
                      <p style="margin: 6px 0 0; font-size: 13px; color: #F66135; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Inquiry Confirmation & Receipt</p>
                    </td>
                  </tr>

                  <!-- BODY CONTENT -->
                  <tr>
                    <td style="padding: 36px 32px; background-color: #ffffff; color: #1e293b;">
                      <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #0f172a;">Dear ${formData.fullName},</h2>
                      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
                        Thank you for reaching out to <strong>Enterprenex Solutions</strong>. We have successfully received your project inquiry! Our solution architects and engineering directors are reviewing your project requirements and will get back to you at <strong>${clientEmail}</strong> within <strong>24 business hours</strong> with a tailored proposal.
                      </p>

                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 28px;">
                        <h3 style="margin: 0 0 14px; font-size: 14px; font-weight: 800; color: #F66135; text-transform: uppercase; letter-spacing: 1px;">
                          📋 Summary of Your Submission
                        </h3>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                          <tr>
                            <td width="40%" style="padding: 6px 0; color: #64748b; font-weight: 600;">Service Required:</td>
                            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${formData.service || 'General Consultation'}</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Location:</td>
                            <td style="padding: 6px 0; color: #0f172a;">${formData.city}, ${formData.state}, ${formData.country}</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Estimated Budget:</td>
                            <td style="padding: 6px 0; color: #16a34a; font-weight: 700;">${effectiveBudget}</td>
                          </tr>
                        </table>
                      </div>

                      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 8px;">
                        If you need to update any information or send additional documentation, feel free to reply directly to this email or reach us at <a href="mailto:hr@enterprenexsolution.com" style="color: #F66135; font-weight: 700; text-decoration: none;">hr@enterprenexsolution.com</a>.
                      </p>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background-color: #0f172a; padding: 24px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #1e293b;">
                      <p style="margin: 0 0 4px; color: #94a3b8; font-weight: 600;">Enterprenex Solutions Pvt Ltd</p>
                      <p style="margin: 0;">Building Scalable Enterprise Software & AI Platforms</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    try {
      let sentSuccess = false;

      // 1. Primary dispatch: Vercel serverless /api/send endpoint
      try {
        const sendResp = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminEmailPayload)
        });
        if (sendResp.ok) {
          sentSuccess = true;
        }
      } catch (e) {
        console.log('Primary /api/send dispatch notice:', e);
      }

      // 2. Secondary fallback: Direct Resend API or Vite dev proxy
      if (!sentSuccess) {
        const apiKey = import.meta.env.VITE_RESEND_API_KEY;
        const resendEndpoint = apiKey ? 'https://api.resend.com/emails' : '/api/resend/emails';
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        try {
          const fallbackResp = await fetch(resendEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(adminEmailPayload)
          });
          if (fallbackResp.ok) {
            sentSuccess = true;
          }
        } catch (e) {
          console.log('Fallback resend dispatch notice:', e);
        }
      }

      // 3. Send Client Confirmation Receipt Email asynchronously
      try {
        const apiKey = import.meta.env.VITE_RESEND_API_KEY;
        fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientConfirmationPayload)
        }).catch(async () => {
          if (apiKey) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify(clientConfirmationPayload)
            }).catch(() => {});
          }
        });
      } catch (clientErr) {
        console.log('Client confirmation receipt notice:', clientErr);
      }

      setIsSubmitting(false);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error sending email:', error);
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <main id="main-content">
      {/* ── RESPONSIVE EMBEDDED STYLES ── */}
      <style>{`
        .contact-section-pad {
          padding: 4.5rem 1rem;
        }
        .contact-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        .contact-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .contact-map-layout {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 1.5rem;
          align-items: stretch;
        }
        .contact-opt-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 1.25rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
          cursor: pointer;
        }
        .contact-opt-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: rgba(246,97,53,0.08);
          border: 1.5px solid rgba(246,97,53,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: #F66135;
        }
        .contact-feature-card {
          padding: 1.75rem 1.5rem;
          background: #f8fafc;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .contact-form-card {
          max-width: 860px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          border: 1.5px solid #e2e8f0;
          padding: clamp(1.75rem, 4.5vw, 3.25rem);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.05);
        }
        .form-input-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.85rem 1.1rem;
          font-size: 0.95rem;
          color: #0f172a;
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .form-input-field:focus {
          border-color: #F66135;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(246, 97, 53, 0.15), 0 4px 12px rgba(246, 97, 53, 0.08);
          transform: translateY(-1px);
        }
        .form-input-field.input-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
        }

        /* HIGH-DENSITY MOBILE RESPONSIVENESS (< 768px) */
        @media (max-width: 768px) {
          .contact-section-pad {
            padding: 2.25rem 0.75rem !important;
          }
          .contact-section-h2 {
            font-size: 1.5rem !important;
            line-height: 1.25 !important;
            margin-bottom: 0.4rem !important;
          }
          .contact-section-sub {
            font-size: 0.88rem !important;
            line-height: 1.45 !important;
            margin-bottom: 1.25rem !important;
          }
          .contact-grid-4 {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.65rem !important;
          }
          .contact-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 0.65rem !important;
          }
          .contact-map-layout {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .contact-opt-card {
            padding: 1rem 0.65rem !important;
            border-radius: 14px !important;
          }
          .contact-opt-icon-box {
            width: 42px !important;
            height: 42px !important;
            border-radius: 10px !important;
            margin-bottom: 0.5rem !important;
          }
          .contact-opt-icon-box svg {
            width: 20px !important;
            height: 20px !important;
          }
          .contact-opt-title {
            font-size: 0.92rem !important;
            margin-bottom: 0.2rem !important;
          }
          .contact-opt-desc {
            font-size: 0.78rem !important;
            margin-bottom: 0.5rem !important;
            line-height: 1.35 !important;
          }
          .contact-opt-val {
            font-size: 0.78rem !important;
          }
          .contact-feature-card {
            padding: 1.1rem 0.9rem !important;
            border-radius: 14px !important;
          }
          .contact-feature-icon {
            font-size: 1.6rem !important;
            margin-bottom: 0.5rem !important;
          }
          .contact-feature-title {
            font-size: 1rem !important;
            margin-bottom: 0.3rem !important;
          }
          .contact-feature-desc {
            font-size: 0.84rem !important;
            line-height: 1.45 !important;
          }
          .contact-form-card {
            padding: 1.15rem 0.85rem !important;
            border-radius: 16px !important;
          }
          .form-input-field {
            padding: 0.62rem 0.8rem !important;
            font-size: 0.88rem !important;
            border-radius: 8px !important;
          }
          .contact-map-iframe {
            height: 240px !important;
            border-radius: 14px !important;
          }
        }

        @media (max-width: 480px) {
          .contact-grid-4 {
            grid-template-columns: 1fr !important;
            gap: 0.65rem !important;
          }
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          minHeight: '52vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '5.5rem 1rem 3.5rem',
          background: '#ffffff',
        }}
      >
        {/* Animated background radial blurs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <motion.div
            animate={{ y: [0, -35, 18, -22, 0], x: [0, 24, -30, 15, 0], scale: [1, 1.08, 0.95, 1.03, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '-12%',
              left: '-6%',
              width: '520px',
              height: '520px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(246,97,53,0.22) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          <motion.div
            animate={{ y: [0, 35, -40, 16, 0], x: [0, -20, 32, -12, 0], scale: [1, 0.94, 1.1, 0.97, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              bottom: '-12%',
              right: '-6%',
              width: '480px',
              height: '480px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(246,97,53,0.16) 0%, transparent 70%)',
              filter: 'blur(90px)',
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '860px', textAlign: 'center' }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span
              variants={fadeUp}
              style={{
                display: 'inline-block',
                background: 'rgba(246,97,53,0.08)',
                border: '1px solid rgba(246,97,53,0.2)',
                color: '#F66135',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.4rem 1.1rem',
                borderRadius: '999px',
                marginBottom: '1.5rem',
              }}
            >
              Contact Us
            </motion.span>
            <motion.h1
              variants={fadeUp}
              style={{
                fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                color: '#0f172a',
                marginBottom: '1.25rem',
              }}
            >
              Let's Build Something<br />
              <span style={{ color: '#F66135' }}>Exceptional Together</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.7,
                color: '#475569',
                maxWidth: '620px',
                margin: '0 auto 2.25rem',
              }}
            >
              Connect with senior software architects and digital strategists to accelerate your enterprise tech roadmap.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#contact-form" className="btn btn-orange" style={{ borderRadius: '9999px', padding: '0.8rem 2rem', fontWeight: 600 }}>
                Get Free Consultation
              </a>
              <a
                href="tel:+919226860060"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.8rem 1.8rem',
                  borderRadius: '9999px',
                  border: '1.5px solid #cbd5e1',
                  color: '#1e293b',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  background: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s ease',
                }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: '#F66135' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call +91 92268 60060
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT OPTIONS ── */}
      <section className="contact-section-pad" style={{ background: '#f8fafc' }}>
        <div className="wrap">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="contact-grid-4"
          >
            {CONTACT_OPTIONS.map((opt, i) => (
              <motion.a
                key={i}
                href={opt.href}
                target={opt.href.startsWith('http') ? '_blank' : undefined}
                rel={opt.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -7, scale: 1.01, boxShadow: '0 20px 40px rgba(246,97,53,0.12)', borderColor: 'rgba(246,97,53,0.4)' }}
                className="contact-opt-card"
              >
                <div className="contact-opt-icon-box">
                  {opt.icon}
                </div>
                <h3 className="contact-opt-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>{opt.title}</h3>
                <p className="contact-opt-desc" style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>{opt.description}</p>
                <span className="contact-opt-val" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F66135', wordBreak: 'break-all', marginTop: 'auto' }}>{opt.value}</span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHY PARTNER WITH US (BENTO GRID) ── */}
      <section className="contact-section-pad" style={{ background: '#ffffff' }}>
        <div className="wrap">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(246,97,53,0.08)',
                  border: '1px solid rgba(246,97,53,0.2)',
                  color: '#F66135',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  marginBottom: '0.75rem',
                }}
              >
                Why Enterprenex
              </span>
              <h2 className="contact-section-h2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                Why Partner <span style={{ color: '#F66135' }}>With Us?</span>
              </h2>
              <p className="contact-section-sub" style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
                We combine high-touch enterprise consulting with rapid startup iteration to deliver unmatched ROI.
              </p>
            </motion.div>

            <div className="contact-grid-2">
              {WHY_FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  whileHover={{ y: -5, borderColor: 'rgba(246,97,53,0.35)', boxShadow: '0 16px 36px rgba(246,97,53,0.08)' }}
                  className="contact-feature-card"
                >
                  <div className="contact-feature-icon" style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                  <h3 className="contact-feature-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>{f.title}</h3>
                  <p className="contact-feature-desc" style={{ fontSize: '0.94rem', color: '#64748b', lineHeight: 1.65 }}>{f.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section id="contact-form" className="contact-section-pad" style={{ background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(246,97,53,0.12) 0%, transparent 70%)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(246,97,53,0.10) 0%, transparent 70%)', filter: 'blur(90px)', pointerEvents: 'none' }} />

        <div className="wrap" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(246,97,53,0.08)',
                  border: '1px solid rgba(246,97,53,0.2)',
                  color: '#F66135',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  marginBottom: '0.75rem',
                }}
              >
                Inquiry Form
              </span>
              <h2 className="contact-section-h2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                Partner with <span style={{ color: '#F66135' }}>Excellence</span>
              </h2>
              <p className="contact-section-sub" style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                Fill in your project specifications and our strategic team will reach out with a detailed proposal.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="contact-form-card">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    style={{ textAlign: 'center', padding: '3.5rem 1rem' }}
                  >
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(34, 197, 94, 0.12)',
                        border: '2px solid rgba(34, 197, 94, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: '#16a34a',
                      }}
                    >
                      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Inquiry Submitted Successfully!</h3>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 2rem' }}>
                      Thank you for contacting Enterprenex Solutions. Our engineering and strategy team will review your requirements and respond within 24 business hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setCustomCity('');
                        setFormData({
                          fullName: '',
                          company: '',
                          email: '',
                          phone: '',
                          address: '',
                          city: '',
                          state: '',
                          country: '',
                          service: '',
                          budget: '',
                          description: '',
                        });
                      }}
                      className="btn btn-orange"
                      style={{ borderRadius: '9999px', padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
                    >
                      Submit Another Inquiry
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={(e) => {
                      // If custom city was typed, set formData.city to customCity
                      if (formData.city === 'Other' && customCity.trim()) {
                        formData.city = customCity.trim();
                      }
                      handleSubmit(e);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                  >
                    <div className="contact-grid-2">
                      <motion.div animate={{ x: errors.fullName ? [-4, 4, -4, 4, 0] : 0 }} transition={{ duration: 0.3 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                            Full Name <span style={{ color: '#F66135' }}>*</span>
                          </span>
                          <input
                            type="text"
                            placeholder="Enter your name"
                            className={`form-input-field ${errors.fullName ? 'input-error' : ''}`}
                            value={formData.fullName}
                            onFocus={() => setActiveFocused('fullName')}
                            onBlur={() => setActiveFocused(null)}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                          />
                          {errors.fullName && <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>{errors.fullName}</span>}
                        </label>
                      </motion.div>

                      <div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>Company / Organization</span>
                          <input
                            type="text"
                            placeholder="Acme Inc."
                            className="form-input-field"
                            value={formData.company}
                            onFocus={() => setActiveFocused('company')}
                            onBlur={() => setActiveFocused(null)}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="contact-grid-2">
                      <motion.div animate={{ x: errors.email ? [-4, 4, -4, 4, 0] : 0 }} transition={{ duration: 0.3 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                            Business Email <span style={{ color: '#F66135' }}>*</span>
                          </span>
                          <input
                            type="email"
                            placeholder="you@company.com"
                            className={`form-input-field ${errors.email ? 'input-error' : ''}`}
                            value={formData.email}
                            onFocus={() => setActiveFocused('email')}
                            onBlur={() => setActiveFocused(null)}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                          {errors.email && <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>{errors.email}</span>}
                        </label>
                      </motion.div>

                      <div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>Phone Number</span>
                          <input
                            type="tel"
                            placeholder="+91 92268 60060"
                            className="form-input-field"
                            value={formData.phone}
                            onFocus={() => setActiveFocused('phone')}
                            onBlur={() => setActiveFocused(null)}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 3: Street Address */}
                    <motion.div animate={{ x: errors.address ? [-4, 4, -4, 4, 0] : 0 }} transition={{ duration: 0.3 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                          Street Address <span style={{ color: '#F66135' }}>*</span>
                        </span>
                        <input
                          type="text"
                          placeholder="123 Innovation Way, Suite 400"
                          className={`form-input-field ${errors.address ? 'input-error' : ''}`}
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                        {errors.address && <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>{errors.address}</span>}
                      </label>
                    </motion.div>

                    {/* Row 4: State / Province, City (State-wise options), Country */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                      
                      {/* State Choice Dropdown */}
                      <motion.div animate={{ x: errors.state ? [-4, 4, -4, 4, 0] : 0 }} transition={{ duration: 0.3 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                            State / Province <span style={{ color: '#F66135' }}>*</span>
                          </span>
                          <select
                            className={`form-input-field ${errors.state ? 'input-error' : ''}`}
                            value={formData.state}
                            onChange={(e) => {
                              const selState = e.target.value;
                              setCustomCity('');
                              setFormData(prev => ({ ...prev, state: selState, city: '' }));
                              if (errors.state) {
                                setErrors(prev => { const u = { ...prev }; delete u.state; return u; });
                              }
                            }}
                          >
                            <option value="">Select state / province</option>
                            {Object.keys(STATES_AND_CITIES).map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                          {errors.state && <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>{errors.state}</span>}
                        </label>
                      </motion.div>

                      {/* City State-Wise Choice Dropdown */}
                      <motion.div animate={{ x: errors.city ? [-4, 4, -4, 4, 0] : 0 }} transition={{ duration: 0.3 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                            City <span style={{ color: '#F66135' }}>*</span>
                          </span>
                          <select
                            className={`form-input-field ${errors.city ? 'input-error' : ''}`}
                            value={formData.city}
                            disabled={!formData.state}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleInputChange('city', val);
                              if (val !== 'Other') setCustomCity('');
                            }}
                          >
                            <option value="">{formData.state ? 'Select city' : 'Select state first'}</option>
                            {formData.state && STATES_AND_CITIES[formData.state]?.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          {errors.city && <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>{errors.city}</span>}
                        </label>
                      </motion.div>

                      {/* Country Select Dropdown */}
                      <motion.div animate={{ x: errors.country ? [-4, 4, -4, 4, 0] : 0 }} transition={{ duration: 0.3 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                            Country <span style={{ color: '#F66135' }}>*</span>
                          </span>
                          <select
                            className={`form-input-field ${errors.country ? 'input-error' : ''}`}
                            value={formData.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                          >
                            <option value="">Select country</option>
                            <option value="India">India</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                            <option value="UAE">UAE</option>
                            <option value="Germany">Germany</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.country && <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>{errors.country}</span>}
                        </label>
                      </motion.div>

                    </div>

                    {/* Custom City Input if 'Other' selected */}
                    {formData.city === 'Other' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                            Specify Your City Name <span style={{ color: '#F66135' }}>*</span>
                          </span>
                          <input
                            type="text"
                            placeholder="Enter your city name"
                            className="form-input-field"
                            value={customCity}
                            onChange={(e) => setCustomCity(e.target.value)}
                          />
                        </label>
                      </motion.div>
                    )}

                    {/* Row 5: Service Required & Estimated Budget */}
                    <div className="contact-grid-2">
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>Service Required</span>
                        <select
                          className="form-input-field"
                          value={formData.service}
                          onChange={(e) => handleInputChange('service', e.target.value)}
                        >
                          <option value="">Select service</option>
                          <option value="AI Solutions & ML">AI Solutions & ML</option>
                          <option value="Web Application Dev">Web Application Dev</option>
                          <option value="Mobile App (iOS/Android)">Mobile App (iOS/Android)</option>
                          <option value="SaaS Platform Architecture">SaaS Platform Architecture</option>
                          <option value="Cloud & DevOps">Cloud & DevOps</option>
                          <option value="Dedicated Development Team">Dedicated Development Team</option>
                        </select>
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>Estimated Budget (₹ INR)</span>
                        <select
                          className="form-input-field"
                          value={formData.budget}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleInputChange('budget', val);
                            if (val !== 'Custom Amount') setCustomBudget('');
                          }}
                        >
                          <option value="">Select budget range (₹ INR)</option>
                          <option value="Under ₹2 Lakhs">Under ₹2 Lakhs (Under ₹2,00,000)</option>
                          <option value="₹2 Lakhs – ₹5 Lakhs">₹2 Lakhs – ₹5 Lakhs (₹2L – ₹5L)</option>
                          <option value="₹5 Lakhs – ₹15 Lakhs">₹5 Lakhs – ₹15 Lakhs (₹5L – ₹15L)</option>
                          <option value="₹15 Lakhs – ₹50 Lakhs">₹15 Lakhs – ₹50 Lakhs (₹15L – ₹50L)</option>
                          <option value="₹50 Lakhs+">₹50 Lakhs+ (₹50L+)</option>
                          <option value="Custom Amount">Custom Amount (Specify Exact ₹ Budget)</option>
                        </select>
                      </label>
                    </div>

                    {/* Custom Budget Input if 'Custom Amount' selected */}
                    {formData.budget === 'Custom Amount' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                            Specify Your Custom Budget Amount (₹ INR) <span style={{ color: '#F66135' }}>*</span>
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. ₹ 3,50,000 or ₹ 1.5 Crores"
                            className="form-input-field"
                            value={customBudget}
                            onChange={(e) => setCustomBudget(e.target.value)}
                          />
                        </label>
                      </motion.div>
                    )}

                    <motion.div animate={{ x: errors.description ? [-4, 4, -4, 4, 0] : 0 }} transition={{ duration: 0.3 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                          Project Description <span style={{ color: '#F66135' }}>*</span>
                        </span>
                        <textarea
                          rows={4}
                          placeholder="Describe your product vision, technical challenges, key features, or expected timelines..."
                          className={`form-input-field ${errors.description ? 'input-error' : ''}`}
                          style={{ resize: 'vertical', minHeight: '110px' }}
                          value={formData.description}
                          onFocus={() => setActiveFocused('description')}
                          onBlur={() => setActiveFocused(null)}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                        {errors.description && <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>{errors.description}</span>}
                      </label>
                    </motion.div>

                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        By submitting this form, you agree to our privacy policy and consent to receiving project consultation updates.
                      </p>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02, boxShadow: '0 12px 28px rgba(246, 97, 53, 0.25)' }}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-orange"
                        style={{
                          borderRadius: '12px',
                          padding: '0.9rem 2.25rem',
                          alignSelf: 'flex-start',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          fontSize: '1rem',
                          fontWeight: 700,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          opacity: isSubmitting ? 0.8 : 1,
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%' }}
                            />
                            Processing Inquiry...
                          </>
                        ) : (
                          <>
                            Submit Inquiry & Request Proposal
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── GOOGLE MAP & HEADQUARTERS ── */}
      <section className="contact-section-pad" style={{ background: '#ffffff' }}>
        <div className="wrap">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(246,97,53,0.08)',
                  border: '1px solid rgba(246,97,53,0.2)',
                  color: '#F66135',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  marginBottom: '0.75rem',
                }}
              >
                Physical Presence
              </span>
              <h2 className="contact-section-h2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                Visit Our <span style={{ color: '#F66135' }}>Headquarters</span>
              </h2>
              <p className="contact-section-sub" style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
                Located in Chhatrapati Sambhajinagar. Drop in for coffee and an interactive discovery session.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="contact-map-layout">
              {/* Touch-Optimized Iframe Container */}
              <div
                onMouseEnter={() => setMapTouched(true)}
                onMouseLeave={() => setMapTouched(false)}
                className="contact-map-container"
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
                  minHeight: '260px',
                  height: '100%',
                }}
              >
                <iframe
                  className="contact-map-iframe"
                  title="Enterprenex Solutions Office Map"
                  src="https://maps.google.com/maps?q=19%C2%B050'45.8%22N+75%C2%B015'18.0%22E&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block', minHeight: '340px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Touch hint overlay for mobile touch experience */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#ffffff',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F66135' }} />
                  Interactive Map Location
                </div>
              </div>

              {/* Office Details Card */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '24px',
                  border: '1.5px solid #e2e8f0',
                  padding: '2.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'rgba(246,97,53,0.1)',
                      border: '1.5px solid rgba(246,97,53,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.5rem',
                      color: '#F66135',
                    }}
                  >
                    <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>Office Address</h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600, marginBottom: '1.25rem' }}>Enterprenex Solutions Pvt. Ltd.</p>
                  <address style={{ fontStyle: 'normal', fontSize: '0.95rem', color: '#334155', lineHeight: 1.75 }}>
                    Plot No. 148, Ground Basement,<br />
                    Shrinand Plaza, CIDCO Waluj Mahanagar 1,<br />
                    Chhatrapati Sambhajinagar, Maharashtra 431136, India
                  </address>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '2rem' }}>
                  <a
                    href="https://maps.app.goo.gl/GfBYcfCXTAjaq6Dn8?g_st=aw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-orange"
                    style={{
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                      padding: '0.8rem 1.5rem',
                      fontWeight: 600,
                    }}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in Google Maps
                  </a>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=19.8460555,75.255"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                      padding: '0.8rem 1.5rem',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#F66135' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Get Live Directions
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ACCORDION WITH ANIMATEPRESENCE ── */}
      <section className="contact-section-pad" style={{ background: '#f8fafc' }}>
        <div className="wrap" style={{ maxWidth: '780px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(246,97,53,0.08)',
                  border: '1px solid rgba(246,97,53,0.2)',
                  color: '#F66135',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  marginBottom: '0.75rem',
                }}
              >
                Questions & Answers
              </span>
              <h2 className="contact-section-h2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                Frequently Asked <span style={{ color: '#F66135' }}>Questions</span>
              </h2>
              <p className="contact-section-sub" style={{ fontSize: '1.05rem', color: '#64748b' }}>Everything you need to know about working with Enterprenex.</p>
            </motion.div>

            <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    style={{
                      background: isOpen ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                      border: isOpen ? '1.5px solid rgba(246,97,53,0.4)' : '1.5px solid #e2e8f0',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      boxShadow: isOpen ? '0 12px 28px rgba(246,97,53,0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.35rem 1.6rem',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        gap: '1rem',
                      }}
                    >
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: isOpen ? '#F66135' : '#0f172a', lineHeight: 1.4 }}>
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isOpen ? 'rgba(246,97,53,0.1)' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isOpen ? '#F66135' : '#64748b',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            style={{
                              padding: '0 1.6rem 1.6rem',
                              color: '#475569',
                              fontSize: '0.96rem',
                              lineHeight: 1.7,
                              borderTop: '1px solid #f1f5f9',
                              paddingTop: '1rem',
                            }}
                          >
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '5.5rem 1rem', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(246,97,53,0.12) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '28px',
              padding: 'clamp(2.5rem, 5vw, 4rem)',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.04)',
              maxWidth: '820px',
              margin: '0 auto',
            }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '1.25rem' }}>
              Ready to Accelerate Your Digital Transformation?
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2.25rem', maxWidth: '580px', margin: '0 auto 2.25rem' }}>
              Schedule a zero-risk consultation with our top product architects today.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#contact-form" className="btn btn-orange" style={{ borderRadius: '9999px', padding: '0.85rem 2.25rem', textDecoration: 'none', fontWeight: 700 }}>
                Get in Touch Now
              </a>
              <a
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 2rem',
                  borderRadius: '9999px',
                  border: '1.5px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  background: '#ffffff',
                }}
              >
                Explore Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
