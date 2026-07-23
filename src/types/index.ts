export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt?: string | null;
  content?: string;
  tech: string[];
  role: string;
  project_type?: string | null;
  client_name?: string | null;
  timeline?: string | null;
  tools?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  live_url?: string | null;
  case_study_url?: string | null;
  github_url?: string | null;
  sort_order: number;
  status?: 'draft' | 'published';
  featured?: number;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id?: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
  keywords?: string | null;
  author: string;
  status: 'draft' | 'published';
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  category?: string | null;
  author_avatar?: string | null;
  author_bio?: string | null;
  featured_image_caption?: string | null;
  reading_time?: string | null;
  views_count?: number | null;
  comments_count?: number | null;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  project_type?: string | null;
  budget_range?: string | null;
  timeline?: string | null;
  ip_address?: string | null;
  is_read: number;
  status: 'unread' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at?: string | null;
}

export interface MediaAsset {
  id: number;
  file_name: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
  created_at: string;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt?: string | null;
  content?: string;
  icon_url?: string | null;
  cover_url?: string | null;
  features: string[];
  tags: string[];
  cta_label?: string | null;
  cta_url?: string | null;
  sort_order: number;
  status?: 'draft' | 'published';
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSetting {
  id: number;
  setting_key: string;
  setting_value?: string | null;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  full_name: string;
  company_name: string;
  role: string;
  website_url: string;
  message: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

// ── Landing Pages ────────────────────────────────────────────────────────────

export interface LPSectionBase { enabled: boolean }

export interface LPHeaderSection extends LPSectionBase {
  ctaText: string;
}

export interface LPHeroSection extends LPSectionBase {
  eyebrow: string;
  titleLine1: string;
  titleAccent: string;
  titleLine2: string;
  subCopy: string;
  chips: string[];
  proofCards: Array<{ title: string; copy: string }>;
  primaryCtaText: string;
  secondaryCtaText: string;
  secondaryCtaEmail: string;
  quoteCardBadge: string;
  quoteCardTitle: string;
  quoteCardCopy: string;
}

export interface LPHighlightsSection extends LPSectionBase {
  cards: Array<{ title: string; copy: string }>;
}

export interface LPStandardsSection extends LPSectionBase {
  heading: string;
  subHeading: string;
  cards: Array<{ number: string; title: string; copy: string }>;
}

export interface LPCtaBandSection extends LPSectionBase {
  headline: string;
  buttonText: string;
}

export interface LPWhySection extends LPSectionBase {
  heading: string;
  subCopy: string;
  hotspots: Array<{ id: number; label: string; title: string; copy: string }>;
  reasons: Array<{ title: string; copy: string }>;
}

export interface LPLongformSection extends LPSectionBase {
  kicker: string;
  heading: string;
  body: string;
  checklist: string[];
  sidebarTitle: string;
  sidebarCopy: string;
  sidebarChecklist: string[];
  sidebarCtaText: string;
}

export interface LPFaqSection extends LPSectionBase {
  heading: string;
  items: Array<{ question: string; answer: string }>;
}

export interface LPPromiseSection extends LPSectionBase {
  heading: string;
  subCopy: string;
  cards: Array<{ title: string; copy: string }>;
}

export interface LPCarouselSection extends LPSectionBase {
  heading: string;
  slides: Array<{ tag: string; title: string; copy: string }>;
}

export interface LPReviewsSection extends LPSectionBase {
  heading: string;
  subCopy: string;
  items: Array<{ stars: number; quote: string; name: string }>;
}

export interface LPAreaSection extends LPSectionBase {
  heading: string;
  copy: string;
  chips: string[];
}

export interface LPFinalQuoteSection extends LPSectionBase {
  heading: string;
  copy: string;
  checklist: string[];
}

export interface LPFooterSection extends LPSectionBase {
  leftText: string;
  rightText: string;
}

export interface LPMobileCtaSection extends LPSectionBase {
  primaryText: string;
  secondaryText: string;
  secondaryEmail: string;
}

export interface LandingPageSections {
  header: LPHeaderSection;
  hero: LPHeroSection;
  highlights: LPHighlightsSection;
  standards: LPStandardsSection;
  ctaBand: LPCtaBandSection;
  why: LPWhySection;
  longform: LPLongformSection;
  faq: LPFaqSection;
  promise: LPPromiseSection;
  carousel: LPCarouselSection;
  reviews: LPReviewsSection;
  area: LPAreaSection;
  finalQuote: LPFinalQuoteSection;
  footer: LPFooterSection;
  mobileCta: LPMobileCtaSection;
}

export interface LandingPage {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  sections: LandingPageSections;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_LP_SECTIONS: LandingPageSections = {
  header: {
    enabled: true,
    ctaText: 'Get A Free Quote',
  },
  hero: {
    enabled: true,
    eyebrow: 'Landing Page Service',
    titleLine1: 'Professional',
    titleAccent: 'Results-Driven',
    titleLine2: 'Solutions',
    subCopy: 'Get a fast, polished, mobile-first solution built around one job: turning visitors into calls, quote requests, and qualified sales opportunities.',
    chips: ['Conversion-first structure', 'Mobile-first UX', 'Tracking-ready launch'],
    proofCards: [
      { title: '10+ yrs', copy: 'experience delivering client results' },
      { title: 'UI/UX First', copy: 'design meets conversion' },
      { title: 'Launch Ready', copy: 'with tracking & QA' },
    ],
    primaryCtaText: 'Get My Free Quote',
    secondaryCtaText: 'Send Us an Email',
    secondaryCtaEmail: 'hello@carvelruss.com',
    quoteCardBadge: 'Free Estimate',
    quoteCardTitle: 'Free Quote',
    quoteCardCopy: "Tell us what you need built. We'll review your goals and timeline.",
  },
  highlights: {
    enabled: true,
    cards: [
      { title: 'Strategy', copy: 'Every decision is made with your buyer\'s journey in mind.' },
      { title: 'Custom Design', copy: 'No templates. Every page reflects your brand and offer.' },
      { title: 'Build', copy: 'Responsive, fast, and built to convert.' },
      { title: 'Lead Capture', copy: 'Integrated forms and tracking so no lead slips through.' },
    ],
  },
  standards: {
    enabled: true,
    heading: 'A proven process from strategy to launch.',
    subHeading: 'Every project follows a structured four-phase process to ensure clarity, quality, and conversion from day one.',
    cards: [
      { number: '01', title: 'Strategy', copy: 'Map the buyer journey, define the offer, and plan the structure.' },
      { number: '02', title: 'Design', copy: 'A custom design built around clarity, hierarchy, and conversion intent.' },
      { number: '03', title: 'Build', copy: 'Mobile-first development with clean code and fast load times.' },
      { number: '04', title: 'Launch', copy: 'QA, analytics setup, and a full handoff so your team can manage it.' },
    ],
  },
  ctaBand: {
    enabled: true,
    headline: 'Ready to get started?',
    buttonText: 'Request a Free Quote',
  },
  why: {
    enabled: true,
    heading: 'Why clients choose us.',
    subCopy: 'Every project is built with a clear strategy, not just a template. Here\'s what makes the difference.',
    hotspots: [
      { id: 1, label: 'Headline', title: 'Clear above-the-fold message', copy: 'Visitors know exactly what you do and who you serve in 3 seconds.' },
      { id: 2, label: 'Trust', title: 'Trust signals', copy: 'Proof points placed where doubt is highest.' },
      { id: 3, label: 'CTA', title: 'Primary CTA placement', copy: 'Action buttons appear at the right moment.' },
      { id: 4, label: 'Form', title: 'Conversion-optimised form', copy: 'Short, clear, and placed where intent is highest.' },
    ],
    reasons: [
      { title: 'Built around your buyer', copy: 'The layout follows how your ideal client thinks.' },
      { title: 'Design meets conversion', copy: 'It looks great AND performs.' },
      { title: 'No guesswork', copy: 'Every decision is backed by years of real client data.' },
      { title: 'Fast, clean delivery', copy: 'You get a result that\'s ready to launch.' },
    ],
  },
  longform: {
    enabled: true,
    kicker: 'Our Approach',
    heading: 'A better result starts with a better strategy.',
    body: 'Most projects lose leads before a conversation starts. A conversion-focused approach makes the value clear, the next step obvious, and the form easy to complete.',
    checklist: [
      'Custom structure built around offer and buyer intent',
      'Mobile-first design with clear visual hierarchy',
      'Lead capture and handoff — ready at launch',
    ],
    sidebarTitle: 'Not sure what you need?',
    sidebarCopy: 'Start with a free review. A quick consultation can identify gaps and the best path forward.',
    sidebarChecklist: ['Clarity', 'Mobile UX', 'CTA placement', 'Form and tracking'],
    sidebarCtaText: 'Get a Free Review',
  },
  faq: {
    enabled: true,
    heading: 'Common questions.',
    items: [
      { question: 'How long does the process take?', answer: 'Most projects are completed within 3–6 weeks depending on scope, content readiness, and revision rounds.' },
      { question: 'Do you work with existing brands or start from scratch?', answer: 'Both. We can work with your existing brand guidelines or develop a visual direction as part of the project.' },
      { question: "What's included in the handoff?", answer: 'You\'ll receive a fully tested deliverable, analytics setup, and a handoff document covering ongoing management.' },
      { question: 'Can I make updates myself after launch?', answer: 'Yes. We build with non-technical users in mind and can include a simple management interface.' },
      { question: 'Do you offer ongoing support?', answer: 'Yes. Monthly support plans are available for updates and performance monitoring after launch.' },
    ],
  },
  promise: {
    enabled: true,
    heading: 'Our promise.',
    subCopy: 'Not just a deliverable. A business asset built to work.',
    cards: [
      { title: '10+ years', copy: 'of client projects across service businesses, agencies, and digital brands.' },
      { title: 'Results focused', copy: 'Every build is grounded in strategy and real client outcomes.' },
      { title: 'Partner mindset', copy: "We treat your project like it's ours — because our reputation depends on your results." },
    ],
  },
  carousel: {
    enabled: true,
    heading: 'Recent work.',
    slides: [
      { tag: 'Project Type', title: 'Project title goes here.', copy: 'A short description of the work and the outcome achieved for the client.' },
      { tag: 'Project Type', title: 'Another project title.', copy: 'A short description of the work and the outcome achieved for the client.' },
      { tag: 'Project Type', title: 'Third project title.', copy: 'A short description of the work and the outcome achieved for the client.' },
    ],
  },
  reviews: {
    enabled: true,
    heading: 'What clients say.',
    subCopy: 'Real reviews from real clients.',
    items: [
      { stars: 5, quote: 'Replace this with a verified review about quality, communication, and business impact.', name: 'Verified client' },
      { stars: 5, quote: 'Replace this with a verified review about the process and the results.', name: 'Verified client' },
      { stars: 5, quote: 'Replace this with a verified review about the experience from start to finish.', name: 'Verified client' },
    ],
  },
  area: {
    enabled: true,
    heading: 'Serving clients worldwide.',
    copy: 'A remote-first approach means businesses anywhere can get sharp, conversion-focused work.',
    chips: ['Remote-first', 'Worldwide clients', 'Service businesses', 'Growth-stage teams', 'Digital brands', 'Startups'],
  },
  finalQuote: {
    enabled: true,
    heading: 'Get your free quote today.',
    copy: "Tell us about your project and we'll get back to you within one business day.",
    checklist: [
      'Free consultation — no pressure, no commitment',
      'Honest scoping based on your goals and budget',
      'Clear timeline and deliverables upfront',
      'Support from strategy through to launch',
    ],
  },
  footer: {
    enabled: true,
    leftText: 'Landing Page Service',
    rightText: 'A Carvel Russ project.',
  },
  mobileCta: {
    enabled: true,
    primaryText: 'Free Quote',
    secondaryText: 'Email',
    secondaryEmail: 'hello@carvelruss.com',
  },
};
