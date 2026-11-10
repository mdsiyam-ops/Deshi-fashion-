import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ShoppingBag, DollarSign, Users, Activity, Eye, Package, ArrowUpRight, ArrowRight, Plus } from 'lucide-react';
import { Order, Product, AppView, Transaction } from '../types';

interface DashboardOverviewProps {
  orders: Order[];
  products: Product[];
  onNavigate: (view: AppView) => void;
  availableBalance: number;
  setAvailableBalance: React.Dispatch<React.SetStateAction<number>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  refundedExtraProfit: number;
  setRefundedExtraProfit: React.Dispatch<React.SetStateAction<number>>;
}

export default function DashboardOverview({ 
  orders, 
  products, 
  onNavigate,
  availableBalance,
  setAvailableBalance,
  transactions,
  setTransactions,
  refundedExtraProfit,
  setRefundedExtraProfit
}: DashboardOverviewProps) {
  // Local refund states
  const [refundAmount, setRefundAmount] = React.useState<string>('');
  const [refundError, setRefundError] = React.useState<string>('');
  const [refundSuccess, setRefundSuccess] = React.useState<string>('');
  const [showRefundPanel, setShowRefundPanel] = React.useState<boolean>(false);

  // Compute Real-time metrics
  const totalSalesVal = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrdersCount = orders.length;
  const totalProductPrice = totalSalesVal * 0.75; // Wholesale product cost (75% of sales)
  const netProfit = totalSalesVal * 0.15; // Net profit margin (15% of sales)
  const totalExtraProfit = totalSalesVal * 0.10; // Extra profit markup (10% of sales)
  const remainingExtraProfit = Math.max(0, totalExtraProfit - refundedExtraProfit);

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      setRefundError('অনুগ্রহ করে সঠিক পরিমাণ প্রফিট লিখুন।');
      return;
    }
    if (amt > remainingExtraProfit) {
      setRefundError(`আপনার কাছে সর্বোচ্চ ৳${remainingExtraProfit.toLocaleString()} রিফান্ড করার মতো প্রফিট রয়েছে।`);
      return;
    }

    // Process refund:
    setRefundedExtraProfit(prev => prev + amt);
    setAvailableBalance(prev => prev + amt);

    const newTx: Transaction = {
      id: `TX-REF-${Date.now().toString().slice(-4)}`,
      desc: 'Extra Profit Refund from Admin',
      type: 'Credit',
      amt: amt,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [newTx, ...prev]);

    setRefundSuccess(`সফলভাবে কাস্টমারের অ্যাকাউন্টে ৳${amt.toLocaleString()} প্রফিট ফেরত দেওয়া হয়েছে!`);
    setRefundAmount('');
    setRefundError('');

    setTimeout(() => {
      setRefundSuccess('');
    }, 4000);
  };

  const activeNowCount = Math.floor(12 + Math.random() * 8); // Demo simulated active users
  const newUsersCount = 84; // Demo baseline

  // Sparkline datasets (7 points represent days of the week)
  const sparklineSales = [45, 60, 55, 70, 65, 80, 95];
  const sparklineOrders = [12, 18, 15, 22, 19, 25, 28];
  const sparklineUsers = [30, 40, 35, 50, 48, 55, 64];
  const sparklineActive = [15, 12, 18, 22, 16, 14, activeNowCount];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div id="admin-dashboard-view" className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      
      {/* Editorial Dashboard Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 font-sans block">
            Executive Summary
          </span>
          <h1 className="text-3xl font-extrabold text-brand-indigo tracking-tight font-display uppercase mt-1">
            BD Mart Workspace
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-neutral-150/60 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-neutral-600 font-sans uppercase">
            Live Feed Online
          </span>
        </div>
      </div>

      {/* KPI Cards Layout Grid (5 Column) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Card 1: Total Sales */}
        <div className="bg-white border border-neutral-150/60 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Total Sales (মোট বিক্রি)</span>
              <h3 className="text-xl font-black text-brand-indigo font-sans">৳{totalSalesVal.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between text-[10px] text-neutral-400">
            <span className="font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14.2% MoM
            </span>
            <span>सर्वমোট বিক্রয়</span>
          </div>
        </div>

        {/* Card 2: Total Product Price */}
        <div className="bg-white border border-neutral-150/60 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Product Price (ক্রয়মূল্য)</span>
              <h3 className="text-xl font-black text-brand-indigo font-sans">৳{totalProductPrice.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-neutral-100 rounded-lg">
              <Package className="w-4 h-4 text-neutral-600" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between text-[10px] text-neutral-400">
            <span className="font-semibold text-neutral-500">Base Cost (75%)</span>
            <span>মূল পাইকারি দাম</span>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-white border border-neutral-150/60 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Net Profit (নিট লাভ)</span>
              <h3 className="text-xl font-black text-emerald-600 font-sans">৳{netProfit.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between text-[10px] text-neutral-400">
            <span className="font-semibold text-emerald-600">Margin (15%)</span>
            <span>এডমিনের নিট লাভ</span>
          </div>
        </div>

        {/* Card 4: Total Orders */}
        <div className="bg-white border border-neutral-150/60 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Total Orders (মোট অর্ডার)</span>
              <h3 className="text-xl font-black text-brand-indigo font-sans">{totalOrdersCount}</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between text-[10px] text-neutral-400">
            <span className="font-semibold text-amber-600">Live Syncing</span>
            <span>অর্ডারের সংখ্যা</span>
          </div>
        </div>

        {/* Card 5: Extra Profit */}
        <div className="bg-gradient-to-br from-indigo-50/40 to-white border-2 border-brand-indigo/30 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-brand-indigo">Extra Profit (এক্সট্রা প্রফিট)</span>
              <h3 className="text-xl font-black text-indigo-700 font-sans">৳{totalExtraProfit.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-[9px] text-neutral-400 font-bold">
              <span>অবশিষ্ট: ৳{remainingExtraProfit.toLocaleString()}</span>
              <span>রিফান্ডেড: ৳{refundedExtraProfit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${totalExtraProfit > 0 ? (refundedExtraProfit / totalExtraProfit) * 100 : 0}%` }}
              />
            </div>
            
            <button
              id="admin-refund-profit-trigger-btn"
              onClick={() => setShowRefundPanel(!showRefundPanel)}
              className="w-full py-1.5 mt-1 bg-indigo-600 hover:bg-neutral-900 text-white text-[10px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              {showRefundPanel ? 'প্যানেল বন্ধ করুন' : '💸 প্রফিট ফেরত দিন'}
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Refund Panel (Slide Down Container) */}
      {showRefundPanel && (
        <motion.div
          id="admin-refund-profit-panel"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-brand-indigo/20 rounded-xl p-6 shadow-sm max-w-xl mx-auto"
        >
          <div className="border-b border-neutral-100 pb-3 mb-4">
            <h4 className="text-sm font-bold text-brand-indigo flex items-center gap-1.5 uppercase">
              <span>💸 কাস্টমারকে এক্সট্রা প্রফিট ফেরত দিন (Refund Extra Profit)</span>
            </h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">কাস্টমারের ওয়ালেটে অতিরিক্ত লাভ স্থানান্তর করুন। এই টাকা সরাসরি তার ব্যালেন্সে যোগ হবে।</p>
          </div>

          {refundSuccess && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{refundSuccess}</span>
            </div>
          )}

          {refundError && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{refundError}</span>
            </div>
          )}

          <form onSubmit={handleProcessRefund} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-150/60">
                <span className="text-[10px] text-neutral-400 block font-bold uppercase">মোট এক্সট্রা প্রফিট</span>
                <span className="text-base font-black text-brand-indigo font-sans">৳{totalExtraProfit.toLocaleString()}</span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-150/60">
                <span className="text-[10px] text-neutral-400 block font-bold uppercase">রিফান্ডযোগ্য অবশিষ্ট</span>
                <span className="text-base font-black text-indigo-700 font-sans">৳{remainingExtraProfit.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">ফেরত দেওয়ার পরিমাণ (টাকা/৳) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">৳</span>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="যেমন: ৫০০"
                  className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg pl-7 pr-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRefundAmount(remainingExtraProfit.toFixed(0));
                  setRefundError('');
                }}
                className="px-3.5 py-2 border border-neutral-200 hover:border-neutral-300 text-neutral-600 text-[11px] font-bold rounded-lg transition-all"
              >
                সর্বোচ্চ ফেরত দিন (Max)
              </button>
              
              <button
                type="submit"
                disabled={remainingExtraProfit <= 0}
                className="flex-1 py-2 bg-brand-indigo hover:bg-neutral-900 text-white text-[11px] font-black rounded-lg transition-all uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
              >
                রিফান্ড নিশ্চিত করুন (Confirm Transfer)
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Main Row: Recent Orders (Left) and Quick Admin Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Orders List (Lg: 8 cols) */}
        <div className="lg:col-span-8 bg-white border border-neutral-150/60 rounded-lg p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-brand-indigo font-display uppercase">Recent Orders</h3>
                <p className="text-xs text-neutral-400">Synchronized directly from storefront checkouts</p>
              </div>
              <button
                id="dash-all-orders-btn"
                onClick={() => onNavigate('admin-orders')}
                className="text-xs font-semibold text-brand-indigo hover:underline flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-sm">
                  No orders have been received yet.
                </div>
              ) : (
                recentOrders.map((o) => (
                  <div
                    key={o.id}
                    id={`recent-order-row-${o.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100 gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-xs font-bold text-neutral-700 uppercase flex-shrink-0">
                        {o.customerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-brand-indigo truncate">
                            {o.customerName}
                          </h4>
                          <span className="text-[10px] text-neutral-400">• {o.id}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-xs sm:max-w-md">
                          {o.items.map(item => `${item.product.name} (x${item.quantity}) [${item.selectedSize}]`).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2.5 sm:pt-0 border-neutral-150">
                      <span className="text-sm font-bold text-brand-indigo">৳{o.totalPrice.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border mt-1 ${getStatusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-6 text-center border-t border-neutral-100 pt-4 text-xs text-neutral-400">
            Total of <strong className="text-neutral-600">{orders.length} orders</strong> managed in active storage.
          </div>
        </div>

        {/* Right Column: Quick Admin Actions & Status (Lg: 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Navigations */}
          <div className="bg-white border border-neutral-150/60 rounded-lg p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-indigo font-display mb-4">
              Quick Shortcuts / শর্টকাট লিংক
            </h3>
            <div className="space-y-3">
              <button
                id="shortcut-add-product-btn"
                onClick={() => onNavigate('admin-inventory')}
                className="w-full flex items-center justify-between p-3.5 rounded-lg border-2 border-orange-200 bg-orange-50/50 hover:bg-orange-50 text-left transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-600 text-white rounded-md animate-pulse">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-orange-800 block">➕ নতুন প্রোডাক্ট যোগ করুন</span>
                    <span className="text-[10px] text-orange-600 font-semibold">নতুন শার্ট, শাড়ি, পাঞ্জাবি বা অন্য পোশাক যোগ করুন</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-orange-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                id="shortcut-inventory-btn"
                onClick={() => onNavigate('admin-inventory')}
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-neutral-100 hover:bg-neutral-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-brand-indigo block">Product Inventory</span>
                    <span className="text-[10px] text-neutral-400">Manage apparel stock, SKU, and catalogs</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                id="shortcut-orders-btn"
                onClick={() => onNavigate('admin-orders')}
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-neutral-100 hover:bg-neutral-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-brand-indigo block">Order Flow Panel</span>
                    <span className="text-[10px] text-neutral-400">Update status and track direct checkouts</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                id="shortcut-storefront-btn"
                onClick={() => onNavigate('storefront')}
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-neutral-100 hover:bg-neutral-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-brand-indigo block">Customer Storefront</span>
                    <span className="text-[10px] text-neutral-400">View BD Mart buyer experience</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Active Catalogue Status */}
          <div className="bg-white border border-neutral-150/60 rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-indigo font-display">
              Catalogue Vital Info
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-center">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Total Catalog Items</span>
                <span className="text-xl font-bold text-brand-indigo mt-1 block">{products.length}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-center">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Out of Stock</span>
                <span className="text-xl font-bold text-rose-600 mt-1 block">
                  {products.filter(p => !p.inStock).length}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-center text-neutral-400">
              Active warehouse items sync instantaneously to user-facing pages.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
