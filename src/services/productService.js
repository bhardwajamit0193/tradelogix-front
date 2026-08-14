export const PRODUCTS = [
  {
    id: 'prod-1',
    name: 'AeroPulse ANC Wireless Headphones',
    slug: 'aeropulse-anc-wireless-headphones',
    category: 'Audio',
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.9,
    reviewCount: 142,
    inStock: true,
    stockCount: 38,
    isFeatured: true,
    isNew: true,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Midnight Black', 'Silver Frost', 'Cyber Blue'],
    description: 'Experience ultra-pure audio with active noise cancellation, 45-hour battery life, spatial audio processing, and ultra-soft memory foam ear cushions.',
    specs: {
      'Driver Size': '40mm Titanium Dynamic',
      'Battery Life': 'Up to 45 Hours',
      'Connectivity': 'Bluetooth 5.3 / 3.5mm Aux',
      'Weight': '250g',
      'ANC Modes': 'Adaptive Noise Control, Transparency',
    },
  },
  {
    id: 'prod-2',
    name: 'OmniView 34" Curved OLED Monitor',
    slug: 'omniview-34-curved-oled-monitor',
    category: 'Displays',
    price: 1199.00,
    originalPrice: 1299.00,
    rating: 4.8,
    reviewCount: 89,
    inStock: true,
    stockCount: 14,
    isFeatured: true,
    isNew: false,
    badge: 'Pro Choice',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Standard Desk Stand', 'VESA Monitor Arm Bundle'],
    description: 'Ultra-wide 240Hz OLED gaming & workstation display with 0.03ms response time, 99% DCI-P3 color precision, and immersive 1800R curvature.',
    specs: {
      'Resolution': '3440 x 1440 UWQHD',
      'Refresh Rate': '240Hz',
      'Response Time': '0.03ms GTG',
      'HDR': 'DisplayHDR True Black 400',
    },
  },
  {
    id: 'prod-3',
    name: 'CraftKey Pro Mechanical Keyboard',
    slug: 'craftkey-pro-mechanical-keyboard',
    category: 'Peripherals',
    price: 189.50,
    originalPrice: 219.00,
    rating: 4.9,
    reviewCount: 215,
    inStock: true,
    stockCount: 52,
    isFeatured: true,
    isNew: true,
    badge: 'Hot Item',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Tactile Brown Switches', 'Linear Red Switches', 'Clicky Blue Switches'],
    description: 'Custom gasket-mounted wireless mechanical keyboard featuring CNC aluminum chassis, hot-swappable PCB, and PBT double-shot keycaps.',
    specs: {
      'Layout': '75% Compact',
      'Connectivity': 'Tri-Mode (2.4GHz, BT 5.1, USB-C)',
      'Battery': '4000mAh (Up to 200 hrs RGB off)',
      'Chassis': 'Anodized Aircraft Aluminum',
    },
  },
  {
    id: 'prod-4',
    name: 'PulseBand Ultra Smart Watch',
    slug: 'pulseband-ultra-smart-watch',
    category: 'Wearables',
    price: 349.00,
    originalPrice: 399.00,
    rating: 4.7,
    reviewCount: 94,
    inStock: true,
    stockCount: 22,
    isFeatured: false,
    isNew: true,
    badge: 'New Arrival',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Titanium / Sport Loop', 'Graphite / Leather Strap'],
    description: 'Next-gen health monitoring smartwatch with sapphire glass, dual-frequency GPS, ECG tracking, and 7-day extended battery life.',
    specs: {
      'Display': '1.92" LTPO AMOLED 2000 nits',
      'Water Resistance': '100m (10 ATM)',
      'Sensors': 'ECG, SpO2, Optical Heart Rate, Temperature',
    },
  },
  {
    id: 'prod-5',
    name: 'LuminaDesk Ergonomic LED Lamp',
    slug: 'luminadesk-ergonomic-led-lamp',
    category: 'Home & Office',
    price: 89.00,
    originalPrice: 109.00,
    rating: 4.6,
    reviewCount: 68,
    inStock: true,
    stockCount: 60,
    isFeatured: false,
    isNew: false,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Space Gray', 'Matte White'],
    description: 'Smart ambient desk lamp with automatic light sensing, adjustable color temperature (2700K - 6500K), and built-in 15W Qi wireless charger.',
    specs: {
      'Brightness': '1000 Lumens Max',
      'CRI': 'Ra >= 95 Color Rendering',
      'Wireless Charging': '15W Fast Qi Pad',
    },
  },
  {
    id: 'prod-6',
    name: 'NovaStation 7-in-1 USB-C Dock',
    slug: 'novastation-7-in-1-usbc-dock',
    category: 'Peripherals',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviewCount: 112,
    inStock: true,
    stockCount: 85,
    isFeatured: false,
    isNew: false,
    badge: 'Essential',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Standard Metal Gray'],
    description: 'High-speed hub offering Dual 4K 60Hz HDMI output, 100W Power Delivery, SD/TF reader, and 10Gbps USB 3.2 Gen 2 transfer rates.',
    specs: {
      'HDMI Output': 'Dual 4K @ 60Hz',
      'Pass-Through Power': '100W PD 3.0',
      'Data Rate': '10 Gbps',
    },
  },
  {
    id: 'prod-7',
    name: 'HyperDrive NVMe Portable SSD 2TB',
    slug: 'hyperdrive-nvme-portable-ssd-2tb',
    category: 'Storage',
    price: 219.00,
    originalPrice: 249.00,
    rating: 4.9,
    reviewCount: 178,
    inStock: true,
    stockCount: 40,
    isFeatured: true,
    isNew: false,
    badge: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['1TB Capacity', '2TB Capacity', '4TB Capacity'],
    description: 'Ruggedized shock-resistant external SSD delivering up to 2000 MB/s read speeds, IP65 water resistance, and hardware encryption.',
    specs: {
      'Read Speed': 'Up to 2000 MB/s',
      'Interface': 'USB 3.2 Gen 2x2',
      'Protection': 'IP65 Water/Dust Resistant',
    },
  },
  {
    id: 'prod-8',
    name: 'Vortex Precision Wireless Gaming Mouse',
    slug: 'vortex-precision-wireless-gaming-mouse',
    category: 'Peripherals',
    price: 129.99,
    originalPrice: 149.99,
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    stockCount: 29,
    isFeatured: false,
    isNew: true,
    badge: 'Esports Ready',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Obsidian Black', 'Chalk White'],
    description: 'Ultra-lightweight 49g gaming mouse powered by 30K optical sensor, 8000Hz wireless polling rate, and optical micro-switches.',
    specs: {
      'Weight': '49g Ultra Lightweight',
      'Sensor': '30,000 DPI Optical',
      'Battery': 'Up to 90 Hours',
    },
  },
];

export const CATEGORIES = [
  'All',
  'Audio',
  'Displays',
  'Peripherals',
  'Wearables',
  'Home & Office',
  'Storage',
];

export function getProducts({ category = 'All', search = '', sortBy = 'featured', maxPrice = 2000 } = {}) {
  let list = [...PRODUCTS];

  if (category && category !== 'All') {
    list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (maxPrice) {
    list = list.filter((p) => p.price <= maxPrice);
  }

  if (sortBy === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'newest') {
    list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  return list;
}

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getFeaturedProducts() {
  return PRODUCTS.filter((p) => p.isFeatured);
}
