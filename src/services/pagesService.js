const API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_URL) || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

export const DEFAULT_HOME_SECTIONS = {
  categoriesBar: {
    enabled: true,
    mode: 'all', // 'all' | 'custom'
    selectedCategoryIds: [], // array of category IDs or names
  },
  heroSlider: {
    enabled: true,
    slides: [
      {
        id: 'slide-1',
        badge: 'Enterprise Wholesale Exclusive',
        title: 'Flagship 240Hz Curved OLED Displays',
        subtitle: 'Ultra-wide workstation monitors with 0.03ms response time & 99% DCI-P3 color precision for enterprise setups.',
        priceText: 'From ₹1,199.00',
        ctaText: 'Explore Displays',
        ctaLink: '/shop?category=Displays',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=80',
        tagPill: '240Hz OLED • 0.03ms GTG',
        theme: 'indigo',
      },
      {
        id: 'slide-2',
        badge: 'Titanium ANC Audio Series',
        title: 'AeroPulse Wireless Studio ANC Headphones',
        subtitle: 'High-fidelity audio engineered for corporate offices, remote teams, and immersive soundscapes with 45-hour battery life.',
        priceText: 'Wholesale Tier ₹299.99',
        ctaText: 'Shop Audio Gear',
        ctaLink: '/shop?category=Audio',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
        tagPill: 'Adaptive Noise Cancellation • 45h Battery',
        theme: 'brand',
      },
      {
        id: 'slide-3',
        badge: 'Custom Gasket Mechanical Series',
        title: 'CraftKey Pro Hot-Swap Keyboards & Mice',
        subtitle: 'CNC aluminum chassis, hot-swappable PCB switches, and lightweight 49g precision optical mice for commercial volume deployment.',
        priceText: 'Volume Slabs from ₹189.50',
        ctaText: 'Explore Peripherals',
        ctaLink: '/shop?category=Peripherals',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=80',
        tagPill: 'Gasket Mounted • Hot-Swap PCB',
        theme: 'cyan',
      },
    ],
  },
  latestProducts: {
    enabled: true,
    badge: 'New Arrivals',
    title: 'Latest Hardware Releases',
    subtitle: 'Freshly added OEM models ready for pallet allocation and immediate dispatch.',
    viewAllLink: '/shop?sort=newest',
    limit: 4,
    mode: 'automatic', // 'automatic' | 'category' | 'manual'
    selectedCategoryIds: [],
    selectedProductIds: [],
  },
  featuredProducts: {
    enabled: true,
    badge: 'Staff Curated',
    title: 'Featured OEM Hardware',
    subtitle: 'High-demand displays, mechanical keyboards, and precision audio units with volume discount tiering.',
    viewAllLink: '/shop',
    limit: 4,
    mode: 'automatic', // 'automatic' | 'category' | 'manual'
    selectedCategoryIds: [],
    selectedProductIds: [],
  },
  smallBanners: {
    enabled: true,
    banner1: {
      tag: 'Volume Slab Program',
      title: 'Up to 35% Bulk Tier Discount',
      description: 'Unlock volume price slabs on palletized orders with verified GST ITC invoices and dedicated credit limits.',
      buttonText: 'Explore Bulk Slabs',
      link: '/shop',
    },
    banner2: {
      tag: 'Logistics Hub WH-01',
      title: 'Express 24-48h Cargo Dispatches',
      description: 'Direct air & surface cargo dispatch from our Central Mumbai Node with real-time AWB airway bill tracking.',
      buttonText: 'Review Logistics SLAs',
      link: '/shipping-policy',
    },
  },
  topSellingProducts: {
    enabled: true,
    badge: 'Best Sellers',
    title: 'Top Selling Wholesale Hardware',
    subtitle: 'Highest-rated devices chosen by certified corporate buyers and retail chains across India.',
    viewAllLink: '/shop?sort=rating',
    limit: 4,
    mode: 'automatic', // 'automatic' | 'manual'
    autoCriteria: 'sales', // 'sales' | 'rating'
    selectedCategoryIds: [],
    selectedProductIds: [],
  },
  trendingProducts: {
    enabled: true,
    badge: 'Trending Now',
    title: 'Trending Gear & Pro Equipment',
    subtitle: 'High velocity trending peripherals, esports mice, and spatial audio studio gear.',
    viewAllLink: '/shop',
    limit: 4,
    mode: 'automatic', // 'automatic' | 'manual'
    autoCriteria: 'search_velocity', // 'search_velocity' | 'trending'
    selectedCategoryIds: [],
    selectedProductIds: [],
  },
  trustBar: {
    enabled: true,
    item1: {
      title: 'Free Interstate Shipping',
      desc: 'Complimentary air & surface cargo logistics on all qualifying wholesale pallet orders.',
    },
    item2: {
      title: '100% Secure Payment Rails',
      desc: 'Razorpay 256-bit SSL encryption, RTGS/NEFT wire transfer reconciliation, and Partial COD.',
    },
    item3: {
      title: 'Dedicated B2B Desk Support',
      desc: 'Assigned sales executives and prompt technical assistance available via Phone, WhatsApp & Email.',
    },
    item4: {
      title: 'Verified OEM Warranty & GST',
      desc: '100% authentic brand warranty coverage with automated GST Tax Invoices for ITC input credit.',
    },
  },
};

export function parseHomeSections(content) {
  if (!content) return DEFAULT_HOME_SECTIONS;
  if (typeof content === 'object') {
    return { ...DEFAULT_HOME_SECTIONS, ...content };
  }
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      return {
        ...DEFAULT_HOME_SECTIONS,
        ...parsed,
        categoriesBar: {
          ...DEFAULT_HOME_SECTIONS.categoriesBar,
          ...(parsed.categoriesBar || {}),
          selectedCategoryIds: Array.isArray(parsed.categoriesBar?.selectedCategoryIds)
            ? parsed.categoriesBar.selectedCategoryIds
            : [],
        },
        heroSlider: {
          ...DEFAULT_HOME_SECTIONS.heroSlider,
          ...(parsed.heroSlider || {}),
          slides: Array.isArray(parsed.heroSlider?.slides) && parsed.heroSlider.slides.length > 0
            ? parsed.heroSlider.slides
            : DEFAULT_HOME_SECTIONS.heroSlider.slides,
        },
        latestProducts: {
          ...DEFAULT_HOME_SECTIONS.latestProducts,
          ...(parsed.latestProducts || {}),
          selectedCategoryIds: Array.isArray(parsed.latestProducts?.selectedCategoryIds)
            ? parsed.latestProducts.selectedCategoryIds
            : [],
          selectedProductIds: Array.isArray(parsed.latestProducts?.selectedProductIds)
            ? parsed.latestProducts.selectedProductIds
            : [],
        },
        featuredProducts: {
          ...DEFAULT_HOME_SECTIONS.featuredProducts,
          ...(parsed.featuredProducts || {}),
          selectedCategoryIds: Array.isArray(parsed.featuredProducts?.selectedCategoryIds)
            ? parsed.featuredProducts.selectedCategoryIds
            : [],
          selectedProductIds: Array.isArray(parsed.featuredProducts?.selectedProductIds)
            ? parsed.featuredProducts.selectedProductIds
            : [],
        },
        smallBanners: {
          ...DEFAULT_HOME_SECTIONS.smallBanners,
          ...(parsed.smallBanners || {}),
          banner1: { ...DEFAULT_HOME_SECTIONS.smallBanners.banner1, ...(parsed.smallBanners?.banner1 || {}) },
          banner2: { ...DEFAULT_HOME_SECTIONS.smallBanners.banner2, ...(parsed.smallBanners?.banner2 || {}) },
        },
        topSellingProducts: {
          ...DEFAULT_HOME_SECTIONS.topSellingProducts,
          ...(parsed.topSellingProducts || {}),
          selectedCategoryIds: Array.isArray(parsed.topSellingProducts?.selectedCategoryIds)
            ? parsed.topSellingProducts.selectedCategoryIds
            : [],
          selectedProductIds: Array.isArray(parsed.topSellingProducts?.selectedProductIds)
            ? parsed.topSellingProducts.selectedProductIds
            : [],
        },
        trendingProducts: {
          ...DEFAULT_HOME_SECTIONS.trendingProducts,
          ...(parsed.trendingProducts || {}),
          selectedCategoryIds: Array.isArray(parsed.trendingProducts?.selectedCategoryIds)
            ? parsed.trendingProducts.selectedCategoryIds
            : [],
          selectedProductIds: Array.isArray(parsed.trendingProducts?.selectedProductIds)
            ? parsed.trendingProducts.selectedProductIds
            : [],
        },
        trustBar: {
          ...DEFAULT_HOME_SECTIONS.trustBar,
          ...(parsed.trustBar || {}),
          item1: { ...DEFAULT_HOME_SECTIONS.trustBar.item1, ...(parsed.trustBar?.item1 || {}) },
          item2: { ...DEFAULT_HOME_SECTIONS.trustBar.item2, ...(parsed.trustBar?.item2 || {}) },
          item3: { ...DEFAULT_HOME_SECTIONS.trustBar.item3, ...(parsed.trustBar?.item3 || {}) },
          item4: { ...DEFAULT_HOME_SECTIONS.trustBar.item4, ...(parsed.trustBar?.item4 || {}) },
        },
      };
    }
  } catch (e) {
    // Return standard defaults if not JSON
  }
  return DEFAULT_HOME_SECTIONS;
}

// ─── About Us Page Structured Sections ────────────────────────────────────────

export const DEFAULT_ABOUT_SECTIONS = {
  hero: {
    enabled: true,
    badge: 'Enterprise B2B Hardware Infrastructure',
    title: 'Powering Next-Gen\nWholesale Tech Commerce',
    subtitle: "TradeLogix is India's premier B2B wholesale distribution ecosystem. We connect certified electronics retailers, corporate procurement desks, IT system integrators, and regional dealers directly with verified OEM hardware manufacturers.",
    primaryCtaText: 'Explore Hardware Catalog',
    primaryCtaLink: '/shop',
    secondaryCtaText: 'Register B2B Account',
    secondaryCtaLink: '/login',
    bgGradient: 'from-slate-900 via-brand-950 to-slate-900',
  },
  metrics: {
    enabled: true,
    metric1: { value: '10,000+', label: 'Verified B2B Buyers', subtext: 'Across 28 Indian States' },
    metric2: { value: '50+', label: 'OEM Tech Brands', subtext: 'Authorized Distribution' },
    metric3: { value: '99.8%', label: 'On-Time Dispatches', subtext: 'Express Air & Surface Cargo' },
    metric4: { value: '100%', label: 'GST Compliant', subtext: 'Instant B2B Tax Invoicing' },
  },
  pillars: {
    enabled: true,
    badge: 'Our Operational Framework',
    title: 'Engineered Specifically for Wholesale Buyers',
    subtitle: 'Unlike retail marketplaces, TradeLogix delivers dedicated B2B commercial parameters, multi-tier quantity pricing, and automated compliance.',
    pillar1: {
      icon: 'verified',
      title: 'Direct OEM Partnerships',
      description: 'Every product catalog item—from titanium driver ANC headphones and curved 240Hz OLED gaming displays to hot-swappable mechanical keyboards—is sourced directly from certified original equipment manufacturers with full brand warranty.',
    },
    pillar2: {
      icon: 'warehouse',
      title: 'Multi-Warehouse Fulfillment',
      description: 'Operating from major logistics nodes including our Central Mumbai Fulfillment Hub (WH-01), we offer flexible warehouse-level inventory routing, bulk pallet packing, and expedited air cargo dispatches with real-time AWB tracking.',
    },
    pillar3: {
      icon: 'receipt_long',
      title: 'Automated GST & Price Slabs',
      description: 'Verified GST buyers unlock custom price groups, volume discount slabs, and instant automated GST Tax Invoices formatted with complete HSN codes, SAC classifications, and CGST/SGST/IGST breakdowns for seamless input tax credit (ITC).',
    },
  },
  accreditation: {
    enabled: true,
    title: 'Corporate Identification',
    subtitle: 'Operating under the Ministry of Corporate Affairs, Government of India. In full compliance with IT Act & GST Act regulations.',
  },
  ctaBanner: {
    enabled: true,
    title: 'Ready to scale your wholesale inventory?',
    subtitle: 'Get instant access to wholesale tier pricing, live stock availability, and expedited dispatch terms.',
    primaryBtnText: 'Apply for B2B Account',
    primaryBtnLink: '/login',
    secondaryBtnText: 'Contact Sales Desk',
    secondaryBtnLink: '/contact',
  },
};

export function parseAboutSections(content) {
  if (!content) return DEFAULT_ABOUT_SECTIONS;
  if (typeof content === 'object') {
    return {
      hero: { ...DEFAULT_ABOUT_SECTIONS.hero, ...(content.hero || {}) },
      metrics: {
        ...DEFAULT_ABOUT_SECTIONS.metrics,
        ...(content.metrics || {}),
        metric1: { ...DEFAULT_ABOUT_SECTIONS.metrics.metric1, ...(content.metrics?.metric1 || {}) },
        metric2: { ...DEFAULT_ABOUT_SECTIONS.metrics.metric2, ...(content.metrics?.metric2 || {}) },
        metric3: { ...DEFAULT_ABOUT_SECTIONS.metrics.metric3, ...(content.metrics?.metric3 || {}) },
        metric4: { ...DEFAULT_ABOUT_SECTIONS.metrics.metric4, ...(content.metrics?.metric4 || {}) },
      },
      pillars: {
        ...DEFAULT_ABOUT_SECTIONS.pillars,
        ...(content.pillars || {}),
        pillar1: { ...DEFAULT_ABOUT_SECTIONS.pillars.pillar1, ...(content.pillars?.pillar1 || {}) },
        pillar2: { ...DEFAULT_ABOUT_SECTIONS.pillars.pillar2, ...(content.pillars?.pillar2 || {}) },
        pillar3: { ...DEFAULT_ABOUT_SECTIONS.pillars.pillar3, ...(content.pillars?.pillar3 || {}) },
      },
      accreditation: { ...DEFAULT_ABOUT_SECTIONS.accreditation, ...(content.accreditation || {}) },
      ctaBanner: { ...DEFAULT_ABOUT_SECTIONS.ctaBanner, ...(content.ctaBanner || {}) },
    };
  }
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      return parseAboutSections(parsed);
    }
  } catch (e) {
    // Return standard defaults if not JSON
  }
  return DEFAULT_ABOUT_SECTIONS;
}

// ─── Contact Us Page Structured Sections ──────────────────────────────────────

export const DEFAULT_CONTACT_SECTIONS = {
  header: {
    enabled: true,
    badge: 'Direct B2B Communication Channels',
    title: 'Connect With TradeLogix Wholesale',
    subtitle: 'Direct lines to our Wholesale Procurement Specialists, Dealer Onboarding Desk, GST Billing Team, and Central Mumbai Logistics Dock.',
  },
  departments: {
    enabled: true,
    sales: {
      title: 'Wholesale Sales & Procurement',
      tag: 'Volume Orders',
      description: 'Volume discount pricing, price slab negotiations, custom OEM contracts, and hardware stock reservations.',
      email: 'sales@tradelogix.in',
      phone: '+91 98201 45892',
      timing: 'Mon - Sat: 9:30 AM - 6:30 PM IST',
      whatsapp: '919820145892',
    },
    onboarding: {
      title: 'B2B Onboarding & GST Verification',
      tag: 'Buyer Accounts',
      description: 'Assistance with Mobile OTP verification, automated GSTIN validation, dealer classification, and account approval.',
      email: 'support@tradelogix.in',
      phone: '+91 98201 45892',
      timing: 'Mon - Sat: 9:30 AM - 6:30 PM IST',
      whatsapp: '919820145892',
    },
    accounts: {
      title: 'Billing, Invoicing & GST Credit',
      tag: 'Accounts Ledger',
      description: 'Official GST Tax Invoices for ITC input credit, NEFT / RTGS wire transfer UTR reconciliation, and Credit Notes.',
      email: 'accounts@tradelogix.in',
      phone: '+91 98201 45892',
      timing: 'Mon - Fri: 10:00 AM - 6:00 PM IST',
    },
    logistics: {
      title: 'Logistics & Dispatch Operations',
      tag: 'Central Hub WH-01',
      description: 'Express Air Cargo dispatch schedules, live AWB tracking status, e-way bill compliance, and dock self-pickups.',
      email: 'support@tradelogix.in',
      phone: '+91 98201 45892',
      timing: 'Mon - Sat: 8:30 AM - 8:00 PM IST',
    },
  },
  faqs: {
    enabled: true,
    badge: 'Quick Help & Policies',
    title: 'Frequently Asked Questions',
    subtitle: 'Common questions about TradeLogix B2B wholesale ordering, GST verification, and dispatch.',
    items: [
      {
        question: 'How does B2B customer registration and GST verification work?',
        answer: 'Buyers authenticate via Mobile OTP. New buyers select GST or Non-GST. For GST buyers, entering a valid GSTIN auto-fills business details via our verification service. Accounts are reviewed by our team for custom price group assignments before access is granted to wholesale pricing.',
      },
      {
        question: 'What payment methods are supported for wholesale orders?',
        answer: 'We support Razorpay (Net Banking, UPI, Corporate Credit Cards), Direct NEFT / RTGS Bank Transfer to our official HDFC Current Account with instant UTR reconciliation, and Partial COD for verified dealers.',
      },
      {
        question: 'How are dispatches tracked and what are delivery timelines?',
        answer: 'Orders are dispatched from our Mumbai Central Fulfillment Hub (WH-01) within 24 to 48 hours via TradeLogix Express Air Cargo, BlueDart, Delhivery, or SafeExpress. Live AWB tracking numbers and carrier details are updated on your dashboard and order tracking pages.',
      },
      {
        question: 'Can I get input tax credit (ITC) for GST purchases?',
        answer: 'Yes, 100%. Every order generates an official GST Tax Invoice containing your verified GSTIN, state code, legal name, HSN codes, and itemized CGST/SGST/IGST breakdown, filed directly to the GST portal for seamless GSTR-2B reconciliation.',
      },
    ],
  },
};

export function parseContactSections(content) {
  if (!content) return DEFAULT_CONTACT_SECTIONS;
  if (typeof content === 'object') {
    return {
      header: { ...DEFAULT_CONTACT_SECTIONS.header, ...(content.header || {}) },
      departments: {
        ...DEFAULT_CONTACT_SECTIONS.departments,
        ...(content.departments || {}),
        sales: { ...DEFAULT_CONTACT_SECTIONS.departments.sales, ...(content.departments?.sales || {}) },
        onboarding: { ...DEFAULT_CONTACT_SECTIONS.departments.onboarding, ...(content.departments?.onboarding || {}) },
        accounts: { ...DEFAULT_CONTACT_SECTIONS.departments.accounts, ...(content.departments?.accounts || {}) },
        logistics: { ...DEFAULT_CONTACT_SECTIONS.departments.logistics, ...(content.departments?.logistics || {}) },
      },
      faqs: {
        ...DEFAULT_CONTACT_SECTIONS.faqs,
        ...(content.faqs || {}),
        items: Array.isArray(content.faqs?.items) ? content.faqs.items : DEFAULT_CONTACT_SECTIONS.faqs.items,
      },
    };
  }
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      return parseContactSections(parsed);
    }
  } catch (e) {
    // Return standard defaults if not JSON
  }
  return DEFAULT_CONTACT_SECTIONS;
}

export const DEFAULT_PAGES = [
  {
    id: 'page-home-01',
    slug: 'home',
    title: 'TradeLogix Wholesale Commerce',
    navLabel: 'Home',
    content: JSON.stringify(DEFAULT_HOME_SECTIONS),
    metaTitle: 'TradeLogix Wholesale | Enterprise Hardware & B2B Distribution',
    metaDescription: 'Direct B2B wholesale electronics distribution platform with verified GST ITC invoices and tier volume pricing.',
    showInNav: true,
    showInFooter: true,
    navOrder: 1,
    isPublished: true,
    isSystemPage: true,
  },
  {
    id: 'page-about-02',
    slug: 'about',
    title: 'About TradeLogix Solutions',
    navLabel: 'About Us',
    content: JSON.stringify(DEFAULT_ABOUT_SECTIONS),
    metaTitle: 'About Us | TradeLogix Wholesale - OEM Hardware Supply Chain',
    metaDescription: 'Learn about TradeLogix Wholesale, our verified OEM hardware supply chain, multi-warehouse fulfillment network, and GST-compliant B2B commerce platform.',
    showInNav: true,
    showInFooter: true,
    navOrder: 2,
    isPublished: true,
    isSystemPage: true,
  },
  {
    id: 'page-contact-03',
    slug: 'contact',
    title: 'Corporate Customer Support & Logistics Hub',
    navLabel: 'Contact Us',
    content: JSON.stringify(DEFAULT_CONTACT_SECTIONS),
    metaTitle: 'Contact TradeLogix | Wholesale Sales & Enterprise Support Hub',
    metaDescription: 'Connect with TradeLogix Wholesale enterprise sales, tier pricing desk, warranty returns, and logistics fulfillment center.',
    showInNav: true,
    showInFooter: true,
    navOrder: 3,
    isPublished: true,
    isSystemPage: true,
  },
  {
    id: 'page-privacy-04',
    slug: 'privacy-policy',
    title: 'Enterprise Privacy & Data Protection Policy',
    navLabel: 'Privacy Policy',
    content: `<section class="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
  <h3 class="text-base font-bold text-slate-900 font-display m-0">1. Executive Overview</h3>
  <p class="m-0 text-slate-600 mt-2">
    This Privacy Policy governs the manner in which <strong>TradeLogix Solutions Private Limited</strong> ("TradeLogix", "we", "our", or "us") collects, utilizes, safeguards, and discloses information gathered from business users and authorized procurement representatives ("Buyer", "Customer", or "You") accessing our B2B wholesale platform (the "Platform").
  </p>
</section>

<h2>2. Information We Collect</h2>
<p>To facilitate wholesale business authentication, GST compliance, invoice generation, and commercial credit assessment, we collect the following categories of data:</p>
<ul>
  <li><strong>Authentication Credentials:</strong> Mobile phone numbers verified via one-time SMS passwords (Mobile OTP) without requiring static passwords.</li>
  <li><strong>Business & Tax Identifiers:</strong> Legal firm name, trade name, Goods and Services Tax Identification Number (GSTIN), Permanent Account Number (PAN), and constitution of business.</li>
  <li><strong>Commercial Contacts:</strong> Authorized proprietor/director names, corporate procurement email addresses, and designated shipping dock contact numbers.</li>
  <li><strong>Logistics Coordinates:</strong> Registered business address, dispatch addresses, state GST codes, PIN codes, and designated delivery hubs.</li>
  <li><strong>Transaction Logs:</strong> Order histories, itemized invoices, payment reconciliation records (Razorpay IDs, UTR reference numbers), and credit ledger statements.</li>
</ul>

<h2>3. How We Process & Utilize Your Data</h2>
<p>We process collected business data exclusively for lawful commercial and statutory operations, including:</p>
<ul>
  <li>Verifying buyer authenticity through automated GST validation APIs and assigning tiered price groups.</li>
  <li>Generating statutory GST Tax Invoices formatted with correct HSN/SAC codes for Input Tax Credit (ITC) eligibility.</li>
  <li>Coordinating freight dispatches, Airway Bill (AWB) generation, and real-time transit tracking with licensed air and surface cargo carriers.</li>
  <li>Sending transactional notifications, dispatch confirmations, ledger updates, and security alert codes via SMS, WhatsApp, and email.</li>
</ul>

<h2>4. Data Protection & Security Controls</h2>
<p>
  TradeLogix deploys enterprise-grade security protocols to protect sensitive corporate assets. All communication channels are encrypted using <strong>256-bit Transport Layer Security (TLS/SSL)</strong>. Payment credentials are tokenized directly via RBI-authorized payment gateways (Razorpay). We enforce role-based access control (RBAC), multi-tenant database isolation, and encrypted audit logs for all administrative profile actions.
</p>

<h2>5. Third-Party Disclosures</h2>
<p>We do not sell, rent, or trade customer data to third-party marketing entities. Information is shared strictly on a need-to-know basis with:</p>
<ul>
  <li><strong>Logistics Partners:</strong> Freight carriers (e.g. TradeLogix Express, BlueDart, Delhivery, SafeExpress) for shipment delivery and AWB tracking.</li>
  <li><strong>Banking & Payment Gateways:</strong> Razorpay and banking networks for processing wire transfers and online payments.</li>
  <li><strong>Statutory Authorities:</strong> GST Network (GSTN) and tax authorities where required by Indian statutory law.</li>
</ul>

<h2>6. Contacting the Data Privacy Desk</h2>
<p>
  For privacy inquiries, grievance redressals, or data access requests, contact our Compliance Office:<br />
  <strong>TradeLogix Legal & Compliance Department</strong><br />
  Email: <a href="mailto:privacy@tradelogix.in">privacy@tradelogix.in</a> / <a href="mailto:support@tradelogix.in">support@tradelogix.in</a><br />
  Helpline: +91 22 6912 3456<br />
  Address: 804, Prime Corporate Park, Marol, Andheri East, Mumbai, MH - 400059
</p>`,
    metaTitle: 'Privacy Policy | TradeLogix Wholesale B2B Commerce',
    metaDescription: 'Learn how TradeLogix collects, encrypts, and protects enterprise buyer details, GST credentials, and financial transaction records.',
    showInNav: false,
    showInFooter: true,
    navOrder: 4,
    isPublished: true,
    isSystemPage: true,
  },
  {
    id: 'page-terms-05',
    slug: 'terms-of-sale',
    title: 'B2B Wholesale Master Terms & Conditions of Sale',
    navLabel: 'Terms of Sale',
    content: `<section class="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
  <h3 class="text-base font-bold text-slate-900 font-display m-0">1. Commercial Scope & Applicability</h3>
  <p class="m-0 text-slate-600 mt-2">
    These Terms and Conditions of Wholesale Sale ("Terms") apply to all commercial transactions, quotations, purchase orders, and sales agreements entered into between <strong>TradeLogix Solutions Private Limited</strong> ("TradeLogix", "Seller") and the registered purchasing entity ("Buyer", "Customer"). TradeLogix operates strictly as a <strong>B2B wholesale distributor</strong>.
  </p>
</section>

<h2>2. Customer Onboarding & B2B Account Verification</h2>
<ul>
  <li><strong>Mobile OTP Authentication:</strong> Access to buyer portals is authenticated via one-time SMS verification codes tied to the buyer's registered mobile number.</li>
  <li><strong>GST Classification:</strong> Buyers registering as GST entities must provide a valid 15-digit GSTIN. TradeLogix verifies legal entity status and tax filing compliance via automated APIs.</li>
  <li><strong>Approval Workflow:</strong> All new customer accounts are placed in <em>Pending Approval</em> status and undergo internal credit & credential vetting prior to unlocking tiered wholesale price catalogs.</li>
</ul>

<h2>3. Pricing, Price Groups & Minimum Order Quantities (MOQ)</h2>
<ul>
  <li>Prices displayed on the platform are exclusive or inclusive of GST as indicated, with applicable CGST/SGST/IGST dynamically computed based on destination state.</li>
  <li>TradeLogix maintains differentiated commercial price groups (e.g. Retailer, Dealer, Distributor, Corporate Buyer). Price slabs and volume discounts apply automatically to eligible cart quantities.</li>
  <li>TradeLogix reserves the right to enforce Minimum Order Quantities (MOQ) or minimum invoice thresholds for specific high-demand hardware SKUs.</li>
</ul>

<h2>4. Payment Terms & Settlement Modes</h2>
<p>Orders must be settled through one of our authorized commercial payment rails:</p>
<ul>
  <li><strong>Razorpay Gateway:</strong> Instant settlement via Corporate Net Banking, UPI, and authorized commercial cards.</li>
  <li><strong>NEFT / RTGS Wire Transfer:</strong> Direct remittance to our designated Current Account with prompt UTR submission for reconciliation.</li>
  <li><strong>Partial COD (Cash on Delivery):</strong> Available for approved dealers requiring an advance commitment deposit (e.g. 10%) with the balance payable upon delivery.</li>
</ul>

<h2>5. Title, Risk of Loss & Dispatch Terms</h2>
<p>
  Title to goods passes to the Buyer upon full settlement of invoice value. Risk of loss passes upon handover to the licensed freight logistics carrier at our Mumbai Central Fulfillment Hub (WH-01). Consignments travel with valid electronic e-way bills and transit insurance coverage.
</p>

<h2>6. Jurisdiction & Dispute Resolution</h2>
<p>
  These Terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with wholesale transactions shall be subject to the exclusive jurisdiction of the competent courts in <strong>Mumbai, Maharashtra</strong>.
</p>`,
    metaTitle: 'Terms of Sale | TradeLogix Wholesale Terms & Conditions',
    metaDescription: 'Read TradeLogix master terms of sale, commercial credit policies, GST compliance mandates, and freight allocation rules.',
    showInNav: false,
    showInFooter: true,
    navOrder: 5,
    isPublished: true,
    isSystemPage: true,
  },
  {
    id: 'page-refund-06',
    slug: 'refund-policy',
    title: 'B2B Cancellation, RMA & Commercial Refund Policy',
    navLabel: 'Refund Policy',
    content: `<section class="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
  <h3 class="text-base font-bold text-slate-900 font-display m-0">1. Commercial Context</h3>
  <p class="m-0 text-slate-600 mt-2">
    Due to the high-volume wholesale nature of <strong>TradeLogix Wholesale</strong> commercial transactions, products are sold on a business-to-business basis with verified OEM brand warranties. This policy defines the specific conditions under which order cancellations, DOA claims, and ledger settlements are handled.
  </p>
</section>

<h2>2. Order Cancellation Prior to Dispatch</h2>
<ul>
  <li><strong>Pending / Unfulfilled Orders:</strong> Buyers may request order cancellation prior to warehouse pallet staging and AWB generation by contacting their assigned sales desk or submitting an online cancellation request with reason details.</li>
  <li><strong>Dispatched Orders:</strong> Once an order has been marked <em>Dispatched</em> with an active Airway Bill (AWB) assigned, shipments are in transit and cannot be recalled or cancelled in transit.</li>
</ul>

<h2>3. Dead On Arrival (DOA) & Transit Damage Claims</h2>
<p>In the rare event of transit damage or hardware defects upon physical dock delivery:</p>
<ul>
  <li><strong>Notification Window:</strong> The Buyer must inspect delivered cartons and record any visible seal tampering or outer packaging damage on the carrier POD (Proof of Delivery) within <strong>48 hours</strong> of receipt.</li>
  <li><strong>Evidence Required:</strong> Submit unboxing photos/videos, carton serial numbers, and invoice copy to <a href="mailto:support@tradelogix.in">support@tradelogix.in</a>.</li>
  <li><strong>Replacement Resolution:</strong> Verified DOA units are picked up for inspection and replaced promptly from warehouse stock without additional freight surcharges.</li>
</ul>

<h2>4. OEM Manufacturer Warranty Support</h2>
<p>
  All electronic hardware distributed by TradeLogix (including ANC headphones, OLED displays, mechanical keyboards, peripherals, and NVMe drives) comes backed by official <strong>OEM Brand Manufacturer Warranty</strong>. Warranty service, repairs, and technical support are handled via authorized service centers across India.
</p>

<h2>5. Refund Modes & Credit Ledger Adjustments</h2>
<p>Approved refunds are processed via the original settlement rail within <strong>5-7 business days</strong>:</p>
<ul>
  <li><strong>Online Payments (Razorpay):</strong> Reversal credited directly to the source corporate bank account/card.</li>
  <li><strong>Wire Transfers (NEFT/RTGS):</strong> Remitted via direct electronic transfer with UTR confirmation.</li>
  <li><strong>B2B Credit Ledger:</strong> Buyers may elect to receive an instant Credit Note applied to their B2B trade account for subsequent purchase orders.</li>
</ul>`,
    metaTitle: 'Refund & RMA Policy | TradeLogix Commercial Returns',
    metaDescription: 'Explore the TradeLogix return merchandise authorization (RMA) process, DOA warranty coverage, and commercial refund guidelines.',
    showInNav: false,
    showInFooter: true,
    navOrder: 6,
    isPublished: true,
    isSystemPage: true,
  },
  {
    id: 'page-shipping-07',
    slug: 'shipping-policy',
    title: 'Pan-India B2B Logistics & Freight Fulfillment Policy',
    navLabel: 'Shipping Policy',
    content: `<section class="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
  <h3 class="text-base font-bold text-slate-900 font-display m-0">1. Fulfillment Network Overview</h3>
  <p class="m-0 text-slate-600 mt-2">
    <strong>TradeLogix Wholesale</strong> operates a centralized multi-warehouse fulfillment network. Primary dispatches originate from our <strong>Mumbai Central Fulfillment Hub (WH-01)</strong>, engineered to handle palletized high-volume tech consignments, fragile electronics crating, and express courier packages across all 28 states and 8 union territories in India.
  </p>
</section>

<h2>2. Dispatch Turnaround SLAs</h2>
<ul>
  <li><strong>Standard Wholesale Orders:</strong> Picked, packed, strapped, and dispatched within <strong>24 to 48 business hours</strong> following invoice confirmation and payment settlement.</li>
  <li><strong>Priority Air Express:</strong> Eligible high-priority shipments placed before 1:00 PM IST qualify for same-day logistics handover.</li>
  <li><strong>Dispatches Schedule:</strong> Monday through Saturday (excluding national and state gazetted holidays).</li>
</ul>

<h2>3. Logistics Carriers & Cargo Modes</h2>
<p>Consignments are routed via premier tier-1 cargo carriers based on consignment weight, volumetric dimensions, and destination geography:</p>
<ul>
  <li><strong>TradeLogix Express Air Cargo:</strong> Fast transit for high-value monitors, audio gear, and sensitive electronic hardware (2-4 business days metro delivery).</li>
  <li><strong>BlueDart / Delhivery Surface Logistics:</strong> Cost-effective pallet shipments and bulk container routing (4-7 business days pan-India).</li>
  <li><strong>SafeExpress Heavy Freight:</strong> Full-truckload (FTL) and less-than-truckload (LTL) distribution for corporate rollouts.</li>
</ul>

<h2>4. Airway Bill (AWB) Tracking & E-Way Bill Compliance</h2>
<p>
  Upon dispatch handover, an automated tracking notice containing the <strong>Carrier Name</strong> and <strong>Tracking AWB Number</strong> is generated and updated directly on your B2B Customer Portal. All consignments over ₹50,000 are accompanied by valid electronic <strong>E-Way Bills</strong> generated via the GST portal to ensure smooth interstate transit.
</p>

<h2>5. Self-Pickup & Dock Handover</h2>
<p>
  Registered dealers and local distributors with their own freight vehicles may opt for <strong>Warehouse Dock Handover</strong> at our Marol, Andheri East hub with prior gate pass coordination.
</p>`,
    metaTitle: 'Shipping Policy | TradeLogix Pan-India Logistics',
    metaDescription: 'Comprehensive shipping schedules, surface line-haul transit times, pallet handling, and bill of lading (LR) documentation.',
    showInNav: false,
    showInFooter: true,
    navOrder: 7,
    isPublished: true,
    isSystemPage: true,
  },
];

export async function fetchPublicPagesApi() {
  try {
    const res = await fetch(`${API_URL}/api/pages`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to fetch pages: ${res.statusText}`);
    const json = await res.json();
    const list = json.data || json;
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_PAGES.filter(p => p.isPublished);
  } catch (err) {
    console.warn('[PagesService] Using default fallback public pages:', err.message);
    return DEFAULT_PAGES.filter(p => p.isPublished);
  }
}

export async function fetchPageBySlugApi(slug) {
  const cleanSlug = (slug || '').replace(/^\/+|\/+$/g, '').toLowerCase();
  try {
    const res = await fetch(`${API_URL}/api/pages/${cleanSlug}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Page not found: ${res.statusText}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn(`[PagesService] Fallback finding slug '${cleanSlug}':`, err.message);
    const matched = DEFAULT_PAGES.find(p => p.slug === cleanSlug);
    if (matched) return matched;
    // Map alternative slugs like terms -> terms-of-sale, privacy -> privacy-policy, shipping -> shipping-policy
    if (cleanSlug === 'terms') return DEFAULT_PAGES.find(p => p.slug === 'terms-of-sale');
    if (cleanSlug === 'privacy') return DEFAULT_PAGES.find(p => p.slug === 'privacy-policy');
    if (cleanSlug === 'shipping') return DEFAULT_PAGES.find(p => p.slug === 'shipping-policy');
    if (cleanSlug === 'refund') return DEFAULT_PAGES.find(p => p.slug === 'refund-policy');
    return null;
  }
}

export async function fetchAdminPagesApi() {
  try {
    const res = await fetch(`${API_URL}/api/admin/pages`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to fetch admin pages: ${res.statusText}`);
    const json = await res.json();
    const list = json.data || json;
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_PAGES;
  } catch (err) {
    console.warn('[PagesService] Admin fetch fallback:', err.message);
    return DEFAULT_PAGES;
  }
}

export async function fetchAdminPageByIdApi(id) {
  try {
    const res = await fetch(`${API_URL}/api/admin/pages/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to fetch page with ID ${id}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn(`[PagesService] Admin fetch by ID fallback for '${id}':`, err.message);
    const matched = DEFAULT_PAGES.find(p => p.id === id || p.slug === id);
    if (matched) return matched;
    // Map alternative slug names
    if (id === 'terms') return DEFAULT_PAGES.find(p => p.slug === 'terms-of-sale');
    if (id === 'privacy') return DEFAULT_PAGES.find(p => p.slug === 'privacy-policy');
    if (id === 'shipping') return DEFAULT_PAGES.find(p => p.slug === 'shipping-policy');
    if (id === 'refund') return DEFAULT_PAGES.find(p => p.slug === 'refund-policy');
    return null;
  }
}

export async function createAdminPageApi(pageData) {
  const res = await fetch(`${API_URL}/api/admin/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pageData),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to create page');
  }
  return json.data || json;
}

export async function updateAdminPageApi(id, pageData) {
  const res = await fetch(`${API_URL}/api/admin/pages/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pageData),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to update page');
  }
  return json.data || json;
}

export async function deleteAdminPageApi(id) {
  const res = await fetch(`${API_URL}/api/admin/pages/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to delete page');
  }
  return json;
}

export async function reorderAdminPagesApi(items) {
  const res = await fetch(`${API_URL}/api/admin/pages/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to reorder pages');
  }
  return json.data || json;
}
