import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Phone, MessageCircle, ShieldCheck, Key, RefreshCw, AlertCircle, ArrowLeft, Store, MapPin } from 'lucide-react';
import { AuthState } from '../types';
import { getRegisteredUsersFromDb, saveRegisteredUserToDb } from '../lib/firebase';

interface LoginRegisterProps {
  onLoginSuccess: (auth: AuthState) => void;
}

interface RegisteredUser {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'admin' | 'customer';
  shopName?: string;
  address?: string;
}

export default function LoginRegister({ onLoginSuccess }: LoginRegisterProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP Verification States
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState('');

  // Registered Users from LocalStorage
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem('bd_mart_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default system seed users
    return [
      { name: 'Admin Administrator', email: 'admin@bdmart.com', phone: '01700000000', password: 'admin123', role: 'admin' },
      { name: 'Jannat Maya', email: 'customer@bdmart.com', phone: '01900000000', password: 'customer123', role: 'customer' },
      { name: 'MD Siyam', email: 'mdsiyam32112@gmail.com', phone: '01711111111', password: 'admin123', role: 'admin' }
    ];
  });

  // Save registered users
  useEffect(() => {
    localStorage.setItem('bd_mart_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Load registered users from Firestore on mount
  useEffect(() => {
    async function loadDbUsers() {
      try {
        const dbUsers = await getRegisteredUsersFromDb();
        setRegisteredUsers(dbUsers);
      } catch (err) {
        console.error('Error fetching users from DB:', err);
      }
    }
    loadDbUsers();
  }, []);

  // Handle Login or initial Registration submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (activeTab === 'login') {
      if (!email || !password) {
        setError('অনুগ্রহ করে ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড প্রদান করুন।');
        return;
      }

      // Check registered users (support login by either email or phone number)
      const cleanedInput = email.trim().toLowerCase();
      const user = registeredUsers.find(
        u => (u.email.toLowerCase() === cleanedInput || u.phone === cleanedInput || u.phone.replace(/[\s-+]/g, '') === cleanedInput.replace(/[\s-+]/g, '')) && u.password === password
      );

      if (user) {
        onLoginSuccess({
          isAuthenticated: true,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone
        });
      } else if (cleanedInput === 'admin@bdmart.com' && password === 'admin123') {
        onLoginSuccess({
          isAuthenticated: true,
          email: 'admin@bdmart.com',
          name: 'BD Mart Manager',
          role: 'admin',
          phone: '01700000000'
        });
      } else if (cleanedInput === 'customer@bdmart.com' && password === 'customer123') {
        onLoginSuccess({
          isAuthenticated: true,
          email: 'customer@bdmart.com',
          name: 'Jannat Maya',
          role: 'customer',
          phone: '01900000000'
        });
      } else {
        setError('ভুল ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড। আবার চেষ্টা করুন।');
      }
    } else {
      // Registration flow
      if (!name || !email || !phone || !password || !shopName || !address) {
        setError('অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।');
        return;
      }

      // Format & sanitize phone number to check uniqueness
      const cleanedPhone = phone.trim().replace(/[\s-+]/g, '');
      if (cleanedPhone.length < 10) {
        setError('অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।');
        return;
      }

      // Check if this phone number is already registered
      const phoneExists = registeredUsers.some(
        u => u.phone.replace(/[\s-+]/g, '') === cleanedPhone
      );

      if (phoneExists) {
        setError('এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে অন্য নম্বর ব্যবহার করুন।');
        return;
      }

      // Trigger OTP verification
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
      setOtpCode(randomOtp);
      setShowOtpScreen(true);
      setOtpSentMessage(`আপনার মোবাইল নম্বর ${phone}-এ একটি ওটিপি ভেরিফিকেশন কোড পাঠানো হয়েছে।`);
    }
  };

  // Verify entered OTP and finalize account registration
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (userOtpInput === otpCode || userOtpInput === '123456') { // Allow standard backdoor of '123456'
      // Unique check again before insert to prevent race conditions
      const cleanedPhone = phone.trim().replace(/[\s-+]/g, '');
      const phoneExists = registeredUsers.some(
        u => u.phone.replace(/[\s-+]/g, '') === cleanedPhone
      );

      if (phoneExists) {
        setError('এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে।');
        setShowOtpScreen(false);
        return;
      }

      const newUser: RegisteredUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password,
        role: 'customer',
        shopName: shopName.trim(),
        address: address.trim()
      };

      setRegisteredUsers(prev => [...prev, newUser]);
      saveRegisteredUserToDb(newUser); // Save to Firestore
      setSuccess('আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই ও তৈরি করা হয়েছে!');
      
      // Save details to localStorage so they are populated right away for the Customer Portal
      localStorage.setItem('bd_mart_shop_name', shopName.trim() || 'মাই অনলাইন শপ');
      localStorage.setItem('bd_mart_address', address.trim() || '');
      
      // Auto-login the user
      setTimeout(() => {
        onLoginSuccess({
          isAuthenticated: true,
          email: newUser.email,
          name: newUser.name,
          role: 'customer',
          phone: newUser.phone,
          shopName: newUser.shopName,
          address: newUser.address
        });
      }, 1500);
    } else {
      setError('ভুল ওটিপি কোড। অনুগ্রহ করে সঠিক কোডটি প্রদান করুন।');
    }
  };

  // Resend OTP trigger
  const handleResendOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(randomOtp);
    setUserOtpInput('');
    setError('');
    setOtpSentMessage('একটি নতুন ওটিপি ভেরিফিকেশন কোড আপনার নাম্বারে পুনরায় পাঠানো হয়েছে।');
  };

  // Social Demologin helper
  const handleSocialDemo = (type: 'whatsapp' | 'messenger') => {
    if (type === 'whatsapp') {
      setEmail('admin@bdmart.com');
      setName('BD Mart Manager');
      setPassword('admin123');
      setError('WhatsApp demo credentials pre-filled. Press submit to log in as Administrator.');
    } else {
      setEmail('customer@bdmart.com');
      setName('Jannat Maya');
      setPassword('customer123');
      setError('Messenger demo credentials pre-filled. Press submit to log in as Customer.');
    }
  };

  const footerImages = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=300'
  ];

  return (
    <div id="login-register-screen" className="flex flex-col items-center justify-center min-h-[85vh] py-8 px-4 max-w-md mx-auto">
      
      {/* Visual Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black tracking-wider text-orange-600 uppercase font-display">
          BD MART
        </h2>
        <p className="text-xs text-neutral-500 font-sans mt-1.5 uppercase tracking-widest font-bold">
          দেশের বৃহৎ ড্রপশিপিং এবং রিসেলিং প্ল্যাটফর্ম
        </p>
      </div>

      {/* Main Card (Animate transitions smoothly) */}
      <div className="w-full bg-white border border-neutral-200 rounded-xl shadow-xs p-6 md:p-8 relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {!showOtpScreen ? (
            <motion.div
              key="auth-forms"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Sliding Tabs */}
              <div className="flex bg-neutral-100 p-1 rounded-lg mb-6 relative">
                <button
                  id="tab-login-btn"
                  onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                  className={`flex-1 flex items-center justify-center py-2.5 text-xs font-bold rounded-md z-10 transition-colors ${
                    activeTab === 'login' ? 'text-orange-600 font-extrabold' : 'text-neutral-500'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 mr-1.5" />
                  লগইন করুন
                </button>
                <button
                  id="tab-register-btn"
                  onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
                  className={`flex-1 flex items-center justify-center py-2.5 text-xs font-bold rounded-md z-10 transition-colors ${
                    activeTab === 'register' ? 'text-orange-600 font-extrabold' : 'text-neutral-500'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  নিবন্ধন করুন
                </button>
                
                <motion.div
                  className="absolute top-1 bottom-1 left-1 bg-white rounded-md shadow-2xs"
                  layoutId="activeAuthTab"
                  style={{ width: 'calc(50% - 4px)' }}
                  animate={{ x: activeTab === 'login' ? '0%' : '100%' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              </div>

              {/* Demo Accounts Helper Info */}
              <div className="mb-4 text-[11px] text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-150">
                <p className="font-extrabold text-neutral-700 mb-1">💡 ডেমো একাউন্ট কুইক-গেট:</p>
                <p>• অ্যাডমিন ডেমো লগইন করতে নিচে <b>Admin Demo</b> প্রেস করুন।</p>
                <p>• অথবা রেজিস্ট্রেশন পেজে গিয়ে নতুন ইউনিক নাম্বার দিয়ে ওটিপি পরীক্ষা করুন।</p>
              </div>

              {error && (
                <div className={`p-3 text-xs font-sans rounded-lg mb-4 leading-relaxed flex items-start gap-2 ${
                  error.includes('pre-filled') 
                    ? 'bg-orange-50 text-orange-800 border border-orange-100' 
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 text-xs font-sans bg-emerald-50 text-emerald-850 border border-emerald-100 rounded-lg mb-4 leading-relaxed flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'register' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                        উদ্যোক্তার নাম (Name)
                      </label>
                      <input
                        id="auth-name-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="যেমন: জান্নাতুল মাওয়া"
                        className="w-full bg-neutral-50/50 border border-neutral-250 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-sans"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                        শপের নাম (Shop Name)
                      </label>
                      <div className="relative">
                        <Store className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3.5" />
                        <input
                          id="auth-shopname-input"
                          type="text"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          placeholder="যেমন: মাওয়া ফ্যাশন গ্যালারি"
                          className="w-full bg-neutral-50/50 border border-neutral-250 rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-sans font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                        ঠিকানা (Address)
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3.5" />
                        <input
                          id="auth-address-input"
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="যেমন: মিরপুর-১০, ঢাকা"
                          className="w-full bg-neutral-50/50 border border-neutral-250 rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-sans"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    {activeTab === 'login' ? 'ইমেইল অথবা ফোন নম্বর (Email or Phone)' : 'ইমেইল ঠিকানা (Email)'}
                  </label>
                  <input
                    id="auth-email-input"
                    type={activeTab === 'login' ? 'text' : 'email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'login' ? 'যেমন: 01700000000 বা custom@bdmart.com' : 'যেমন: name@domain.com'}
                    className="w-full bg-neutral-50/50 border border-neutral-250 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-sans"
                    required
                  />
                </div>

                {activeTab === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                      মোবাইল নম্বর (Phone) *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3.5" />
                      <input
                        id="auth-phone-input"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-neutral-50/50 border border-neutral-250 rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-sans font-semibold"
                        required
                      />
                    </div>
                    <p className="text-[9px] text-neutral-400 mt-1">
                      * এই নম্বরে ওটিপি কোড পাঠানো হবে। একটি নম্বর দিয়ে একটি মাত্র অ্যাকাউন্টই খোলা সম্ভব।
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    পাসওয়ার্ড (Password)
                  </label>
                  <input
                    id="auth-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-50/50 border border-neutral-250 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-sans"
                    required
                  />
                </div>

                <button
                  id="auth-submit-btn"
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg text-xs font-bold tracking-wider uppercase transition-all mt-6 shadow-xs active:scale-99"
                >
                  {activeTab === 'login' ? 'সাইন ইন করুন' : 'ওটিপি কোড পাঠান'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <span className="relative bg-white px-3 text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold">
                  ডেভেলপার ডেমো অ্যাক্সেস
                </span>
              </div>

              {/* Quick Social Auths / Fillers */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="whatsapp-login-btn"
                  type="button"
                  onClick={() => handleSocialDemo('whatsapp')}
                  className="flex items-center justify-center px-4 py-2.5 border border-emerald-100 rounded-lg bg-emerald-50 hover:bg-emerald-100/75 text-emerald-800 text-xs font-bold transition-all"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Admin Demo
                </button>
                <button
                  id="messenger-login-btn"
                  type="button"
                  onClick={() => handleSocialDemo('messenger')}
                  className="flex items-center justify-center px-4 py-2.5 border border-indigo-100 rounded-lg bg-indigo-50 hover:bg-indigo-100/75 text-indigo-800 text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  Customer Demo
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Back button to re-edit info */}
              <button
                onClick={() => { setShowOtpScreen(false); setError(''); }}
                className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 font-bold transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ফিরে যান</span>
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto border border-orange-100 shadow-3xs">
                  <Key className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-base font-black text-neutral-800">ওটিপি ভেরিফিকেশন (OTP Verification)</h3>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto font-sans">
                  {otpSentMessage}
                </p>
              </div>

              {/* REAL-TIME SMS SIMULATOR GADGET (for high usability within sandbox) */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 space-y-2.5 shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    ✉️ SMS SIMULATOR
                  </span>
                  <span className="text-[9px] text-amber-600 font-mono">Just Now</span>
                </div>
                <div className="text-xs text-neutral-700 font-sans leading-relaxed">
                  <strong className="text-orange-600">BD MART:</strong> আপনার রেজিস্ট্রেশন কোডটি হলো <span className="text-base font-black text-brand-indigo font-mono bg-white px-2 py-0.5 rounded border border-amber-200">{otpCode}</span>। এই কোডটি কাউকে শেয়ার করবেন না।
                </div>
                <div className="text-[9px] text-neutral-400">
                  * ডেমো টেস্টিং সুবিধার জন্য ওটিপি কোডটি সরাসরি এখানে প্রদর্শিত হচ্ছে।
                </div>
              </div>

              {error && (
                <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-100 rounded-lg leading-relaxed flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-850 border border-emerald-100 rounded-lg leading-relaxed flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block text-center">
                    ৬ ডিজিটের ওটিপি কোড লিখুন
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={userOtpInput}
                    onChange={(e) => setUserOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="যেমন: 123456"
                    className="w-full text-center tracking-widest text-lg font-black bg-neutral-50/50 border border-neutral-250 rounded-lg py-3 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-xs"
                >
                  কোড ভেরিফাই ও অ্যাকাউন্ট খুলুন
                </button>
              </form>

              <div className="flex justify-center">
                <button
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ওটিপি কোড পুনরায় পাঠান</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Editorial Thumbnail Gallery */}
      <div className="w-full mt-10">
        <p className="text-center text-[10px] uppercase tracking-widest text-neutral-400 mb-4 font-semibold font-sans">
          BD Mart Curated Collection
        </p>
        <div className="grid grid-cols-3 gap-3">
          {footerImages.map((img, index) => (
            <div
              key={index}
              id={`fashion-thumb-${index}`}
              className="aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100 relative group border border-neutral-150"
            >
              <img
                src={img}
                alt="Autumn lookbook"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-neutral-950/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
