import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Percent,
  Zap,
} from 'lucide-react';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    return `${API_URL}${url}`;
  }
  return url;
};

const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    badge: 'Enterprise Wholesale Exclusive',
    title: 'Flagship 240Hz Curved OLED Displays',
    subtitle: 'Ultra-wide workstation monitors with 0.03ms response time & 99% DCI-P3 color precision for enterprise setups.',
    priceText: 'From ₹1,199.00',
    ctaText: 'Explore Displays',
    ctaLink: '/shop?category=Displays',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=80',
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    accentColor: 'text-indigo-400',
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
    bgGradient: 'from-slate-950 via-brand-950 to-slate-900',
    accentColor: 'text-brand-300',
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
    bgGradient: 'from-slate-950 via-cyan-950 to-slate-900',
    accentColor: 'text-cyan-300',
    tagPill: 'Gasket Mounted • Hot-Swap PCB',
    theme: 'cyan',
  },
];

const THEME_GRADIENTS = {
  indigo: 'from-slate-950 via-slate-900 to-indigo-950',
  brand: 'from-slate-950 via-brand-950 to-slate-900',
  cyan: 'from-slate-950 via-cyan-950 to-slate-900',
  purple: 'from-slate-950 via-purple-950 to-slate-900',
  emerald: 'from-slate-950 via-emerald-950 to-slate-900',
  rose: 'from-slate-950 via-rose-950 to-slate-900',
};

export default function HeroBannerSlider({ slides = [] }) {
  const activeSlides = Array.isArray(slides) && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  useEffect(() => {
    if (!isPaused && activeSlides.length > 1) {
      autoPlayRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused, activeSlides.length]);

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-950 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative min-h-[460px] sm:min-h-[480px] lg:min-h-[520px] flex items-stretch">
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const gradientClass = slide.bgGradient || THEME_GRADIENTS[slide.theme] || THEME_GRADIENTS.indigo;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col lg:flex-row ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Left Content Side */}
              <div
                className={`flex-1 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-gradient-to-br ${gradientClass} text-white relative z-10`}
              >
                <div className="space-y-4 max-w-xl">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    <span>{slide.badge || 'Featured Offer'}</span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-tight text-white">
                    {slide.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {slide.subtitle}
                  </p>

                  {/* Pill Tag & Price */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/20 text-[11px] font-semibold text-slate-200">
                      {slide.tagPill}
                    </span>
                    <span className="font-display font-extrabold text-sm sm:text-base text-white">
                      {slide.priceText}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <a
                      href={slide.ctaLink}
                      className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-display font-bold text-xs shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    <a
                      href="/shop"
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-display font-semibold text-xs backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                    >
                      Explore All Gear
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Image Side */}
              <a
                href={slide.ctaLink}
                className="flex-1 relative min-h-[220px] sm:min-h-[280px] lg:min-h-full overflow-hidden block cursor-pointer group/img"
              >
                <img
                  src={resolveMediaUrl(slide.image)}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-slate-950/90" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-brand-600 text-white flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-md transition-all z-20 hover:scale-110 active:scale-95 cursor-pointer opacity-80 group-hover:opacity-100"
        title="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-brand-600 text-white flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-md transition-all z-20 hover:scale-110 active:scale-95 cursor-pointer opacity-80 group-hover:opacity-100"
        title="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
        {activeSlides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentSlide(i)}
            className={`transition-all rounded-full cursor-pointer ${
              i === currentSlide
                ? 'w-6 h-2 bg-brand-500'
                : 'w-2 h-2 bg-white/50 hover:bg-white'
            }`}
            title={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
