export type Entry = {
  id: string;
  kind: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  image: string;
  category: string;
  status: string;
  sort: number;
  data: Record<string, any>;
  source: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
};
export const focusAreas = [
  [
    "education-skill",
    "Education & skills",
    "Learning that opens doors.",
    "Education, literacy and practical skills help people access new opportunities.",
    "BookOpen",
    "education",
  ],
  [
    "women-empowerment",
    "Women empowerment",
    "Confidence. Voice. Independence.",
    "Supporting women through skills, livelihood opportunities and community participation.",
    "HeartHandshake",
    "women",
  ],
  [
    "health-hygiene",
    "Health & hygiene",
    "Care with dignity.",
    "Community awareness, preventive health and access to essential hygiene information.",
    "HeartPulse",
    "health",
  ],
  [
    "legal-aid-human-rights",
    "Legal aid & human rights",
    "Rights within everyone’s reach.",
    "Awareness and support to help communities understand their rights and find assistance.",
    "Scale",
    "community",
  ],
  [
    "environment",
    "Environment & sustainability",
    "A healthier, shared tomorrow.",
    "Local environmental action, conservation and sustainable everyday practices.",
    "Sprout",
    "environment",
  ],
  [
    "sports",
    "Sports & recreation",
    "Room to play. Space to grow.",
    "Participation in sport and recreation as a route to confidence, connection and well-being.",
    "Trophy",
    "hero",
  ],
  [
    "art-culture-heritage",
    "Art, culture & heritage",
    "Keeping creativity alive.",
    "Encouraging creative expression, traditional crafts and cultural participation.",
    "Palette",
    "women",
  ],
  [
    "sustainable-development-goals",
    "Sustainable development goals",
    "Progress, connected.",
    "Connecting community priorities with the wider goals of inclusive, sustainable development.",
    "Globe2",
    "environment",
  ],
] as const;
export const navigation = [
  ["Home", "/"],
  ["About", "/about/"],
  ["Our Work", "/our-work/"],
  ["Events", "/events/"],
  ["Get Involved", "/get-involved/"],
  ["Resources", "/resources/"],
  ["E-Store", "/store/"],
] as const;
export const contentKinds = [
  "page",
  "program",
  "post",
  "event",
  "team",
  "partner",
  "metric",
  "report",
  "job",
  "gallery",
  "video",
  "product",
  "document",
] as const;
export const roleNames = [
  "member",
  "volunteer",
  "staff",
  "editor",
  "store_employee",
  "donation_manager",
  "volunteer_manager",
  "admin",
] as const;
export const money = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
export const niceDate = (date?: string) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(date))
    : "Date to be confirmed";
export const contentPath = (item: Entry) =>
  (({
    program: "/focus-areas/",
    post: "/blog/",
    event: "/events/",
    job: "/careers/",
  })[item.kind] || "/resources/") +
  item.slug +
  "/";
export const routeTitles: Record<string, string> = {
  about: "About Us",
  "our-work": "Our Work",
  "focus-areas": "Our Focus Areas",
  "our-approach": "Our Approach",
  "our-impact": "Our Impact",
  "our-team": "Our Team",
  "get-involved": "Get Involved",
  "become-a-volunteer": "Become a Volunteer",
  "volunteering-internships": "Volunteering & Internships",
  internships: "Internships",
  careers: "Careers",
  "csr-partnerships": "CSR Partnerships",
  donate: "Support Our Mission",
  "donate-now": "Support Our Mission",
  contact: "Contact Us",
  blog: "News & Stories",
  events: "Events",
  photos: "Photo Gallery",
  gallery: "Photo Gallery",
  videos: "Stories in Motion",
  resources: "Resources",
  reports: "Reports",
  financials: "Financial Reports",
  license: "Registrations & Licenses",
  "tax-exemptions": "Tax Information",
  policies: "Policies",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  refund: "Refund Policy",
  cookies: "Cookie Preferences",
  "faq-2": "Frequently Asked Questions",
  faq: "Frequently Asked Questions",
  accessibility: "Accessibility",
  profile: "Organization Profile",
  store: "E-Store · Made with Purpose",
  login: "Welcome Back",
  register: "Join the Community",
  "forgot-password": "Reset Your Password",
  "reset-password": "Choose a New Password",
  "verify-email": "Verify Your Email",
  user: "My Dashboard",
  search: "Search WBF",
  content: "Community Updates",
  product: "Product Details",
  document: "Document Viewer",
  "donation-policy": "Donation Policy",
  "privacy-policy": "Privacy Policy",
  "terms-and-conditions": "Terms & Conditions",
  "refund-policy": "Refund Policy",
};
