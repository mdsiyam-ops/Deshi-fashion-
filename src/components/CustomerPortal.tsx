import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, User, PlusSquare, Package, Video, Heart, AlertTriangle, FileText, 
  Activity, ShoppingCart, TrendingUp, Landmark, ShieldCheck, HelpCircle, 
  Tv, Send, Bell, ChevronLeft, ChevronRight, Play, Check, Search, Star, 
  ArrowUpRight, DollarSign, Wallet, ArrowRight, CornerDownRight, Plus, 
  RefreshCw, Menu, X, MessageSquare, Phone
} from 'lucide-react';
import { Product, Order, AuthState, Transaction } from '../types';
import { 
  getShopSettingsFromDb, 
  saveShopSettingsToDb, 
  getSavedAccountsFromDb, 
  saveSavedAccountToDb, 
  deleteSavedAccountFromDb 
} from '../lib/firebase';

interface CustomerPortalProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onLogout: () => void;
  auth: AuthState;
  orders: Order[];
  onPlaceOrder: (orderData: any) => void;
  availableBalance: number;
  setAvailableBalance: React.Dispatch<React.SetStateAction<number>>;
  pendingBalance: number;
  setPendingBalance: React.Dispatch<React.SetStateAction<number>>;
  withdrawnBalance: number;
  setWithdrawnBalance: React.Dispatch<React.SetStateAction<number>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export default function CustomerPortal({
  products,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  onLogout,
  auth,
  orders,
  onPlaceOrder,
  availableBalance,
  setAvailableBalance,
  pendingBalance,
  setPendingBalance,
  withdrawnBalance,
  setWithdrawnBalance,
  transactions,
  setTransactions
}: CustomerPortalProps) {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showBalancePopup, setShowBalancePopup] = useState<boolean>(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [trackingNotice, setTrackingNotice] = useState<string | null>(null);

  // Profile data (as requested by the Urgent Notice)
  const [shopName, setShopName] = useState<string>(() => {
    return localStorage.getItem('bd_mart_shop_name') || 'মাই অনলাইন শপ';
  });
  const [supportPhone, setSupportPhone] = useState<string>(() => {
    return localStorage.getItem('bd_mart_support_phone') || '০১৭xxxxxxxx';
  });
  const [fullName, setFullName] = useState<string>(auth.name || 'জান্নাতুল মাওয়া');
  const [isProfileSaved, setIsProfileSaved] = useState<boolean>(false);

  // Financial Wallet State is now received via props

  // Withdraw money state
  const [withdrawMethod, setWithdrawMethod] = useState<string>('bKash');
  const [withdrawAccount, setWithdrawAccount] = useState<string>('');
  const [withdrawBankName, setWithdrawBankName] = useState<string>('');
  const [withdrawBankHolder, setWithdrawBankHolder] = useState<string>('');
  const [withdrawBankBranch, setWithdrawBankBranch] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawList, setWithdrawList] = useState<any[]>(() => {
    return [
      { id: 'W-9201', method: 'bKash', account: '01712345678', amount: 5000, status: 'Success', date: '2026-07-01' },
      { id: 'W-9142', method: 'Nagad', account: '01987654321', amount: 7500, status: 'Success', date: '2026-06-15' }
    ];
  });
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>('');

  // Saved Accounts state
  const [savedAccounts, setSavedAccounts] = useState<any[]>(() => {
    const saved = localStorage.getItem('bd_mart_saved_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: 'acc-1', type: 'bKash', label: 'বিকাশ (Personal)', number: '01712345678', details: 'Personal' },
      { id: 'acc-2', type: 'Nagad', label: 'নগদ (Personal)', number: '01987654321', details: 'Personal' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('bd_mart_saved_accounts', JSON.stringify(savedAccounts));
  }, [savedAccounts]);

  // Load saved accounts and shop settings from Firestore on mount
  useEffect(() => {
    async function loadDbSettingsAndAccounts() {
      try {
        const dbSettings = await getShopSettingsFromDb();
        setShopName(dbSettings.shopName);
        setSupportPhone(dbSettings.supportPhone);
        
        const dbAccounts = await getSavedAccountsFromDb();
        if (dbAccounts.length > 0) {
          setSavedAccounts(dbAccounts);
        }
      } catch (err) {
        console.error("Error loading settings/accounts from DB:", err);
      }
    }
    loadDbSettingsAndAccounts();
  }, []);

  // Form States for adding an account
  const [addAccType, setAddAccType] = useState<string>('bKash');
  const [addAccNumber, setAddAccNumber] = useState<string>('');
  const [addAccMfsType, setAddAccMfsType] = useState<string>('Personal');
  const [addAccBankName, setAddAccBankName] = useState<string>('');
  const [addAccHolderName, setAddAccHolderName] = useState<string>('');
  const [addAccBranch, setAddAccBranch] = useState<string>('');
  const [addAccRouting, setAddAccRouting] = useState<string>('');
  const [addAccSuccess, setAddAccSuccess] = useState<string>('');
  const [selectedSavedAccId, setSelectedSavedAccId] = useState<string>('manual');

  // Support Ticket State
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketDept, setTicketDept] = useState<string>('Delivery');
  const [ticketMsg, setTicketMsg] = useState<string>('');
  const [ticketList, setTicketList] = useState<any[]>([
    { id: 'TKT-104', subject: 'ডেলিভারি লেট হচ্ছে', dept: 'Delivery', status: 'Solved', date: '2026-07-05' },
    { id: 'TKT-108', subject: 'বিকাশ পেমেন্ট উইথড্র পেন্ডিং', dept: 'Payment', status: 'Pending', date: '2026-07-11' }
  ]);
  const [ticketSuccess, setTicketSuccess] = useState<boolean>(false);

  // Banner carousel current slide state
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const slides = [
    {
      title: "বিডি মার্ট ড্রপশিপিং",
      highlight: "ঘরে বসে কোন রকম পুঁজি বা ইনভেস্ট ছাড়াই",
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"
    },
    {
      title: "স্পেশাল উইন্টার কালেকশন",
      highlight: "১০০% ওরিজিনাল সুতার প্রিমিয়াম ওভেন পোশাক",
      img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200"
    },
    {
      title: "ইনস্ট্যান্ট উইথড্র সিস্টেম",
      highlight: "ডেলিভারি সফল হবার ২৪ ঘন্টায় সরাসরি বিকাশ বা রকেটে টাকা",
      img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1200"
    }
  ];

  // Auto carousel slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Sync profile details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('bd_mart_shop_name', shopName);
    localStorage.setItem('bd_mart_support_phone', supportPhone);
    saveShopSettingsToDb({ shopName, supportPhone }); // Sync with Firestore
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
  };

  // Handle Withdraw request
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawSuccess('অনুগ্রহ করে সঠিক পরিমাণ টাকা লিখুন।');
      return;
    }
    if (amt > availableBalance) {
      setWithdrawSuccess('আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই।');
      return;
    }

    let finalMethod = withdrawMethod;
    let finalAccount = withdrawAccount;

    if (selectedSavedAccId !== 'manual') {
      const matchedAcc = savedAccounts.find(x => x.id === selectedSavedAccId);
      if (matchedAcc) {
        finalMethod = matchedAcc.type;
        finalAccount = `${matchedAcc.label} - ${matchedAcc.number}`;
      }
    } else {
      if (withdrawMethod === 'Bank') {
        if (!withdrawBankName || !withdrawBankHolder || !withdrawAccount || !withdrawBankBranch) {
          setWithdrawSuccess('অনুগ্রহ করে ব্যাংকের সকল প্রয়োজনীয় তথ্য প্রদান করুন।');
          return;
        }
        finalAccount = `${withdrawBankName} (${withdrawBankBranch}), Holder: ${withdrawBankHolder}, A/C: ${withdrawAccount}`;
      }
    }

    if (!finalAccount) {
      setWithdrawSuccess('অনুগ্রহ করে একটি অ্যাকাউন্ট নম্বর দিন বা সিলেক্ট করুন।');
      return;
    }

    // Process withdrawal simulation
    setAvailableBalance(prev => prev - amt);
    setWithdrawnBalance(prev => prev + amt);
    const newRequest = {
      id: `W-${Math.floor(9000 + Math.random() * 999)}`,
      method: finalMethod,
      account: finalAccount,
      amount: amt,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setWithdrawList(prev => [newRequest, ...prev]);
    setWithdrawSuccess('আপনার টাকা উত্তোলনের আবেদনটি সফলভাবে গৃহীত হয়েছে। ২৪ ঘণ্টার মধ্যে আপনার একাউন্টে টাকা পৌঁছে যাবে।');
    setWithdrawAmount('');
    setWithdrawAccount('');
    setWithdrawBankName('');
    setWithdrawBankHolder('');
    setWithdrawBankBranch('');
  };

  // Handle Add Account
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newAcc: any = {
      id: `acc-${Date.now()}`,
      type: addAccType,
    };

    if (addAccType === 'Bank') {
      if (!addAccBankName || !addAccHolderName || !addAccNumber || !addAccBranch) {
        setAddAccSuccess('দয়া করে ব্যাংকের সকল প্রয়োজনীয় তথ্য পূরণ করুন।');
        return;
      }
      newAcc.label = `${addAccBankName} (${addAccBranch})`;
      newAcc.number = addAccNumber;
      newAcc.details = `Holder: ${addAccHolderName}${addAccRouting ? `, Routing: ${addAccRouting}` : ''}`;
    } else {
      if (!addAccNumber) {
        setAddAccSuccess('দয়া করে সঠিক মোবাইল নম্বর প্রদান করুন।');
        return;
      }
      const banglaType = addAccType === 'bKash' ? 'বিকাশ' : addAccType === 'Nagad' ? 'নগদ' : 'রকেট';
      newAcc.label = `${banglaType} (${addAccMfsType})`;
      newAcc.number = addAccNumber;
      newAcc.details = addAccMfsType;
    }

    setSavedAccounts(prev => [newAcc, ...prev]);
    saveSavedAccountToDb(newAcc); // Save to Firestore
    setAddAccSuccess('অ্যাকাউন্টটি সফলভাবে যুক্ত হয়েছে!');
    
    // Reset form
    setAddAccNumber('');
    setAddAccBankName('');
    setAddAccHolderName('');
    setAddAccBranch('');
    setAddAccRouting('');
    setTimeout(() => setAddAccSuccess(''), 4000);
  };

  // Handle support ticket creation
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;

    const newTicket = {
      id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
      subject: ticketSubject,
      dept: ticketDept,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    setTicketList(prev => [newTicket, ...prev]);
    setTicketSuccess(true);
    setTicketSubject('');
    setTicketMsg('');
    setTimeout(() => setTicketSuccess(false), 4000);
  };

  // Filter Categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Tab configurations matching the layout in Image 2
  const sidebarItems = [
    { id: 'home', label: 'হোম', icon: <Home className="w-4 h-4" /> },
    { id: 'profile', label: 'প্রোফাইল', icon: <User className="w-4 h-4" /> },
    { id: 'new-post', label: 'নতুন পোস্ট', icon: <PlusSquare className="w-4 h-4" /> },
    { id: 'all-products', label: 'সকল প্রোডাক্ট', icon: <Package className="w-4 h-4" /> },
    { id: 'product-videos', label: 'প্রোডাক্টের ভিডিও', icon: <Video className="w-4 h-4" /> },
    { id: 'favorite-products', label: 'ফেভারিট প্রোডাক্ট', icon: <Heart className="w-4 h-4" /> },
    { id: 'stockout-products', label: 'স্টকআউট প্রোডাক্ট', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'order-list', label: 'অর্ডার লিস্ট', icon: <FileText className="w-4 h-4" /> },
    { id: 'active-orders', label: 'অ্যাক্টিভ অর্ডার', icon: <Activity className="w-4 h-4" /> },
    { id: 'cart-list', label: 'কার্ট লিস্ট 0', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'sales-profit', label: 'সেলস ও প্রফিট', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'balance', label: 'ব্যালেন্স স্টেটমেন্ট', icon: <Landmark className="w-4 h-4" /> },
    { id: 'add-account', label: 'অ্যাড অ্যাকাউন্ট', icon: <PlusSquare className="w-4 h-4" /> },
    { id: 'withdraw', label: 'টাকা উত্তোলন', icon: <Wallet className="w-4 h-4" /> },
    { id: 'support', label: 'সাপোর্ট টিকিট', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  // Shortcuts Grid list from Image 2
  const shortcutsRow1 = [
    { label: 'সকল প্রোডাক্টস', tab: 'all-products', color: 'text-[#10b981] bg-[#e6f4ea]' },
    { label: 'নতুন প্রোডাক্টস', tab: 'all-products', color: 'text-[#f59e0b] bg-[#fdf2e9]' },
    { label: 'বুস্টিং প্রোডাক্টস', tab: 'product-videos', color: 'text-[#3b82f6] bg-[#eaf2ff]' },
    { label: 'সার্চ প্রোডাক্টস', tab: 'all-products', color: 'text-[#6b7280] bg-[#f3f4f6]' },
    { label: 'টপ সেলিং প্রোডাক্টস', tab: 'all-products', color: 'text-[#ef4444] bg-[#fef2f2]' },
    { label: 'কাস্টমাইজ প্রিন্ট', tab: 'support', color: 'text-[#8b5cf6] bg-[#f5f3ff]' },
    { label: 'সেলস গাইডলাইন', tab: 'faq', color: 'text-[#d97706] bg-[#fffbeb]' },
    { label: 'ল্যান্ডিং ভিডিও', tab: 'product-videos', color: 'text-[#06b6d4] bg-[#ecfeff]' }
  ];

  const shortcutsRow2 = [
    { label: 'ফ্রিল্যান্সিং মার্কেটপ্লেস', tab: 'faq', sub: 'ফ্রিল্যান্সিং রিসোর্স সমূহ' },
    { label: 'মোবাইল রিচার্জ', tab: 'balance', sub: 'সরাসরি ব্যালেন্স থেকে রিচার্জ' },
    { label: 'ই-কমার্স ওয়েবসাইট', tab: 'profile', sub: 'ফ্রি নিজস্ব অনলাইন ডোমেইন' },
    { label: 'প্যাসিভ ইনকাম', tab: 'sales-profit', sub: 'রেফারাল প্রফিট অ্যান্ড কমিশন' }
  ];

  const shortcutsRow3 = [
    { label: 'অর্ডার লিস্ট', tab: 'order-list', icon: <FileText className="w-5 h-5 text-amber-500" /> },
    { label: 'অ্যাক্টিভ অর্ডারস', tab: 'active-orders', icon: <Activity className="w-5 h-5 text-indigo-500" /> },
    { label: 'সেলস ড্যাশবোর্ড', tab: 'sales-profit', icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
    { label: 'ব্যালেন্স স্টেটমেন্ট', tab: 'balance', icon: <Landmark className="w-5 h-5 text-purple-500" /> },
    { label: 'সাধারণ জিজ্ঞাসা', tab: 'faq', icon: <HelpCircle className="w-5 h-5 text-blue-500" /> },
    { label: 'ইউটিউব চ্যানেল', tab: 'youtube', icon: <Tv className="w-5 h-5 text-red-500" /> },
    { label: 'টেলিগ্রাম সাপোর্ট গ্রুপ', tab: 'telegram', icon: <Send className="w-5 h-5 text-sky-500" /> },
    { label: 'সাপোর্ট সেন্টার', tab: 'support', icon: <MessageSquare className="w-5 h-5 text-rose-500" /> }
  ];

  return (
    <div id="customer-portal-root" className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      
      {/* 1. CUSTOM TOP NAVIGATION HEADER (Image 2 orange theme) */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          
          {/* Logo & Hamburg Menu */}
          <div className="flex items-center gap-3">
            <button 
              id="mobile-sidebar-toggle-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 hover:bg-orange-700/50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="bg-white text-orange-600 font-black px-2 py-1 rounded text-xs tracking-wider">
                বিডি মার্ট
              </span>
              <span className="text-sm font-extrabold tracking-wider font-display hidden sm:inline uppercase">
                BD MART PORTAL
              </span>
            </div>
          </div>

          {/* Center Title (Image 2 style) */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-black tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACTIVE RESELLER PANELS</span>
          </div>

          {/* Balance Button & Profile icon */}
          <div className="flex items-center gap-3">
            <button
              id="header-balance-view-btn"
              onClick={() => setShowBalancePopup(!showBalancePopup)}
              className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-350 text-orange-950 font-bold text-xs rounded-full shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5 text-orange-800" />
              <span>৳ {availableBalance.toLocaleString('bn-BD')} ব্যালেন্স দেখুন</span>
            </button>

            {/* Profile Avatar Quick Link */}
            <button
              id="header-profile-quick-link"
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center font-bold text-xs"
              title="এডিট প্রোফাইল"
            >
              {fullName[0]}
            </button>
          </div>

        </div>
      </header>

      {/* 2. DYNAMIC WORKSPACE BODY CONTAINER */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        
        {/* Left Sidebar Menu (Static Desktop - Matches Image 2) */}
        <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col justify-between flex-shrink-0">
          <div className="py-4 flex-1 overflow-y-auto">
            <div className="px-4 mb-4">
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200/60">
                <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">পেইজ নেম</p>
                <h5 className="text-xs font-bold text-brand-indigo truncate">{shopName}</h5>
                <p className="text-[10px] text-neutral-500 truncate mt-0.5">📞 {supportPhone}</p>
              </div>
            </div>
            
            <nav className="space-y-0.5 px-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-neutral-100">
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="w-full py-2 bg-neutral-50 hover:bg-red-50 text-neutral-500 hover:text-red-600 border border-neutral-200 hover:border-red-100 rounded-lg text-xs font-bold uppercase transition-all"
            >
              লগআউট সেশন
            </button>
          </div>
        </aside>

        {/* Left Sidebar Drawer Menu (Mobile Navigation) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backing Shade backdrop */}
              <div 
                className="fixed inset-0 bg-black/45 z-50 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {/* Slider drawer panel */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="fixed inset-y-0 left-0 w-64 bg-white z-50 md:hidden flex flex-col justify-between"
              >
                <div className="py-4 flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 pb-4 border-b border-neutral-100 mb-4">
                    <span className="text-sm font-black text-orange-600">মেনুবার ড্যাশবোর্ড</span>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1 hover:bg-neutral-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="px-4 mb-4">
                    <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                      <p className="text-[10px] uppercase font-bold text-neutral-400">পেইজ নেম</p>
                      <h5 className="text-xs font-bold text-brand-indigo truncate">{shopName}</h5>
                    </div>
                  </div>

                  <nav className="space-y-0.5 px-2">
                    {sidebarItems.map((item) => (
                      <button
                        key={item.id}
                        id={`mob-sidebar-tab-${item.id}`}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                          activeTab === item.id
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-4 border-t border-neutral-100">
                  <button
                    onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full py-2 bg-neutral-50 hover:bg-red-50 text-neutral-500 hover:text-red-600 border border-neutral-200 hover:border-red-100 rounded-lg text-xs font-bold uppercase transition-all"
                  >
                    লগআউট সেশন
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Right Dynamic Stage Panel */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden space-y-6">

          {/* Quick Balance Popover Modal */}
          {showBalancePopup && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-md space-y-3 animate-fade-in relative">
              <button 
                onClick={() => setShowBalancePopup(false)}
                className="absolute top-3 right-3 text-amber-800 hover:text-amber-950 p-1"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm font-display">
                <Wallet className="w-5 h-5 text-orange-600" />
                <span>আপনার আর্থিক ফান্ড সামারি</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white p-2.5 rounded border border-amber-200/50">
                  <span className="text-[10px] text-neutral-400 block font-bold">ব্যালেন্স</span>
                  <span className="text-xs font-extrabold text-orange-600">৳{availableBalance}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-amber-200/50">
                  <span className="text-[10px] text-neutral-400 block font-bold">পেন্ডিং</span>
                  <span className="text-xs font-extrabold text-neutral-500">৳{pendingBalance}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-amber-200/50">
                  <span className="text-[10px] text-neutral-400 block font-bold">উত্তোলন</span>
                  <span className="text-xs font-extrabold text-emerald-600">৳{withdrawnBalance}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => { setShowBalancePopup(false); setActiveTab('withdraw'); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] px-3 py-1.5 rounded uppercase"
                >
                  ৳ টাকা উত্তোলন করুন
                </button>
              </div>
            </div>
          )}

          {/* Tab 1: HOME PANEL (The primary replica of uploaded image dashboard) */}
          {activeTab === 'home' && (
            <div id="portal-tab-home" className="space-y-6">
              
              {/* 1. Carousel Slider Banner */}
              <div className="relative w-full aspect-[2.6/1] md:aspect-[3.6/1] rounded-xl overflow-hidden shadow-sm border border-neutral-200 group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.8 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={slides[currentSlide].img}
                      alt={slides[currentSlide].title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-950/80 via-orange-900/40 to-transparent" />
                    
                    {/* Caption Overlay */}
                    <div className="absolute inset-y-0 left-6 md:left-12 flex flex-col justify-center max-w-lg space-y-2 text-white">
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-yellow-400 bg-orange-700/60 px-2.5 py-1 rounded w-fit">
                        {slides[currentSlide].title}
                      </span>
                      <h2 className="text-lg md:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
                        {slides[currentSlide].highlight}
                      </h2>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Dot markers */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentSlide === idx ? 'bg-orange-500 w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Welcome Announcement Bar ("স্বাগতম।" - Image 2) */}
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/60 rounded-lg p-3.5 text-emerald-800 text-xs font-bold leading-relaxed shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>স্বাগতম! বিডি মার্ট ড্রপশিপিং অ্যান্ড রিটেইল ড্যাশবোর্ডে আপনাকে স্বাগতম।</span>
                </div>
                <Bell className="w-4 h-4 text-emerald-500 animate-bounce" />
              </div>

              {/* 3. Urgent Notice Alert Box ("🚨 জরুরী নোটিশ 🚨" - Image 2) */}
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
                  <span className="text-base">🚨</span>
                  <span>জরুরী নোটিশ</span>
                  <span className="text-base">🚨</span>
                </div>
                <p className="text-xs text-rose-700 font-sans leading-relaxed">
                  আপনাদের পেইজের নামে ইনভয়েস প্রিন্ট করে পার্সেল পাঠানো হচ্ছে। বিস্তারিত আমাদের টেলিগ্রাম চ্যানেলে দেওয়া হয়েছে। প্রোফাইল মেনু থেকে আপনার পেইজের নাম এবং কাস্টমার সাপোর্ট নাম্বারটি সঠিকভাবে সেট করে নিন।
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-md uppercase transition-all shadow-xs"
                  >
                    👤 এডিট প্রোফাইল করুন
                  </button>
                </div>
              </div>

              {/* 5. Shortcuts Row 1: Grid of colorful custom shortcut buttons */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  কুইক মেনু শর্টকাট
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {shortcutsRow1.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (item.label === 'নতুন প্রোডাক্টস') {
                          setSelectedCategory('All');
                          setSearchQuery('');
                        }
                        setActiveTab(item.tab);
                      }}
                      className={`${item.color} border border-neutral-200/50 hover:border-neutral-350 hover:scale-101 p-3.5 rounded-lg text-center flex flex-col items-center justify-center space-y-1.5 transition-all shadow-2xs h-20`}
                    >
                      <Package className="w-4 h-4 opacity-80" />
                      <span className="text-[10px] font-extrabold truncate w-full">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Shortcuts Row 2: Secondary informational shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {shortcutsRow2.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(item.tab)}
                    className="bg-white border border-neutral-200 hover:border-indigo-200 rounded-lg p-4 flex items-center justify-between shadow-3xs cursor-pointer group hover:bg-indigo-50/10 transition-all"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-neutral-800 truncate group-hover:text-indigo-600 transition-colors">
                        {item.label}
                      </h4>
                      <p className="text-[10px] text-neutral-500 truncate">{item.sub}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-neutral-50 group-hover:bg-indigo-100 flex items-center justify-center text-neutral-400 group-hover:text-indigo-600 transition-all">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* 7. Shortcuts Row 3: Standard bottom layout panel */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  লজিস্টিকস ও সাপোর্ট সেন্ট্রাল
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {shortcutsRow3.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(item.tab)}
                      className="bg-white border border-neutral-150 hover:border-neutral-300 hover:scale-101 p-4 rounded-lg flex flex-col items-center justify-center text-center space-y-2 transition-all shadow-3xs h-24"
                    >
                      <div className="p-1.5 bg-neutral-50 rounded-full">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-700 tracking-tight leading-snug">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: PROFILE PANEL */}
          {activeTab === 'profile' && (
            <div id="portal-tab-profile" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-xl mx-auto">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">রিসেলার প্রোফাইল সেটিংস</h3>
                <p className="text-xs text-neutral-500">আপনার কাস্টমার ইনভয়েসিং এবং পেমেন্ট উইথড্র অ্যাকাউন্ট কনফিগার করুন</p>
              </div>

              {isProfileSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>প্রোফাইল সেটিংস সফলভাবে আপডেট করা হয়েছে!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">উদ্যোক্তার নাম (Full Name)</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all font-sans"
                    required
                  />
                </div>

                <div className="space-y-1 bg-amber-50/50 p-4 rounded-lg border border-amber-200/40">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                    🔗 আপনার ফেসবুক পেইজ / শপের নাম (Shop/Page Name) *
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Mimi's Clothing"
                    className="w-full bg-white border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500 transition-all font-sans"
                    required
                  />
                  <p className="text-[10px] text-amber-700/80 mt-1.5 leading-normal">
                    * এই নামটি আপনার কাস্টমারদের পার্সেলের গায়ে প্রিন্টেড ইনভয়েসে প্রেরক হিসেবে প্রদর্শিত হবে।
                  </p>
                </div>

                <div className="space-y-1 bg-amber-50/50 p-4 rounded-lg border border-amber-200/40">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                    📞 কাস্টমার সাপোর্ট নাম্বার (Support Phone Number) *
                  </label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full bg-white border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500 transition-all font-sans"
                    required
                  />
                  <p className="text-[10px] text-amber-700/80 mt-1.5 leading-normal">
                    * পার্সেল ডেলিভারির সময় কোনো সমস্যা হলে কুরিয়ার বা কাস্টমার এই নাম্বারে যোগাযোগ করবে।
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">ইমেইল এড্রেস</label>
                  <input
                    type="email"
                    value={auth.email}
                    className="w-full bg-neutral-100 border border-neutral-200 text-neutral-400 rounded-lg px-3.5 py-2.5 text-xs font-sans"
                    disabled
                  />
                </div>

                <div className="pt-4 border-t border-neutral-100">
                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-xs active:scale-99"
                  >
                    সেটিংস সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: NEW POST (Marketing caption templates helper) */}
          {activeTab === 'new-post' && (
            <div id="portal-tab-newpost" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-2xl mx-auto">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">ফেসবুক মার্কেটিং পোস্ট মেকার</h3>
                <p className="text-xs text-neutral-500">আপনার শপের জন্য হাই-কনভার্সন প্রমোশনাল টেক্সট কপি করুন</p>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                  নিচের ট্রেন্ডি প্রোডাক্টের বিবরণ থেকে কাস্টম কন্টেন্ট সিলেক্ট করে কপি করুন এবং আপনার পেজে ছবিসহ পোস্ট দিয়ে অর্ডার সংগ্রহ করুন।
                </p>

                {products.slice(0, 3).map((p) => (
                  <div key={p.id} className="border border-neutral-200 rounded-lg p-4 space-y-3 bg-neutral-50">
                    <div className="flex gap-3 items-center">
                      <img src={p.image || ''} alt="" className="w-10 h-12 object-cover rounded border border-neutral-200 flex-shrink-0" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="text-xs font-bold text-brand-indigo">{p.name}</h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-bold">{p.category}</span>
                      </div>
                    </div>

                    <div className="bg-white border border-neutral-200/80 rounded p-3 text-xs text-neutral-700 font-sans space-y-2 whitespace-pre-line leading-relaxed">
                      {`🍁 প্রিমিয়াম কালেকশন: ${p.name} 🍁

আপনার ব্যক্তিত্বের সাথে মানানসই ও চমৎকার আরামদায়ক ফিটিং নিয়ে হাজির বিডি মার্ট কালেকশন। ঢাকা ওভেনের তৈরি ১০০% কোয়ালিটি সুতায় বোনা এই ক্লাসিক পোশাকটি শীত ও শরৎকালের অন্যতম ট্রেন্ড। 

✅ ১০০% পিওর সুতা এবং মসৃণ ফিনিশিং।
✅ ওভেন বুটিক ডিজাইনের আকর্ষণীয় কালার কম্বিনেশন।
✅ ধোয়ার পরেও কালার গ্যারান্টি।
✅ সাইজ: S, M, L, XL, XXL

🚚 সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা (প্রোডাক্ট দেখে পেমেন্ট করার সুযোগ)।

অর্ডার করতে আজই আমাদের ইনবক্সে মেসেজ করুন অথবা কল করুন আপনার ঠিকানাসহ।`}
                    </div>

                      <div className="flex justify-end items-center gap-2">
                        {copiedPostId === p.id && (
                          <span className="text-[10px] font-bold text-emerald-600">✓ টেক্সট কপি হয়েছে!</span>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`🍁 প্রিমিয়াম কালেকশন: ${p.name} 🍁\n\n✅ ১০০% পিওর সুতা এবং মসৃণ ফিনিশিং...\n🚚 সারাদেশে ক্যাশ অন ডেলিভারি...`);
                            setCopiedPostId(p.id);
                            setTimeout(() => setCopiedPostId(null), 2500);
                          }}
                          className={`px-3.5 py-1.5 font-bold text-[10px] rounded transition-all ${
                            copiedPostId === p.id 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-brand-indigo hover:bg-neutral-900 text-white'
                          }`}
                        >
                          {copiedPostId === p.id ? 'কপি সম্পন্ন!' : 'কপি করুন'}
                        </button>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: ALL PRODUCTS PANEL */}
          {activeTab === 'all-products' && (
            <div id="portal-tab-products" className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-brand-indigo font-display uppercase">আমাদের সমস্ত ক্যাটালগ</h3>
                  <p className="text-xs text-neutral-500">পছন্দের পোশাকটি সিলেক্ট করে তার সাইজ, বিবরণ দেখে অর্ডার প্লেস করুন</p>
                </div>

                <div className="w-full md:max-w-xs relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="পোশাকের নাম দিয়ে খুঁজুন..."
                    className="w-full bg-white border border-neutral-250 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand-indigo transition-all font-sans"
                  />
                </div>
              </div>

              {/* Fast Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      selectedCategory === cat
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-350'
                    }`}
                  >
                    {cat === 'All' ? 'সব পোশাক' : cat}
                  </button>
                ))}
              </div>

              {/* Products Display Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products
                  .filter(p => {
                    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
                    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  })
                  .map((p) => {
                    const isLiked = wishlist.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className="group bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        
                        {/* Cover Image Frame */}
                        <div className="aspect-[3/4] overflow-hidden bg-neutral-100 relative border-b border-neutral-100">
                          <img
                            src={p.image || ''}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Wishlist button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist(p.id);
                            }}
                            className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-full text-neutral-400 hover:text-rose-500 hover:scale-105 transition-all"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>

                          {/* Out of stock banner */}
                          {!p.inStock && (
                            <div className="absolute inset-0 bg-white/75 backdrop-blur-[1.5px] flex items-center justify-center">
                              <span className="bg-neutral-850 text-white font-display text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                                STOCK OUT
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Text and Actions */}
                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                              {p.category}
                            </span>
                            <h4 className="text-xs font-bold text-brand-indigo line-clamp-1">
                              {p.name}
                            </h4>
                            
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs font-black text-brand-indigo font-sans">
                                ৳{p.price.toLocaleString()}
                              </span>
                              {p.originalPrice && (
                                <span className="text-[10px] line-through text-neutral-400 font-sans">
                                  ৳{p.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-neutral-100">
                            <button
                              onClick={() => onSelectProduct(p)}
                              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1 shadow-2xs"
                            >
                              পণ্যটি দেখুন
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* Tab 5: PRODUCT VIDEOS (Image 2 - ল্যান্ডিং ভিডিও / প্রোডাক্টের ভিডিও) */}
          {activeTab === 'product-videos' && (
            <div id="portal-tab-videos" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-2xl mx-auto">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">প্রোডাক্ট প্রমোশনাল ভিডিও</h3>
                <p className="text-xs text-neutral-500">আপনার ফেসবুক পেজে বিজ্ঞাপন দেয়ার জন্য মডেল শুট ভিডিও সমূহ ডাউনলোড করুন</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: 'উইন্টার ওভেন লং ট্রেন্স কোট ভিডিও শুট', views: '১২,৪৫০', duration: '০:৪৫', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600' },
                  { title: 'কটন ক্লাসিকাল টি-শার্ট কালেকশন রিভ রিভিউ', views: '৮,২০০', duration: '১:১২', img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=600' },
                  { title: 'শরতের স্পেশাল ফ্লোরাল কামিজ ড্রেস টিজার', views: '১৫,৯০০', duration: '০:৩০', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600' },
                  { title: 'বাল্ক কুশন এন্ড বুটিক প্রিন্ট ডেমো শো', views: '৫,৬০০', duration: '১:৪০', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600' }
                ].map((vid, idx) => (
                  <div key={idx} className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 shadow-3xs group cursor-pointer">
                    <div className="aspect-video relative overflow-hidden bg-neutral-900">
                      <img src={vid.img} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-103 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-white font-bold">{vid.duration}</span>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <h4 className="text-xs font-bold text-brand-indigo group-hover:underline">{vid.title}</h4>
                      <p className="text-[10px] text-neutral-400">👀 {vid.views} জন উদ্যোক্তা ব্যবহার করেছেন</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 6: FAVORITE PRODUCTS */}
          {activeTab === 'favorite-products' && (
            <div id="portal-tab-favorites" className="space-y-6">
              <div className="border-b border-neutral-200 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">আপনার ফেভারিট পোশাকসমূহ</h3>
                <p className="text-xs text-neutral-500">আপনার লাইক দিয়ে রাখা প্রিয় পোশাকসমূহ যা কাস্টমার পছন্দ করতে পারে</p>
              </div>

              {wishlist.length === 0 ? (
                <div className="bg-white border border-neutral-150 rounded-lg p-12 text-center text-neutral-400 text-xs font-sans space-y-3">
                  <Heart className="w-12 h-12 text-neutral-300 mx-auto" />
                  <p>আপনার প্রিয় তালিকায় এখনো কোনো পোশাক যোগ করা হয়নি।</p>
                  <button onClick={() => setActiveTab('all-products')} className="px-4 py-2 bg-brand-indigo text-white font-bold rounded-lg uppercase text-[10px]">সকল পোশাক দেখুন</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {products
                    .filter(p => wishlist.includes(p.id))
                    .map((p) => (
                      <div key={p.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs flex flex-col justify-between">
                        <div className="aspect-[3/4] overflow-hidden bg-neutral-100 relative">
                          <img src={p.image || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            onClick={() => onToggleWishlist(p.id)}
                            className="absolute top-2.5 right-2.5 bg-white p-1.5 rounded-full text-rose-500"
                          >
                            <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          </button>
                        </div>
                        <div className="p-4 space-y-3">
                          <h4 className="text-xs font-bold text-brand-indigo truncate">{p.name}</h4>
                          <button onClick={() => onSelectProduct(p)} className="w-full py-1.5 bg-neutral-50 hover:bg-brand-indigo hover:text-white border border-neutral-200 text-[10px] font-bold rounded">পণ্যটি দেখুন</button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 7: STOCKOUT PRODUCTS */}
          {activeTab === 'stockout-products' && (
            <div id="portal-tab-stockouts" className="space-y-6">
              <div className="border-b border-neutral-200 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">স্টকআউট / লিমিটেড স্টক প্রোডাক্টস</h3>
                <p className="text-xs text-neutral-500">যেসব পোশাক খুব শীঘ্রই পুনরায় স্টকে যোগ করা হবে এবং যেগুলোর স্টক প্রায় শেষ</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products
                  .filter(p => !p.inStock || p.stockCount < 10)
                  .map((p) => (
                    <div key={p.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs opacity-85">
                      <div className="aspect-[3/4] overflow-hidden bg-neutral-100 relative">
                        <img src={p.image || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm">
                          {p.stockCount === 0 ? 'STOCK OUT' : `${p.stockCount} ITEMS LEFT`}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-xs font-bold text-brand-indigo truncate">{p.name}</h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase">{p.category}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tab 8: ORDER LIST PANEL */}
          {activeTab === 'order-list' && (
            <div id="portal-tab-orders" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">আপনার অর্ডারসমূহ</h3>
                <p className="text-xs text-neutral-500">কাস্টমারদের অর্ডার স্ট্যাটাস এবং লাইভ ট্র্যাকিং তথ্য চেক করুন</p>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-xs font-sans">
                  আপনি এখনো কোনো অর্ডার করেননি।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 text-[10px] text-neutral-400 font-bold uppercase tracking-wider bg-neutral-50">
                        <th className="py-3 px-4">আইডি</th>
                        <th className="py-3 px-4">কাস্টমার তথ্য</th>
                        <th className="py-3 px-4">পোশাক আইটেম</th>
                        <th className="py-3 px-4">মোট প্রাইস</th>
                        <th className="py-3 px-4">স্ট্যাটাস</th>
                        <th className="py-3 px-4">তারিখ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-neutral-50/50">
                          <td className="py-4 px-4 font-bold text-brand-indigo font-mono">{o.id}</td>
                          <td className="py-4 px-4">
                            <div className="font-semibold">{o.customerName}</div>
                            <div className="text-[10px] text-neutral-400">{o.customerPhone}</div>
                            <div className="text-[10px] text-neutral-400 truncate max-w-[150px]">{o.customerAddress}</div>
                          </td>
                          <td className="py-4 px-4">
                            {o.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="font-semibold text-brand-indigo truncate max-w-[120px]">{item.product.name}</span>
                                <span className="text-[10px] text-neutral-400 font-bold font-mono">x{item.quantity}</span>
                              </div>
                            ))}
                          </td>
                          <td className="py-4 px-4 font-bold font-mono">৳{o.totalPrice.toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              o.status === 'Shipped' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {o.status === 'Delivered' ? 'ডেলিভারড' :
                               o.status === 'Shipped' ? 'শিপড' : 'পেন্ডিং'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-[10px] text-neutral-400 font-mono">{o.createdAt.split('T')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 9: ACTIVE ORDERS */}
          {activeTab === 'active-orders' && (
            <div id="portal-tab-active-orders" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">অ্যাক্টিভ ডেলিভারি ট্র্যাকিং</h3>
                <p className="text-xs text-neutral-500">বর্তমানে ট্রানজিট বা প্রসেসিংয়ে থাকা কাস্টমার পার্সেলসমূহ</p>
              </div>

              {orders.filter(o => o.status !== 'Delivered').length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-xs font-sans">
                  বর্তমানে কোনো অ্যাক্টিভ পার্সেল ডেলিভারি ট্র্যাকে নেই।
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.filter(o => o.status !== 'Delivered').map((o) => (
                    <div key={o.id} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono">{o.id}</span>
                        <h4 className="text-xs font-bold text-brand-indigo pt-1">গ্রাহক: {o.customerName}</h4>
                        <p className="text-[10px] text-neutral-400">ঠিকানা: {o.customerAddress}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] text-neutral-400 font-bold uppercase">কুরিয়ার স্ট্যাটাস</p>
                          <span className="text-xs font-black text-orange-600">
                            {o.courierStatus || (o.status === 'Shipped' ? 'কুরিয়ারে হস্তান্তর করা হয়েছে' : 'প্যাকিং ও সোর্সিং চলছে')}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setTrackingNotice(`অর্ডার #${o.id} বর্তমানে লজিস্টিক সেন্টারে ট্র্যাকিং হচ্ছে। কুরিয়ার স্ট্যাটাস: ${o.courierStatus || o.status}`);
                            setTimeout(() => setTrackingNotice(null), 4000);
                          }}
                          className="px-3 py-1.5 bg-white border border-neutral-250 rounded text-[10px] font-bold text-neutral-700 hover:bg-neutral-50 transition-all"
                        >
                          লাইভ ট্র্যাক
                        </button>
                      </div>
                      {trackingNotice && trackingNotice.includes(o.id) && (
                        <div className="mt-2 p-2 bg-indigo-50 border border-indigo-100 rounded text-[11px] font-medium text-indigo-800">
                          ℹ️ {trackingNotice}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 10: CART LIST */}
          {activeTab === 'cart-list' && (
            <div id="portal-tab-cart" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-xl mx-auto">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">আপনার কার্ট বা বাকেট</h3>
                <p className="text-xs text-neutral-500">একসাথে একাধিক কাস্টমার বাল্ক বুকিং করার সহজ পদ্ধতি</p>
              </div>

              <div className="py-12 text-center text-neutral-400 text-xs font-sans space-y-3">
                <ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto" />
                <p>আপনার বাল্ক বাকেটে এই মুহূর্তে কোনো প্রোডাক্ট নেই।</p>
                <button onClick={() => setActiveTab('all-products')} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg uppercase text-[10px] transition-all">পোশাক পছন্দ করুন</button>
              </div>
            </div>
          )}

          {/* Tab 11: SALES & PROFIT */}
          {activeTab === 'sales-profit' && (
            <div id="portal-tab-sales" className="space-y-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
                <div className="border-b border-neutral-100 pb-4 space-y-1">
                  <h3 className="text-lg font-black text-brand-indigo font-display uppercase">রিসেলিং লভ্যাংশ ও প্রফিট রিপোর্ট</h3>
                  <p className="text-xs text-neutral-500">আপনার শপের মাধ্যমে অর্জিত মোট আয়ের পরিসংখ্যান</p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 text-center space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">মোট রেভিনিউ</span>
                    <span className="text-2xl font-black text-orange-600 font-sans">৳৫৪,৮৯০</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">উত্তোলনযোগ্য লভ্যাংশ</span>
                    <span className="text-2xl font-black text-emerald-600 font-sans">৳{availableBalance}</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 text-center space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">পেন্ডিং প্রফিট মার্জিন</span>
                    <span className="text-2xl font-black text-purple-600 font-sans">৳{pendingBalance}</span>
                  </div>
                </div>

                {/* Sales Chart simulation */}
                <div className="border border-neutral-150 rounded-lg p-5 space-y-4">
                  <h4 className="text-xs font-bold text-brand-indigo uppercase tracking-wider">গত ৭ দিনের বিক্রয় চার্ট</h4>
                  <div className="h-44 flex items-end justify-between gap-2 pt-4 border-b border-neutral-200">
                    {[
                      { day: 'শনিবার', val: 70 },
                      { day: 'রবিবার', val: 40 },
                      { day: 'সোমবার', val: 90 },
                      { day: 'মঙ্গলবার', val: 50 },
                      { day: 'বুধবার', val: 120 },
                      { day: 'বৃহস্পতিবার', val: 80 },
                      { day: 'শুক্রবার', val: 150 },
                    ].map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-t" style={{ height: `${(d.val / 160) * 120}px` }} />
                        <span className="text-[9px] text-neutral-400 font-bold whitespace-nowrap overflow-hidden">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 12: BALANCE STATEMENT */}
          {activeTab === 'balance' && (
            <div id="portal-tab-statement" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">আর্থিক ব্যালেন্স স্টেটমেন্ট</h3>
                <p className="text-xs text-neutral-500">আপনার ওয়ালেটে লভ্যাংশ ক্রেডিট এবং টাকা উত্তোলনের হিসাব খতিয়ান</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-neutral-50 border rounded-lg p-4 text-center">
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">মোট ক্রেডিট লভ্যাংশ</span>
                  <span className="text-lg font-black text-brand-indigo font-sans">৳১৮,৭৫০.০০</span>
                </div>
                <div className="bg-neutral-50 border rounded-lg p-4 text-center">
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">মোট ডেবিট (উত্তোলিত)</span>
                  <span className="text-lg font-black text-emerald-600 font-sans">৳১২,৫০০.০০</span>
                </div>
                <div className="bg-neutral-50 border rounded-lg p-4 text-center col-span-2 lg:col-span-1">
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">বর্তমান ব্যালেন্স</span>
                  <span className="text-lg font-black text-orange-600 font-sans">৳{availableBalance}.০০</span>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-brand-indigo uppercase tracking-wider">সাম্প্রতিক লেনদেনসমূহ</h4>
                <div className="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-150">
                  {transactions.map((tx, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-neutral-50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="font-bold text-neutral-800">{tx.desc}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{tx.date}</div>
                      </div>
                      <span className={`font-black font-sans ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {tx.type === 'Credit' ? `+ ৳${tx.amt}` : `- ৳${tx.amt}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 13: ADD ACCOUNT */}
          {activeTab === 'add-account' && (
            <div id="portal-tab-addaccount" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-xl mx-auto animate-fade-in">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">টাকা উত্তোলনের অ্যাকাউন্ট যোগ করুন</h3>
                <p className="text-xs text-neutral-500">আপনার বিকাশ, নগদ, রকেট মোবাইল ওয়ালেট অথবা ব্যাংক অ্যাকাউন্ট যুক্ত করুন</p>
              </div>

              {addAccSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 animate-bounce" />
                  <span>{addAccSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddAccountSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">অ্যাকাউন্টের ধরন (Type)</label>
                  <select
                    value={addAccType}
                    onChange={(e) => setAddAccType(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-sans font-semibold"
                  >
                    <option value="bKash">বিকাশ (bKash)</option>
                    <option value="Nagad">নগদ (Nagad)</option>
                    <option value="Rocket">রকেট (Rocket)</option>
                    <option value="Bank">ব্যাংক অ্যাকাউন্ট (Bank Account)</option>
                  </select>
                </div>

                {addAccType === 'Bank' ? (
                  /* Bank Fields */
                  <div className="space-y-4 border-l-4 border-orange-500 pl-4 bg-orange-50/20 p-3 rounded-r-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">ব্যাংকের নাম *</label>
                        <input
                          type="text"
                          value={addAccBankName}
                          onChange={(e) => setAddAccBankName(e.target.value)}
                          placeholder="যেমন: Islami Bank Bangladesh Ltd"
                          className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo transition-all font-semibold"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">শাখার নাম (Branch) *</label>
                        <input
                          type="text"
                          value={addAccBranch}
                          onChange={(e) => setAddAccBranch(e.target.value)}
                          placeholder="যেমন: Motijheel Branch"
                          className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo transition-all font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">হিসাবধারীর নাম (Account Holder Name) *</label>
                      <input
                        type="text"
                        value={addAccHolderName}
                        onChange={(e) => setAddAccHolderName(e.target.value)}
                        placeholder="যেমন: MD. JANNATUL MAWA"
                        className="w-full bg-white border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-semibold uppercase"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">ব্যাংক অ্যাকাউন্ট নম্বর *</label>
                        <input
                          type="text"
                          value={addAccNumber}
                          onChange={(e) => setAddAccNumber(e.target.value)}
                          placeholder="যেমন: 2050123456789"
                          className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo transition-all font-mono font-bold"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">রাউটিং নম্বর (Routing No)</label>
                        <input
                          type="text"
                          value={addAccRouting}
                          onChange={(e) => setAddAccRouting(e.target.value)}
                          placeholder="যেমন: 125271485"
                          className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MFS Mobile Fields */
                  <div className="space-y-4 border-l-4 border-indigo-500 pl-4 bg-indigo-50/20 p-3 rounded-r-lg">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">মোবাইল ওয়ালেট নম্বর *</label>
                      <input
                        type="tel"
                        value={addAccNumber}
                        onChange={(e) => setAddAccNumber(e.target.value)}
                        placeholder="০১৭xxxxxxxx"
                        className="w-full bg-white border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-mono font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">অ্যাকাউন্টের ধরন</label>
                      <div className="flex gap-4 pt-1">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 cursor-pointer">
                          <input
                            type="radio"
                            name="accTypeMfs"
                            checked={addAccMfsType === 'Personal'}
                            onChange={() => setAddAccMfsType('Personal')}
                          /> ব্যক্তিগত (Personal)
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 cursor-pointer">
                          <input
                            type="radio"
                            name="accTypeMfs"
                            checked={addAccMfsType === 'Agent'}
                            onChange={() => setAddAccMfsType('Agent')}
                          /> এজেন্ট (Agent)
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-indigo hover:bg-neutral-900 text-white font-bold text-xs uppercase rounded-lg transition-all shadow-md active:scale-98"
                >
                  নতুন অ্যাকাউন্ট যোগ করুন
                </button>
              </form>

              {/* Saved Accounts List */}
              <div className="space-y-3 pt-6 border-t border-neutral-100">
                <h4 className="text-xs font-black text-brand-indigo uppercase tracking-wider">যুক্ত অ্যাকাউন্টসমূহ ({savedAccounts.length})</h4>
                
                {savedAccounts.length === 0 ? (
                  <div className="p-4 border border-dashed border-neutral-200 text-center text-xs text-neutral-400 rounded-lg font-semibold">
                    কোন অ্যাকাউন্ট এখনো যুক্ত করা হয়নি।
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {savedAccounts.map((acc) => (
                      <div key={acc.id} className="flex items-center justify-between p-3.5 border border-neutral-150 rounded-lg hover:bg-neutral-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg text-white font-bold text-xs ${
                            acc.type === 'bKash' ? 'bg-[#e2136e]' :
                            acc.type === 'Nagad' ? 'bg-[#f04a23]' :
                            acc.type === 'Rocket' ? 'bg-[#8c3494]' :
                            'bg-[#0a305e]'
                          }`}>
                            {acc.type === 'Bank' ? '🏦' : '📱'}
                          </div>
                          <div>
                            <span className="text-xs font-black text-neutral-800 block">{acc.label}</span>
                            <span className="text-xs font-mono font-bold text-neutral-500">{acc.number}</span>
                            {acc.details && <span className="text-[10px] text-neutral-400 block font-semibold">{acc.details}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('আপনি কি নিশ্চিত যে আপনি এই অ্যাকাউন্টটি মুছে ফেলতে চান?')) {
                              setSavedAccounts(prev => prev.filter(x => x.id !== acc.id));
                              deleteSavedAccountFromDb(acc.id); // Delete from Firestore
                            }
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold uppercase tracking-wider border border-rose-200/50 hover:border-rose-300 bg-rose-50/30 hover:bg-rose-50 px-2 py-1 rounded transition-all"
                        >
                          মুছুন (Delete)
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 14: WITHDRAW MONEY */}
          {activeTab === 'withdraw' && (
            <div id="portal-tab-withdraw" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-xl mx-auto animate-fade-in">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">টাকা উত্তোলন (Withdrawal)</h3>
                <p className="text-xs text-neutral-500">আপনার জমা হওয়া ওয়ালেট প্রফিট সরাসরি বিকাশ, নগদ, রকেট বা ব্যাংক অ্যাকাউন্টে ট্রান্সফার করুন</p>
              </div>

              {/* Balance Widget */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex justify-between items-center text-center">
                <div className="flex-1">
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">বর্তমান ব্যালেন্স</span>
                  <span className="text-xl font-black text-orange-600 font-sans">৳{availableBalance}</span>
                </div>
                <div className="w-px h-10 bg-neutral-200" />
                <div className="flex-1">
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">মোট উত্তোলিত</span>
                  <span className="text-xl font-black text-emerald-600 font-sans">৳{withdrawnBalance}</span>
                </div>
              </div>

              {withdrawSuccess && (
                <div className="p-3 bg-orange-50 border border-orange-200 text-orange-850 text-xs font-bold rounded-lg leading-relaxed">
                  {withdrawSuccess}
                </div>
              )}

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {/* Account selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">উত্তোলনের অ্যাকাউন্ট সিলেক্ট করুন</label>
                  <select
                    value={selectedSavedAccId}
                    onChange={(e) => {
                      setSelectedSavedAccId(e.target.value);
                      if (e.target.value === 'manual') {
                        setWithdrawMethod('bKash');
                      } else {
                        const matched = savedAccounts.find(x => x.id === e.target.value);
                        if (matched) setWithdrawMethod(matched.type);
                      }
                    }}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-sans font-bold text-neutral-800"
                  >
                    {savedAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        [যুক্ত করা] {acc.label} - {acc.number}
                      </option>
                    ))}
                    <option value="manual">নতুন / ম্যানুয়ালি একাউন্ট নম্বর দিন (Enter Manually)</option>
                  </select>
                </div>

                {selectedSavedAccId === 'manual' ? (
                  /* Manual Fields */
                  <div className="space-y-4 border border-neutral-200/60 p-4 rounded-xl bg-neutral-50/50">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">ম্যানুয়াল উত্তোলনের মাধ্যম</label>
                      <select
                        value={withdrawMethod}
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        className="w-full bg-white border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-sans font-bold"
                      >
                        <option value="bKash">বিকাশ (bKash)</option>
                        <option value="Nagad">নগদ (Nagad)</option>
                        <option value="Rocket">রকেট (Rocket)</option>
                        <option value="Bank">ব্যাংক একাউন্ট (Bank Account)</option>
                      </select>
                    </div>

                    {withdrawMethod === 'Bank' ? (
                      /* Manual Bank Inputs */
                      <div className="space-y-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">ব্যাংকের নাম *</label>
                          <input
                            type="text"
                            value={withdrawBankName}
                            onChange={(e) => setWithdrawBankName(e.target.value)}
                            placeholder="যেমন: Dutch-Bangla Bank"
                            className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo transition-all font-semibold"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">শাখার নাম (Branch) *</label>
                          <input
                            type="text"
                            value={withdrawBankBranch}
                            onChange={(e) => setWithdrawBankBranch(e.target.value)}
                            placeholder="যেমন: Mirpur Branch"
                            className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo transition-all font-semibold"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">হিসাবধারীর নাম (Account Holder Name) *</label>
                          <input
                            type="text"
                            value={withdrawBankHolder}
                            onChange={(e) => setWithdrawBankHolder(e.target.value)}
                            placeholder="যেমন: JANNATUL MAWA"
                            className="w-full bg-white border border-neutral-250 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-semibold uppercase"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">ব্যাংক অ্যাকাউন্ট নম্বর *</label>
                          <input
                            type="text"
                            value={withdrawAccount}
                            onChange={(e) => setWithdrawAccount(e.target.value)}
                            placeholder="যেমন: 1511204567891"
                            className="w-full bg-white border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-mono font-bold"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      /* Manual Mobile Wallet Input */
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">মোবাইল একাউন্ট নম্বর *</label>
                        <input
                          type="tel"
                          value={withdrawAccount}
                          onChange={(e) => setWithdrawAccount(e.target.value)}
                          placeholder="০১৭xxxxxxxx"
                          className="w-full bg-white border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-sans font-bold font-mono"
                          required
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Display details of selected saved account */
                  <div className="p-4 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/20 space-y-2">
                    <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">নির্বাচিত পেমেন্ট অ্যাকাউন্ট বিবরণী:</div>
                    {(() => {
                      const selectedAcc = savedAccounts.find(x => x.id === selectedSavedAccId);
                      if (!selectedAcc) return null;
                      return (
                        <div className="flex items-start gap-3">
                          <div className="text-xl">{selectedAcc.type === 'Bank' ? '🏦' : '📱'}</div>
                          <div>
                            <div className="text-xs font-black text-neutral-800">{selectedAcc.label}</div>
                            <div className="text-xs font-mono font-bold text-neutral-600">নম্বর/হিসাব: {selectedAcc.number}</div>
                            {selectedAcc.details && (
                              <div className="text-[10px] text-neutral-500 font-semibold">{selectedAcc.details}</div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">টাকার পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="৫০০"
                    min="500"
                    className="w-full bg-neutral-50 border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-sans font-bold"
                    required
                  />
                  <span className="text-[10px] text-neutral-400 font-semibold block pt-1">নূন্যতম উইথড্র পরিমাণ ৫০০ টাকা।</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase rounded-lg transition-all shadow-xs active:scale-99"
                >
                  উইথড্র রিকোয়েস্ট সাবমিট করুন
                </button>
              </form>

              {/* Historic List */}
              <div className="space-y-2 pt-4">
                <h4 className="text-xs font-bold text-brand-indigo uppercase tracking-wider">উইথড্র ইতিহাস</h4>
                <div className="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-150">
                  {withdrawList.map((w, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="font-bold text-neutral-800">{w.method} - {w.account}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{w.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neutral-850">৳{w.amount}</div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          w.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>{w.status === 'Success' ? 'সফল হয়েছে' : 'পেন্ডিং'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 15: SUPPORT TICKETS */}
          {activeTab === 'support' && (
            <div id="portal-tab-support" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-2xl mx-auto">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">কাস্টমার সাপোর্ট টিকেট</h3>
                <p className="text-xs text-neutral-500">পার্সেল ডেলিভারি লেট, রিফান্ড সমস্যা বা প্রোডাক্ট কোয়ালিটি নিয়ে হেল্প ডেস্কে টিকেট সাবমিট করুন</p>
              </div>

              {ticketSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>আপনার অভিযোগ বা হেল্প টিকেট সফলভাবে সাপোর্ট টিমের কাছে পাঠানো হয়েছে। খুব দ্রুত আপনার সাথে যোগাযোগ করা হবে!</span>
                </div>
              )}

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">টিকেট বিষয় / টপিক</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="যেমন: ডেলিভারি লেট হচ্ছে"
                      className="w-full bg-neutral-50 border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-sans font-bold"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">ডিপার্টমেন্ট</label>
                    <select
                      value={ticketDept}
                      onChange={(e) => setTicketDept(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-sans font-bold"
                    >
                      <option value="Delivery">ডেলিভারি সংক্রান্ত (Delivery)</option>
                      <option value="Payment">পেমেন্ট উইথড্র সংক্রান্ত (Payment)</option>
                      <option value="Product">প্রোডাক্ট কোয়ালিটি সংক্রান্ত (Product Quality)</option>
                      <option value="Other">অন্যান্য (Other Queries)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">বিস্তারিত অভিযোগ লিখুন</label>
                  <textarea
                    value={ticketMsg}
                    onChange={(e) => setTicketMsg(e.target.value)}
                    rows={4}
                    placeholder="আপনার অভিযোগের বা সমস্যার বিস্তারিত তথ্য ও অর্ডার আইডি উল্লেখ করুন..."
                    className="w-full bg-neutral-50 border border-neutral-250 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-indigo transition-all font-sans"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-indigo hover:bg-neutral-900 text-white font-bold text-xs uppercase rounded-lg transition-all shadow-xs"
                >
                  হেল্প টিকেট জমা দিন
                </button>
              </form>

              {/* Tickets List */}
              <div className="space-y-2 pt-4">
                <h4 className="text-xs font-bold text-brand-indigo uppercase tracking-wider">আপনার পূর্ববর্তী টিকেটসমূহ</h4>
                <div className="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-150">
                  {ticketList.map((t, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-800">{t.subject}</span>
                          <span className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-bold uppercase">{t.dept}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">{t.id} • {t.date}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.status === 'Solved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>{t.status === 'Solved' ? 'সমাধান হয়েছে' : 'তদন্ত চলছে'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 16: FAQ PANEL */}
          {activeTab === 'faq' && (
            <div id="portal-tab-faq" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-2xl mx-auto">
              <div className="border-b border-neutral-100 pb-4 space-y-1">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">সাধারণ জিজ্ঞাসা (FAQ)</h3>
                <p className="text-xs text-neutral-500">ড্রপশিপিং এবং কাস্টমার ইনভয়েস কেলিং নিয়ে সচরাচর জানতে চাওয়া প্রশ্নগুলোর উত্তর</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: 'আমার ফেসবুক পেইজের নাম ডেলিভারি ইনভয়েসে কীভাবে আসবে?', a: 'আপনি আপনার "প্রোফাইল" ট্যাবে গিয়ে "আপনার ফেসবুক পেইজ / শপের নাম" এ যা লিখবেন, সেটিই কাস্টমারের কাছে পাঠানো পার্সেলের ইনভয়েসের প্রিন্টেড লেভেলে প্রেরক হিসেবে থাকবে।' },
                  { q: 'ডেলিভারি চার্জ এবং শিপিং সময় কত?', a: 'ঢাকার ভেতর ডেলিভারি চার্জ ৬০ টাকা (১-২ দিন), ঢাকার বাইরে ১৩০ টাকা (৩-৪ দিন)। কাস্টমার ক্যাশ অন ডেলিভারি সুবিধা পাবেন।' },
                  { q: 'পার্সেল রিটার্ন আসলে কত পেনাল্টি হবে?', a: 'কাস্টমার যদি কোনো যৌক্তিক কারণ ছাড়া পার্সেল রিসিভ না করে ফেরত পাঠায়, তবে শুধুমাত্র ওয়ান-ওয়ে ডেলিভারি চার্জ আপনার একাউন্ট থেকে কর্তন করা হবে। ড্যামেজ বা ভুল সাইজ ডেলিভারির জন্য কোনো চার্জ কাটা হবে না।' },
                  { q: 'টাকা উইথড্র করার কতক্ষণের মধ্যে পেমেন্ট পাওয়া যায়?', a: 'উইথড্র আবেদন করার সর্বোচ্চ ২৪ ঘণ্টার মধ্যে আপনার নির্ধারিত বিকাশ, রকেট বা নগদ ব্যক্তিগত নম্বরে টাকা পাঠিয়ে দেওয়া হবে।' }
                ].map((f, idx) => (
                  <div key={idx} className="border-b border-neutral-150 pb-4 space-y-1.5">
                    <h4 className="text-xs font-extrabold text-brand-indigo">❓ {f.q}</h4>
                    <p className="text-xs text-neutral-600 font-sans leading-relaxed pl-4">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 17: YOUTUBE CHANNEL */}
          {activeTab === 'youtube' && (
            <div id="portal-tab-youtube" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-2xl mx-auto text-center space-y-6">
              <Tv className="w-16 h-16 text-rose-600 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">বিডি মার্ট অফিসিয়াল ইউটিউব একাডেমি</h3>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-md mx-auto">
                  কীভাবে ফেসবুক অ্যাড ক্যাম্পেইন চালাবেন, কীভাবে পেজ বুস্ট করবেন এবং প্রফেশনাল ডিজাইন করবেন তার ওপর ফ্রী ভিডিও টিউটোরিয়াল দেখতে আমাদের চ্যানেলটি ভিজিট করুন।
                </p>
              </div>
              <div className="pt-2">
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md"
                >
                  ইউটিউব চ্যানেল সাবস্ক্রাইব করুন ➔
                </a>
              </div>
            </div>
          )}

          {/* Tab 18: TELEGRAM GROUP */}
          {activeTab === 'telegram' && (
            <div id="portal-tab-telegram" className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs max-w-2xl mx-auto text-center space-y-6">
              <Send className="w-16 h-16 text-sky-500 mx-auto animate-pulse" />
              <div className="space-y-2">
                <h3 className="text-lg font-black text-brand-indigo font-display uppercase">টেলিগ্রাম রিসেলার সাপোর্ট নেটওয়ার্ক</h3>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-md mx-auto">
                  তাত্ক্ষণিক ঘোষণা, ক্যাটালগ ফটো আপডেট, নতুন স্টক এলার্ট এবং সহকর্মী রিসেলারদের সাথে আলোচনা করতে আমাদের টেলিগ্রাম সাপোর্ট চ্যানেলে দ্রুত যোগ দিন।
                </p>
              </div>
              <div className="pt-2">
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md"
                >
                  টেলিগ্রাম চ্যানেলে জয়েন করুন ➔
                </a>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
