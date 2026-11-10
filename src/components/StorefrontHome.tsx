import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, ArrowRight, Play, Check, Users, Package, Truck, PhoneCall, 
  ChevronRight, Sparkles, CreditCard, ShieldCheck, HelpCircle, Star, Search,
  Heart, Globe, ArrowUpRight, Zap, RefreshCw
} from 'lucide-react';
import { Product } from '../types';

interface StorefrontHomeProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onNavigate: (view: any) => void;
}

export default function StorefrontHome({
  products,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  onNavigate
}: StorefrontHomeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products based on search and selected category
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Services Dataset from Image 2
  const servicesList = [
    { title: 'রিসেলিং / ড্রপশিপিং', desc: 'বিনা পুঁজিতে আজই ব্যবসা শুরু করুন' },
    { title: 'কাস্টমাইজড প্রিন্টিং', desc: 'টি-শার্ট ও মগ কাস্টম ডিজাইন প্রিন্ট' },
    { title: 'প্যাকেজিং ও ব্র্যান্ডিং', desc: 'আপনার নিজস্ব লোগো ও ব্র্যান্ড বক্সে শিপিং' },
    { title: 'স্মার্ট লজিস্টিক সাপোর্ট', desc: 'সারাদেশে দ্রুততম সময়ে ডেলিভারি সুবিধা' },
    { title: 'অটোমেটেড অর্ডার ট্র্যাকিং', desc: 'লাইভ পার্সেল ট্র্যাকিং সিস্টেম' },
    { title: 'ফ্রি ট্রেনিং ও একাডেমি', desc: 'মার্কেটিং ও বিজনেস ডেভেলপমেন্ট গাইড' },
    { title: '২৪/৭ লাইভ হেল্পডেস্ক', desc: 'কল ও চ্যাট সাপোর্ট সুবিধা' },
    { title: 'মার্কেটপ্লেস এপিআই', desc: 'দারাজ ও শপফাই সিঙ্ক সুবিধা' },
    { title: 'বাল্ক পাইকারি রেট', desc: 'যেকোনো পোশাকে হোলসেল ডিসকাউন্ট' },
    { title: 'ক্যাম্পেইন কালেকশন', desc: 'ঈদ ও পুজো ধামাকা ট্রেন্ডি অফার' },
    { title: 'ড্রপশিপিং ফ্রি ওয়েবসাইট', desc: 'নিজস্ব ডোমেইনে ফ্রি ই-কমার্স স্টোর' }
  ];

  // Features Dataset from Image 2
  const specialFeatures = [
    {
      title: 'ফ্রি ই-কমার্স ওয়েবসাইট',
      desc: 'আমাদের প্যানেলে রেজিস্ট্রেশন করলেই পাবেন একটি কাস্টমাইজড ডোমেইন সহ প্রফেশনাল ই-কমার্স ওয়েবসাইট সম্পূর্ণ ফ্রিতে।',
      icon: <Globe className="w-5 h-5 text-indigo-600" />
    },
    {
      title: 'ইনস্ট্যান্ট পেমেন্ট উইথড্র',
      desc: 'ডেলিভারি সফল হওয়ার ২৪ ঘণ্টার মধ্যেই আপনার অর্জিত লভ্যাংশ বিকাশ, রকেট বা ব্যাংকের মাধ্যমে ইনস্ট্যান্টলি উত্তোলন করুন।',
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />
    },
    {
      title: 'সারাদেশে ক্যাশ অন ডেলিভারি',
      desc: 'কাস্টমারকে প্রোডাক্ট হাতে পেয়ে মূল্য পরিশোধের সুবিধা দিন। ঢাকার বাইরেও ৩-৫ কার্যদিবসের মধ্যে নির্ভরযোগ্য ডেলিভারি নিশ্চয়তা।',
      icon: <Truck className="w-5 h-5 text-amber-600" />
    },
    {
      title: 'ডেডিকেটেড মেন্টরশিপ সাপোর্ট',
      desc: 'কীভাবে ফেসবুক পেজ বুস্ট করবেন, কীভাবে কাস্টমার ডিল করবেন তার জন্য পাবেন দক্ষ মেন্টরের স্পেশাল লাইভ ট্রেনিং।',
      icon: <Users className="w-5 h-5 text-rose-600" />
    },
    {
      title: 'অরিজিনাল প্রোডাক্ট গ্যারান্টি',
      desc: 'BD Mart-এর প্রতিটি কাপড় প্রিমিয়াম মানের তুলা এবং ওরিজিনাল ওভেন সুতা দিয়ে তৈরি। কোয়ালিটি নিয়ে কাস্টমার থাকবে শতভাগ সন্তুষ্ট।',
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />
    },
    {
      title: '২৪/৭ অটোমেটেড বুকিং পোর্টাল',
      desc: 'আপনার প্যানেল থেকে যেকোনো সময় যেকোনো প্রান্ত থেকে সরাসরি কাস্টমারের নামে অর্ডার বুকিং করার সহজ ও আধুনিক ড্যাশবোর্ড।',
      icon: <Zap className="w-5 h-5 text-purple-600" />
    },
    {
      title: 'ফটো ও ভিডিও ম্যাটেরিয়ালস',
      desc: 'মার্কেটিংয়ের জন্য ক্যাটালগ তৈরির ঝামেলা এড়াতে আমরাই দেব হাই-রেজোলিউশন স্টুডিও মডেল ফটোশুট এবং আকর্ষণীয় প্রমোশনাল ভিডিও।',
      icon: <Sparkles className="w-5 h-5 text-orange-600" />
    },
    {
      title: 'সহজ রিটার্ন ও রিফান্ড পলিসি',
      desc: 'কোনো কারণে কাস্টমার সাইজ পরিবর্তন করতে চাইলে বা পার্সেল ড্যামেজ হলে কোনো ঝামেলা ছাড়াই আমরা প্রোডাক্ট পরিবর্তন করে দেব।',
      icon: <RefreshCw className="w-5 h-5 text-teal-600" />
    }
  ];

  // Guide Dataset from Image 1
  const guideSteps = [
    {
      num: '১',
      title: 'সম্পূর্ণ ফ্রীতে রেজিস্ট্রেশন করুন',
      desc: 'BD Mart ড্রপশিপিং প্যানেলে সাইন আপ করুন। কোনো প্রকার সিকিউরিটি ফি বা হিডেন চার্জ ছাড়াই আপনার একাউন্ট লাইভ করুন।'
    },
    {
      num: '২',
      title: 'পছন্দের ট্রেন্ডি প্রোডাক্ট সিলেক্ট করুন',
      desc: 'আমাদের বিশাল ওভেন-কোল্ড উইন্টার ও অটাম কালেকশন থেকে আপনার টার্গেটেড নিশ অনুযায়ী পোশাকের ছবি ও বিবরণ কপি করুন।'
    },
    {
      num: '৩',
      title: 'সোশ্যাল মিডিয়ায় প্রমোট ও বিক্রি করুন',
      desc: 'আপনার ফেসবুক পেজ, ইন্সটাগ্রাম বা পার্সোনাল ই-কমার্স স্টোরে নিজস্ব লাভে প্রাইস বসিয়ে মার্কেটিং শুরু করুন।'
    },
    {
      num: '৪',
      title: 'কাস্টমার থেকে অর্ডার ও ডিটেইলস সংগ্রহ করুন',
      desc: 'কাস্টমারের নাম, ফোন নাম্বার, ডেলিভারি এড্রেস এবং আপনার নির্ধারিত বিক্রয় মূল্য কনফার্ম করে অগ্রিম বা ক্যাশ অন পেমেন্ট বুঝে নিন।'
    },
    {
      num: '৫',
      title: 'আমাদের ড্যাশবোর্ডে অর্ডার প্লেস করুন',
      desc: 'আপনার কাস্টমারের এড্রেস দিয়ে আমাদের পোর্টালে অর্ডার সাবমিট করুন। প্যাকেজিং ও ডেলিভারি করার সম্পূর্ণ দায়িত্ব আমাদের।'
    },
    {
      num: '৬',
      title: 'আপনার লাভ বুঝে নিন সরাসরি বিকাশ বা ব্যাংকে',
      desc: 'পার্সেল ডেলিভারি সফল হতেই আপনার নির্ধারিত প্রফিট মার্জিন ইনস্ট্যান্টলি আপনার ওয়ালেটে ক্রেডিট হয়ে যাবে।'
    }
  ];

  // Reviews Dataset from Image 1
  const userReviews = [
    {
      name: 'সোহেল রানা',
      role: 'ঢাকা ড্রপশিপার',
      stars: 5,
      comment: 'কোনো ইনভেস্টমেন্ট ছাড়াই আমি গত মাসে BD Mart ড্রপশিপিং এর মাধ্যমে ১৫ হাজার টাকার ওপরে লাভ করেছি। তাদের কাপড়ের কোয়ালিটি সত্যিই অসাধারণ এবং কাস্টমাররা খুবই পছন্দ করছে!'
    },
    {
      name: 'জান্নাতুল ফেরদৌস',
      role: 'হোম এন্টারপ্রেনিউর',
      stars: 5,
      comment: 'পূর্বে প্রোডাক্ট সোর্সিং এবং ডেলিভারি নিয়ে অনেক টেনশন থাকতো। এখন BD Mart আমার সব দায়িত্ব নিজের কাধে নিয়েছে, আমি শুধু ফেসবুক পেজে মার্কেটিং এ মনোযোগ দিই!'
    },
    {
      name: 'কাজী মাহফুজুর',
      role: 'ফুল-টাইম রিসেলার',
      stars: 5,
      comment: 'তাদের ইনস্ট্যান্ট পেমেন্ট গেটওয়ে সিস্টেমটি অসাধারণ। ডেলিভারি হওয়ার ২৪ ঘণ্টার মধ্যে বিকাশ অ্যাকাউন্টে টাকা চলে আসে। সাপোর্ট টিমের ব্যবহারও ভীষণ চমৎকার।'
    },
    {
      name: 'রাইহান ইসলাম',
      role: 'স্টুডেন্ট স্টার্টআপ',
      stars: 5,
      comment: 'পড়াশোনা পাশাপাশি পার্ট-টাইম বাড়তি আয়ের চমৎকার একটি সুযোগ। ঢাকা ও ঢাকার বাইরে ক্যাশ অন ডেলিভারি এবং সহজ রিটার্ন পলিসি থাকার কারণে অর্ডার পেতে অনেক সহজ হয়!'
    }
  ];

  return (
    <div id="storefront-home-component" className="w-full space-y-16">
      
      {/* 1. HERO BANNER SECTION (Image 2 style) */}
      <section className="bg-gradient-to-br from-[#faf8f5] via-white to-indigo-50/40 py-16 px-4 md:px-8 border-b border-neutral-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text Block */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-widest font-sans">
                BD MART DROPSHIPPING SYSTEM
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-brand-indigo tracking-tight font-display leading-tight">
              দেশের বৃহৎ <span className="text-orange-500 underline decoration-indigo-500/40">ড্রপশিপিং</span> এবং <br className="hidden md:inline" />
              <span className="text-indigo-600 font-extrabold">রিসেলিং</span> প্ল্যাটফর্ম
            </h1>

            <p className="text-neutral-600 text-sm md:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-medium">
              কোনো প্রকার পুঁজি বা ইনভেন্টরি ছাড়াই ঘরে বসে আজই নিজের একটি ই-কমার্স ব্র্যান্ড তৈরি করুন। আমরা দিচ্ছি প্রিমিয়াম ক্যাটালগ সোর্সিং, আকর্ষণীয় মডেল শুট এবং নির্ভরযোগ্য ফাস্ট ক্যাশ-অন-ডেলিভারি সাপোর্ট।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <button
                id="hero-register-btn"
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group active:scale-99"
              >
                রেজিস্ট্রেশন করুন
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a
                id="hero-details-btn"
                href="#about-section-view"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-250 rounded-lg text-sm font-bold uppercase tracking-wider transition-all text-center"
              >
                বিস্তারিত জানুন
              </a>
            </div>
          </div>

          {/* Right Hero Graphic: Interactive SVG Dropshipping Cycle Illustration (Image 2 design) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-square bg-white rounded-2xl border border-neutral-100 shadow-xl p-6 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-indigo-50/40 via-transparent to-transparent opacity-50" />
              
              <div className="text-center pb-2 border-b border-neutral-100 relative">
                <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-400 block font-sans">
                  Atelier Logistics Engine
                </span>
                <span className="text-sm font-extrabold text-indigo-600 font-display">
                  DROPSHIPPING MODEL
                </span>
              </div>

              {/* Dynamic SVG Lifecycle Diagram */}
              <div className="flex-1 my-4 flex items-center justify-center relative">
                <svg viewBox="0 0 400 400" className="w-full h-full max-h-[280px]">
                  {/* Outer circle flow */}
                  <circle cx="200" cy="200" r="140" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 6" />
                  
                  {/* Step 1: Customer */}
                  <g transform="translate(200, 50)">
                    <circle cx="0" cy="0" r="28" fill="#fef3c7" stroke="#fbbf24" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#78350f" fontFamily="sans-serif">১. কাস্টমার</text>
                  </g>
                  
                  {/* Step 2: Reseller (Seller) */}
                  <g transform="translate(70, 260)">
                    <circle cx="0" cy="0" r="28" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0369a1" fontFamily="sans-serif">২. বিক্রেতা</text>
                  </g>
                  
                  {/* Step 3: BD Mart Hub */}
                  <g transform="translate(330, 260)">
                    <circle cx="0" cy="0" r="28" fill="#dcfce7" stroke="#4ade80" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#15803d" fontFamily="sans-serif">৩. বিডি মার্ট</text>
                  </g>

                  {/* Flow Arrow Lines with labels */}
                  <path d="M 200,85 A 115,115 0 0,0 95,235" fill="none" stroke="#fb923c" strokeWidth="3" markerEnd="url(#arrow)" />
                  <path d="M 100,270 L 300,270" fill="none" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arrow)" />
                  <path d="M 320,230 A 115,115 0 0,0 205,80" fill="none" stroke="#22c55e" strokeWidth="3" markerEnd="url(#arrow)" />
                  
                  {/* Cycle labels */}
                  <rect x="80" y="140" width="75" height="18" rx="4" fill="#ffedd5" stroke="#fed7aa" strokeWidth="1" />
                  <text x="117.5" y="152" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#c2410c">অর্ডার প্লেস করে</text>

                  <rect x="162.5" y="255" width="75" height="18" rx="4" fill="#e0e7ff" stroke="#c7d2fe" strokeWidth="1" />
                  <text x="200" y="267" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4338ca">সোর্সিং ও ট্র্যাকিং</text>

                  <rect x="245" y="140" width="75" height="18" rx="4" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="1" />
                  <text x="282.5" y="152" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#15803d">সরাসরি ডেলিভারি</text>

                  {/* Custom markers definitions */}
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="currentColor" />
                    </marker>
                  </defs>

                  {/* Center branding icon */}
                  <g transform="translate(200, 195)">
                    <circle cx="0" cy="0" r="22" fill="#010211" />
                    <path d="M-6 -6 L6 -6 L6 6 L-6 6 Z" fill="none" stroke="white" strokeWidth="2" />
                    <circle cx="0" cy="0" r="3" fill="#fb923c" />
                  </g>
                </svg>
              </div>

              <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-2.5 text-center text-xs text-neutral-500 font-semibold leading-relaxed">
                🚀 ইনভেন্টরি কেনা লাগবে না, কাস্টমার হ্যান্ডেল আমরা করব!
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. STATS HIGHLIGHTS BAR (Image 2 style) */}
      <section id="stats-banner-view" className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-orange-50 border border-orange-100 rounded-xl p-6 shadow-xs text-center">
          <div className="space-y-1 py-2 lg:border-r border-orange-200">
            <div className="flex items-center justify-center gap-1.5 text-orange-600">
              <Users className="w-5 h-5" />
              <span className="text-xl md:text-2xl font-black font-sans">২,০০,০০০+</span>
            </div>
            <p className="text-xs font-bold text-neutral-600">রিসেলার ও ড্রপশিপার</p>
          </div>

          <div className="space-y-1 py-2 lg:border-r border-orange-200">
            <div className="flex items-center justify-center gap-1.5 text-orange-600">
              <Package className="w-5 h-5" />
              <span className="text-xl md:text-2xl font-black font-sans">১০,০০০+</span>
            </div>
            <p className="text-xs font-bold text-neutral-600">ট্রেন্ডি রেডিমেড পোশাক</p>
          </div>

          <div className="space-y-1 py-2 lg:border-r border-orange-200">
            <div className="flex items-center justify-center gap-1.5 text-orange-600">
              <Truck className="w-5 h-5" />
              <span className="text-xl md:text-2xl font-black font-sans">১০০K+</span>
            </div>
            <p className="text-xs font-bold text-neutral-600">সাকসেস ডেলিভারি</p>
          </div>

          <div className="space-y-1 py-2">
            <div className="flex items-center justify-center gap-1.5 text-orange-600">
              <PhoneCall className="w-5 h-5" />
              <span className="text-xl md:text-2xl font-black font-sans">২৪/৭</span>
            </div>
            <p className="text-xs font-bold text-neutral-600">উইকেন্ডসহ লাইভ সাপোর্ট</p>
          </div>
        </div>
      </section>

      {/* 3. ABOUT US SECTION ("আমাদের সম্পর্কে" - Image 2 style) */}
      <section id="about-section-view" className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text Detail */}
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 block">
              GET TO KNOW BD MART
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-indigo tracking-tight font-display uppercase">
              আমাদের সম্পর্কে জানুন
            </h2>
            <hr className="w-16 border-t-2 border-orange-500" />
            <p className="text-sm text-neutral-600 leading-relaxed font-sans">
              BD Mart বাংলাদেশের অন্যতম বৃহত্তম পাইকারি সোর্সিং এবং ওভেন ক্লোথ ড্রপশিপিং লজিস্টিক হাব। তরুণ ও ক্ষুদ্র নারী উদ্যোক্তাদের আর্থিকভাবে সাবলম্বী করে তোলার স্বপ্ন নিয়ে আমরা ঢাকা ওভেন জোন থেকে প্রিমিয়াম শীত ও অটাম কালেকশনের পোশাক ডিজাইন ও ম্যানুফ্যাকচারিং করছি। 
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed font-sans">
              প্রোডাক্ট সোর্সিং থেকে শুরু করে কোয়ালিটি চেক, প্রিমিয়াম প্যাকেজিং ও সারাদেশে ক্যাশ অন ডেলিভারি কাস্টমারের ঠিকানায় পৌঁছে দেওয়া পর্যন্ত আমরা সম্পূর্ণ প্রফেশনাল টিম দ্বারা কাজ পরিচালনা করি, যাতে আপনার ব্যবসায়ের নির্ভরযোগ্য লজিস্টিক পার্টনার হিসেবে আমরা সবসময় পাশে থাকতে পারি।
            </p>
            <div className="pt-2">
              <button
                id="join-now-btn"
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-2 bg-brand-indigo hover:bg-neutral-900 text-white font-bold py-3 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-xs active:scale-99"
              >
                আজই জয়েন করুন
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Video Mockup Panel (Replicating Image 2 Video Embed) */}
          <div className="lg:col-span-6">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-150 shadow-lg group">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
                alt="BD Mart Professional Team"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-indigo/35 backdrop-blur-[1px] flex items-center justify-center transition-colors group-hover:bg-brand-indigo/40" />
              
              {/* Play Button */}
              <div className="absolute w-16 h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-108 duration-300 cursor-pointer">
                <Play className="w-6 h-6 fill-white ml-1" />
              </div>

              {/* Tag overlay */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-md border border-neutral-200">
                <p className="text-[10px] font-bold text-brand-indigo uppercase tracking-wider font-sans">
                  WATCH HOW WE SHIP 🎥
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. OUR SERVICES SECTION ("আমাদের সার্ভিস সমূহ" - Image 2 style) */}
      <section id="services-section-view" className="bg-[#faf8f5] py-16 px-4 md:px-8 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              ALL-IN-ONE ECOSYSTEM
            </span>
            <h2 className="text-3xl font-extrabold text-brand-indigo tracking-tight font-display uppercase">
              আমাদের সার্ভিস সমূহ
            </h2>
            <p className="text-xs text-neutral-500 max-w-lg mx-auto">
              ক্যাটালগ থেকে শুরু করে পেমেন্ট এবং কাস্টমার লজিস্টিক সাপোর্টের জন্য আমাদের ডেডিকেটেড ফিচারস
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {servicesList.map((service, i) => (
              <div
                key={i}
                id={`service-card-${i}`}
                className="bg-white border border-neutral-200/80 rounded-lg p-4 hover:border-indigo-300 transition-all shadow-xs hover:shadow-md flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1 min-w-0 pr-3">
                  <h4 className="text-sm font-bold text-brand-indigo truncate group-hover:text-indigo-600 transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {service.desc}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-neutral-100 group-hover:bg-indigo-50 text-neutral-400 group-hover:text-indigo-600 flex items-center justify-center flex-shrink-0 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. SPECIAL FEATURES ("আমাদের স্পেশিয়াল ফিচারস" - Image 2 style) */}
      <section id="features-section-view" className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              WHY PARTNER WITH BD MART?
            </span>
            <h2 className="text-3xl font-extrabold text-brand-indigo tracking-tight font-display uppercase">
              আমাদের স্পেশিয়াল ফিচারস
            </h2>
            <p className="text-xs text-neutral-500 max-w-lg mx-auto">
              আমাদের চমৎকার ও আধুনিক প্ল্যাটফর্ম টেকনোলজি যা ড্রপশিপিংকে করবে আরও সহজ ও ঝামেলাহীন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialFeatures.map((feat, i) => (
              <div
                key={i}
                id={`special-feature-${i}`}
                className="bg-white border border-neutral-150 rounded-lg p-5 hover:border-neutral-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="p-2.5 bg-neutral-50 border border-neutral-150 rounded-md w-fit">
                    {feat.icon}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-brand-indigo font-display">
                      {feat.title}
                    </h4>
                    <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                      {feat.desc}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-neutral-50 mt-4 text-[10px] text-indigo-600 font-bold flex items-center gap-1 uppercase tracking-wider font-sans">
                  Active Service <Check className="w-3 h-3 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CURATED PRODUCT GALLERY ("আমাদের প্রোডাক্ট সমূহ" - Image 1 style) */}
      <section id="products-section-view" className="bg-[#faf8f5] py-16 px-4 md:px-8 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                EXPLORE APPAREL CATALOGUE
              </span>
              <h2 className="text-3xl font-extrabold text-brand-indigo tracking-tight font-display uppercase">
                আমাদের প্রোডাক্ট সমূহ
              </h2>
              <p className="text-xs text-neutral-500">
                আমাদের ওভেনে বোনা ১০০% প্রফেশনাল মডেল শুট করা ক্যাটালগ কালেকশন। পছন্দ করুন এবং অর্ডার নিন।
              </p>
            </div>

            {/* In-view live search input */}
            <div className="w-full md:max-w-xs relative self-end">
              <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                id="store-search-query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পোশাকের নাম দিয়ে খুঁজুন..."
                className="w-full bg-white border border-neutral-250 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand-indigo transition-all font-sans"
              />
            </div>
          </div>

          {/* Fast Category filter chips */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-indigo text-white border-brand-indigo'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-350'
                }`}
              >
                {cat === 'All' ? 'সব পোশাক' : cat}
              </button>
            ))}
          </div>

          {/* Dynamic grid display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-neutral-400 text-sm font-sans">
                দুঃখিত, কোনো প্রোডাক্ট পাওয়া যায়নি।
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isLiked = wishlist.includes(p.id);
                return (
                  <div
                    key={p.id}
                    id={`store-item-card-${p.id}`}
                    className="group bg-white border border-neutral-150 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    
                    {/* Cover image frame */}
                    <div className="aspect-[3/4] overflow-hidden bg-neutral-100 relative border-b border-neutral-100">
                      <img
                        src={p.image || null}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Wishlist toggle overlay */}
                      <button
                        id={`wishlist-btn-home-${p.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(p.id);
                        }}
                        className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs p-2 rounded-full shadow-xs text-neutral-500 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {/* Out of Stock banner */}
                      {!p.inStock && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-neutral-800 text-white font-display text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-sm">
                            STOCK OUT
                          </span>
                        </div>
                      )}

                      {p.originalPrice && (
                        <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                          PROFIT BOOST
                        </span>
                      )}
                    </div>

                    {/* Metadata summary & action panel */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                          {p.category}
                        </span>
                        <h4 className="text-xs font-bold text-brand-indigo leading-snug group-hover:underline line-clamp-1">
                          {p.name}
                        </h4>
                        
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-sm font-bold text-brand-indigo font-sans">
                            ৳{p.price.toLocaleString()}
                          </span>
                          {p.originalPrice && (
                            <span className="text-[10px] line-through text-neutral-400 font-sans">
                              ৳{p.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dynamic star ratings display */}
                      <div className="flex items-center gap-1 text-[10px] text-neutral-500 pt-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold">{p.rating}</span>
                        <span>({p.reviewsCount} reviews)</span>
                      </div>

                      <div className="pt-2">
                        <button
                          id={`view-item-detail-${p.id}`}
                          onClick={() => onSelectProduct(p)}
                          className="w-full py-2 bg-neutral-50 hover:bg-brand-indigo hover:text-white border border-neutral-200 hover:border-brand-indigo rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                        >
                          পণ্যটি দেখুন
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* 7. STEP-BY-STEP TRAINING GUIDE ("কিভাবে আমাদের মাধ্যমে বিজনেস করবেন" - Image 1 style) */}
      <section id="guide-section-view" className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              STEP-BY-STEP TRAINING
            </span>
            <h2 className="text-3xl font-extrabold text-brand-indigo tracking-tight font-display uppercase">
              কিভাবে আমাদের মাধ্যমে বিজনেস করবেন
            </h2>
            <p className="text-xs text-neutral-500 max-w-lg mx-auto">
              খুবই সাধারণ ৬টি ধাপে বিনা খরচে যেকোনো বয়সের মানুষ গড়ে তুলতে পারেন সফল রিটেইল বিজনেস
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guideSteps.map((step, i) => (
              <div
                key={i}
                id={`guide-card-${i}`}
                className="bg-white border border-neutral-150 rounded-lg p-6 shadow-xs flex gap-4 hover:border-neutral-300 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-orange-100 border border-orange-200 text-orange-600 text-lg font-black flex items-center justify-center flex-shrink-0 font-display">
                  {step.num}
                </div>
                <div className="space-y-1.5 min-w-0">
                  <h4 className="text-sm font-extrabold text-brand-indigo font-display">
                    {step.title}
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. TESTIMONIAL BOARD ("ড্রপশিপার রিভিউস" - Image 1 style) */}
      <section id="reviews-section-view" className="max-w-7xl mx-auto px-4 md:px-8 pb-4">
        <div className="bg-white border border-neutral-150 rounded-xl p-8 shadow-xs space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              SUCCESS STORIES
            </span>
            <h2 className="text-3xl font-extrabold text-brand-indigo tracking-tight font-display uppercase">
              ড্রপশিপার রিভিউস
            </h2>
            <p className="text-xs text-neutral-500 max-w-lg mx-auto">
              সারাদেশের ২০০০+ ড্রপশিপারদের আন্তরিক মতামত ও সফলতার খণ্ড চিত্র
            </p>
          </div>

          {/* Testimonial slider grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userReviews.map((rev, i) => (
              <div
                key={i}
                id={`testimonial-card-${i}`}
                className="p-5 rounded-lg bg-neutral-50 border border-neutral-200/80 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {/* Stars */}
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(rev.stars)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600 italic leading-relaxed font-sans font-medium">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
                  <div className="w-8 h-8 rounded-full bg-brand-indigo text-white text-xs font-bold flex items-center justify-center uppercase font-sans">
                    {rev.name[0]}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-indigo font-display">
                      {rev.name}
                    </h5>
                    <p className="text-[10px] text-neutral-400 font-sans">
                      {rev.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick FAQ / trust info */}
          <div className="text-center border-t border-neutral-100 pt-6 text-xs text-neutral-400 font-sans">
            আমাদের একাডেমি থেকে ফ্রীতে ৩ দিনের স্পেশাল ড্রপশিপিং ক্লাস করতে আমাদের ফেসবুক গ্রুপে জয়েন করুন।
          </div>

        </div>
      </section>

    </div>
  );
}
