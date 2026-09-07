import {
  // Audio & Sound
  Headphones,
  Speaker,
  Mic,
  Music,
  Volume2,
  Radio,
  // Displays & Video
  Monitor,
  Tv,
  Projector,
  Camera,
  Video,
  // Computing & Storage
  Laptop,
  Tablet,
  Smartphone,
  Cpu,
  Server,
  HardDrive,
  Database,
  // Peripherals & Input
  Keyboard,
  Mouse,
  Gamepad2,
  Gamepad,
  Joystick,
  Printer,
  // Wearables & Smart Tech
  Watch,
  Activity,
  Sparkles,
  Zap,
  // Networking & Connectivity
  Wifi,
  Router,
  Globe,
  Cable,
  Plug,
  // Office & Organization
  Lamp,
  Lightbulb,
  Sliders,
  Layers,
  Box,
  Boxes,
  Package,
  Folder,
  // Tools & Hardware
  Battery,
  Power,
  Wrench,
  Hammer,
  Cog,
  ShieldCheck,
  // Badges & Commerce
  Flame,
  Star,
  Award,
  TrendingUp,
  Tag,
  ShoppingBag,
} from 'lucide-react';

export const CATEGORY_ICONS_MAP = {
  // Audio
  Headphones,
  Speaker,
  Mic,
  Music,
  Volume2,
  Radio,
  // Displays
  Monitor,
  Tv,
  Projector,
  Camera,
  Video,
  // Computing & Hardware
  Laptop,
  Tablet,
  Smartphone,
  Cpu,
  Server,
  HardDrive,
  Database,
  // Peripherals
  Keyboard,
  Mouse,
  Gamepad2,
  Gamepad,
  Joystick,
  Printer,
  // Wearables & Smart
  Watch,
  Activity,
  Sparkles,
  Zap,
  // Networking
  Wifi,
  Router,
  Globe,
  Cable,
  Plug,
  // Office & General
  Lamp,
  Lightbulb,
  Sliders,
  Layers,
  Box,
  Boxes,
  Package,
  Folder,
  // Tools & Power
  Battery,
  Power,
  Wrench,
  Hammer,
  Cog,
  ShieldCheck,
  // Badges
  Flame,
  Star,
  Award,
  TrendingUp,
  Tag,
  ShoppingBag,
};

export const CATEGORY_ICONS_GROUPS = [
  {
    group: 'Audio & Media',
    icons: [
      { id: 'Headphones', label: 'Headphones', icon: Headphones },
      { id: 'Speaker', label: 'Speaker', icon: Speaker },
      { id: 'Mic', label: 'Microphone', icon: Mic },
      { id: 'Music', label: 'Music', icon: Music },
      { id: 'Volume2', label: 'Volume', icon: Volume2 },
      { id: 'Radio', label: 'Radio', icon: Radio },
    ],
  },
  {
    group: 'Displays & Video',
    icons: [
      { id: 'Monitor', label: 'Monitor', icon: Monitor },
      { id: 'Tv', label: 'Television', icon: Tv },
      { id: 'Projector', label: 'Projector', icon: Projector },
      { id: 'Camera', label: 'Camera', icon: Camera },
      { id: 'Video', label: 'Video', icon: Video },
    ],
  },
  {
    group: 'Computing & Hardware',
    icons: [
      { id: 'Cpu', label: 'Processor / CPU', icon: Cpu },
      { id: 'Server', label: 'Server Rack', icon: Server },
      { id: 'HardDrive', label: 'Hard Drive / SSD', icon: HardDrive },
      { id: 'Database', label: 'Database', icon: Database },
      { id: 'Laptop', label: 'Laptop', icon: Laptop },
      { id: 'Tablet', label: 'Tablet', icon: Tablet },
      { id: 'Smartphone', label: 'Smartphone', icon: Smartphone },
    ],
  },
  {
    group: 'Peripherals & Gaming',
    icons: [
      { id: 'Keyboard', label: 'Keyboard', icon: Keyboard },
      { id: 'Mouse', label: 'Mouse', icon: Mouse },
      { id: 'Gamepad2', label: 'Gamepad', icon: Gamepad2 },
      { id: 'Joystick', label: 'Joystick', icon: Joystick },
      { id: 'Printer', label: 'Printer', icon: Printer },
    ],
  },
  {
    group: 'Wearables & Smart Tech',
    icons: [
      { id: 'Watch', label: 'Smart Watch', icon: Watch },
      { id: 'Activity', label: 'Fitness / Sensor', icon: Activity },
      { id: 'Zap', label: 'Zap / Fast', icon: Zap },
      { id: 'Sparkles', label: 'Featured / AI', icon: Sparkles },
    ],
  },
  {
    group: 'Networking & Power',
    icons: [
      { id: 'Wifi', label: 'Wi-Fi', icon: Wifi },
      { id: 'Router', label: 'Router', icon: Router },
      { id: 'Globe', label: 'Network / Web', icon: Globe },
      { id: 'Cable', label: 'Cables', icon: Cable },
      { id: 'Plug', label: 'Power Plug', icon: Plug },
      { id: 'Battery', label: 'Battery', icon: Battery },
      { id: 'Power', label: 'Power Switch', icon: Power },
    ],
  },
  {
    group: 'Office, Tools & General',
    icons: [
      { id: 'Lamp', label: 'Lamp / Lighting', icon: Lamp },
      { id: 'Lightbulb', label: 'Lightbulb', icon: Lightbulb },
      { id: 'Layers', label: 'Layers / General', icon: Layers },
      { id: 'Package', label: 'Package / Box', icon: Package },
      { id: 'Boxes', label: 'Multiple Boxes', icon: Boxes },
      { id: 'Wrench', label: 'Tools / Wrench', icon: Wrench },
      { id: 'Hammer', label: 'Hardware / Hammer', icon: Hammer },
      { id: 'Cog', label: 'Parts / Mechanical', icon: Cog },
      { id: 'ShieldCheck', label: 'Security / Shield', icon: ShieldCheck },
      { id: 'Tag', label: 'Tag / Wholesale', icon: Tag },
      { id: 'ShoppingBag', label: 'Shopping Bag', icon: ShoppingBag },
      { id: 'Flame', label: 'Trending / Hot', icon: Flame },
      { id: 'Star', label: 'Star / Top Tier', icon: Star },
      { id: 'Award', label: 'Award / Verified', icon: Award },
    ],
  },
];

export function resolveCategoryIcon(iconKey = '', categoryName = '') {
  // 1. Direct match by stored icon ID
  if (iconKey && CATEGORY_ICONS_MAP[iconKey]) {
    return CATEGORY_ICONS_MAP[iconKey];
  }

  // 2. Fallback smart match by category name
  const n = String(categoryName || '').toLowerCase();
  if (n.includes('audio') || n.includes('headphone') || n.includes('sound') || n.includes('speaker') || n.includes('mic')) return Headphones;
  if (n.includes('display') || n.includes('monitor') || n.includes('screen') || n.includes('oled') || n.includes('tv')) return Monitor;
  if (n.includes('keyboard') || n.includes('mice') || n.includes('mouse') || n.includes('peripheral')) return Keyboard;
  if (n.includes('game') || n.includes('gaming') || n.includes('controller')) return Gamepad2;
  if (n.includes('wearable') || n.includes('watch')) return Watch;
  if (n.includes('storage') || n.includes('nvme') || n.includes('ssd') || n.includes('drive') || n.includes('disk')) return HardDrive;
  if (n.includes('server') || n.includes('network') || n.includes('wifi') || n.includes('router')) return Server;
  if (n.includes('light') || n.includes('lamp') || n.includes('office')) return Lamp;
  if (n.includes('cable') || n.includes('plug') || n.includes('adapter') || n.includes('wire')) return Cable;
  if (n.includes('tool') || n.includes('hardware') || n.includes('repair')) return Wrench;
  if (n.includes('electronic') || n.includes('chip') || n.includes('cpu') || n.includes('processor')) return Cpu;
  if (n.includes('security') || n.includes('cctv') || n.includes('shield')) return ShieldCheck;

  return Layers;
}
