import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, LayoutDashboard, Package, FileText, User, LogOut, Heart, Github, AlertCircle, Lock } from 'lucide-react';

import { Product, Order, AuthState, AppView, Transaction } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './data/initialData';
import { 
  getProductsFromDb, 
  saveProductToDb, 
  deleteProductFromDb, 
  getOrdersFromDb, 
  saveOrderToDb 
} from './lib/firebase';

// Component Imports
import StorefrontHome from './components/StorefrontHome';
import CustomerPortal from './components/CustomerPortal';
import ProductDetail from './components/ProductDetail';
import DashboardOverview from './components/DashboardOverview';
import ProductInventory from './components/ProductInventory';
import OrderManagement from './components/OrderManagement';
import LoginRegister from './components/LoginRegister';


export default function App() {
  // Global States backed by LocalStorage with bulletproof fallback error handling
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('bd_mart_products');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached products', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('bd_mart_orders');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached orders', e);
    }
    return INITIAL_ORDERS;
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bd_mart_wishlist');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached wishlist', e);
    }
    return [];
  });

  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem('bd_mart_auth');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached auth', e);
    }
    return {
      isAuthenticated: false,
      email: '',
      name: '',
      role: 'customer'
    };
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const saved = localStorage.getItem('bd_mart_last_view');
      const validViews: AppView[] = ['storefront', 'admin-dashboard', 'admin-inventory', 'admin-orders', 'login'];
      if (saved && validViews.includes(saved as AppView)) {
        return saved as AppView;
      }
    } catch (e) {
      console.warn('Failed to parse last view', e);
    }
    return 'storefront';
  });

  // Keep track of which product is currently being displayed in the customer storefront detail page
  const [activeProductId, setActiveProductId] = useState<string>(() => {
    return products[0]?.id || INITIAL_PRODUCTS[0]?.id || '';
  });

  // Storefront tab view ('home' | 'detail') to show either homepage or product detail
  const [activeStorefrontTab, setActiveStorefrontTab] = useState<'home' | 'detail'>('home');

  // Shared financial states for available/pending/withdrawn balance, transactions and extra profit refunds
  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    const saved = localStorage.getItem('bd_mart_available_balance');
    return saved ? parseFloat(saved) : 5450;
  });

  const [pendingBalance, setPendingBalance] = useState<number>(() => {
    const saved = localStorage.getItem('bd_mart_pending_balance');
    return saved ? parseFloat(saved) : 1200;
  });

  const [withdrawnBalance, setWithdrawnBalance] = useState<number>(() => {
    const saved = localStorage.getItem('bd_mart_withdrawn_balance');
    return saved ? parseFloat(saved) : 12500;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bd_mart_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return [
      { id: 'TX-1', desc: 'Order #ORD-1205 Profit Credit', type: 'Credit', amt: 650, date: '2026-07-10' },
      { id: 'TX-2', desc: 'bKash Wallet Withdrawal Success', type: 'Debit', amt: 5000, date: '2026-07-01' },
      { id: 'TX-3', desc: 'Order #ORD-1192 Profit Credit', type: 'Credit', amt: 450, date: '2026-06-28' },
      { id: 'TX-4', desc: 'Nagad Wallet Withdrawal Success', type: 'Debit', amt: 7500, date: '2026-06-15' }
    ];
  });

  const [refundedExtraProfit, setRefundedExtraProfit] = useState<number>(() => {
    const saved = localStorage.getItem('bd_mart_refunded_extra_profit');
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('bd_mart_available_balance', availableBalance.toString());
  }, [availableBalance]);

  useEffect(() => {
    localStorage.setItem('bd_mart_pending_balance', pendingBalance.toString());
  }, [pendingBalance]);

  useEffect(() => {
    localStorage.setItem('bd_mart_withdrawn_balance', withdrawnBalance.toString());
  }, [withdrawnBalance]);

  useEffect(() => {
    localStorage.setItem('bd_mart_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bd_mart_refunded_extra_profit', refundedExtraProfit.toString());
  }, [refundedExtraProfit]);

  // Load products and orders from Firestore on mount
  useEffect(() => {
    async function loadFirebaseData() {
      try {
        const dbProducts = await getProductsFromDb();
        setProducts(dbProducts);
        
        const dbOrders = await getOrdersFromDb();
        setOrders(dbOrders);
        
        // Update active product if currently empty
        if (dbProducts.length > 0 && !activeProductId) {
          setActiveProductId(dbProducts[0].id);
        }
      } catch (err) {
        console.error("Firestore loading error:", err);
      }
    }
    loadFirebaseData();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bd_mart_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bd_mart_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bd_mart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('bd_mart_auth', JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    localStorage.setItem('bd_mart_last_view', currentView);
  }, [currentView]);

  // Find active product from id with safe fallback
  const activeProduct = products.find(p => p.id === activeProductId) || products[0] || INITIAL_PRODUCTS[0];

  // Storefront Product Detail Switcher Handler
  const handleSelectProduct = (product: Product) => {
    setActiveProductId(product.id);
    setActiveStorefrontTab('detail');
    // Scroll to top of window smoothly when changing products
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Wishlist Toggle
  const handleToggleWishlist = (id: string) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Auth Handlers
  const handleLoginSuccess = (newAuth: AuthState) => {
    setAuth(newAuth);
    // If logging in as admin, auto navigate to admin dashboard, else storefront
    if (newAuth.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('storefront');
    }
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      email: '',
      name: '',
      role: 'customer'
    });
    setCurrentView('storefront');
  };

  // Customer Orders Flow: Decs stock qty, saves order, registers success state
  const handlePlaceOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerEmail?: string;
    selectedSize: string;
    selectedColor: string;
    notes?: string;
    product: Product;
    shippingFee: number;
  }) => {
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: newOrderId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      customerEmail: orderData.customerEmail,
      items: [
        {
          product: orderData.product,
          quantity: 1,
          selectedSize: orderData.selectedSize,
          selectedColor: orderData.selectedColor
        }
      ],
      totalPrice: orderData.product.price + orderData.shippingFee,
      shippingFee: orderData.shippingFee,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      notes: orderData.notes
    };

    // Update orders list and save to Firestore
    setOrders(prev => [newOrder, ...prev]);
    saveOrderToDb(newOrder);

    // Decrement stock count in product inventory safely and sync to Firestore
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        if (p.id === orderData.product.id) {
          const updatedQty = Math.max(0, p.stockCount - 1);
          const updatedProd = {
            ...p,
            stockCount: updatedQty,
            inStock: updatedQty > 0
          };
          saveProductToDb(updatedProd);
          return updatedProd;
        }
        return p;
      });
    });
  };

  // Admin Catalog Modification Functions
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    setActiveProductId(newProduct.id); // View the new product
    saveProductToDb(newProduct);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    saveProductToDb(updatedProduct);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    deleteProductFromDb(id);
    // If we deleted the currently active product, fallback to the first remaining one
    if (activeProductId === id) {
      const remaining = products.filter(p => p.id !== id);
      if (remaining.length > 0) {
        setActiveProductId(remaining[0].id);
      }
    }
  };

  // Admin Orders Status Lifecycle Function
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, status };
          saveOrderToDb(updatedOrder);
          return updatedOrder;
        }
        return o;
      });
    });
  };

  const handleUpdateOrderCourierStatus = (orderId: string, courierStatus: string) => {
    setOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, courierStatus };
          saveOrderToDb(updatedOrder);
          return updatedOrder;
        }
        return o;
      });
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg text-neutral-800 flex flex-col font-sans selection:bg-brand-indigo/10 selection:text-brand-indigo">
      
      {/* Editorial Demo Context Banner */}
      <div className="bg-brand-indigo text-neutral-200 text-center py-2 px-4 text-[11px] font-medium tracking-wider uppercase font-sans border-b border-white/5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
        <span>🍂 CURATED AUTUMN WORKSPACE</span>
        <span className="hidden sm:inline opacity-30">|</span>
        <span>ROLE: <strong className="text-white underline">{auth.isAuthenticated ? auth.role.toUpperCase() : 'VISITOR'}</strong></span>
        {auth.isAuthenticated && (
          <>
            <span className="hidden sm:inline opacity-30">|</span>
            <span className="truncate">NAME: <strong className="text-white">{auth.name}</strong></span>
          </>
        )}
      </div>

      {/* Main Luxury Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand Signature */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentView('storefront'); setActiveStorefrontTab('home'); }}>
            <div className="bg-brand-indigo text-white p-2 rounded-lg flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-widest text-brand-indigo uppercase font-display block">
                BD MART
              </span>
              <span className="text-[9px] text-neutral-400 font-sans tracking-widest uppercase font-semibold block -mt-1">
                Atelier Modern
              </span>
            </div>
          </div>

          {/* Navigation View Switcher Grid */}
          <nav className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-lg">
            <button
              id="nav-storefront-btn"
              onClick={() => { setCurrentView('storefront'); setActiveStorefrontTab('home'); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md uppercase tracking-wider transition-all ${
                currentView === 'storefront'
                  ? 'bg-white text-brand-indigo shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Storefront
            </button>

            {auth.isAuthenticated && auth.role === 'admin' && (
              <>
                <button
                  id="nav-dashboard-btn"
                  onClick={() => setCurrentView('admin-dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md uppercase tracking-wider transition-all ${
                    currentView === 'admin-dashboard'
                      ? 'bg-white text-brand-indigo shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </button>

                <button
                  id="nav-inventory-btn"
                  onClick={() => setCurrentView('admin-inventory')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md uppercase tracking-wider transition-all ${
                    currentView === 'admin-inventory'
                      ? 'bg-white text-brand-indigo shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Inventory
                </button>

                <button
                  id="nav-orders-btn"
                  onClick={() => setCurrentView('admin-orders')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md uppercase tracking-wider transition-all ${
                    currentView === 'admin-orders'
                      ? 'bg-white text-brand-indigo shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Orders
                </button>
              </>
            )}

            <button
              id="nav-login-btn"
              onClick={() => setCurrentView('login')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md uppercase tracking-wider transition-all ${
                currentView === 'login'
                  ? 'bg-white text-brand-indigo shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              {auth.isAuthenticated ? 'Account' : 'Login'}
            </button>
          </nav>

          {/* Quick Exit/Session Controls */}
          <div className="flex items-center gap-3">
            {wishlist.length > 0 && (
              <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full border border-rose-100 text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>{wishlist.length} Liked</span>
              </div>
            )}

            {auth.isAuthenticated && (
              <button
                id="header-logout-btn"
                onClick={handleLogout}
                className="p-2 border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:border-rose-100 rounded-lg hover:bg-rose-50 transition-colors"
                title="Sign Out Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Primary Dynamic Stage */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'storefront' && (
              activeStorefrontTab === 'home' ? (
                auth.isAuthenticated ? (
                  <CustomerPortal
                    products={products}
                    onSelectProduct={handleSelectProduct}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onLogout={handleLogout}
                    auth={auth}
                    orders={orders}
                    onPlaceOrder={handlePlaceOrder}
                    availableBalance={availableBalance}
                    setAvailableBalance={setAvailableBalance}
                    pendingBalance={pendingBalance}
                    setPendingBalance={setPendingBalance}
                    withdrawnBalance={withdrawnBalance}
                    setWithdrawnBalance={setWithdrawnBalance}
                    transactions={transactions}
                    setTransactions={setTransactions}
                  />
                ) : (
                  <StorefrontHome
                    products={products}
                    onSelectProduct={handleSelectProduct}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onNavigate={setCurrentView}
                  />
                )
              ) : (
                <ProductDetail
                  activeProduct={activeProduct}
                  products={products}
                  onSelectProduct={handleSelectProduct}
                  onPlaceOrder={handlePlaceOrder}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onBackToHome={() => setActiveStorefrontTab('home')}
                />
              )
            )}

            {currentView === 'admin-dashboard' && (
              auth.isAuthenticated && auth.role === 'admin' ? (
                <DashboardOverview
                  orders={orders}
                  products={products}
                  onNavigate={setCurrentView}
                  availableBalance={availableBalance}
                  setAvailableBalance={setAvailableBalance}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  refundedExtraProfit={refundedExtraProfit}
                  setRefundedExtraProfit={setRefundedExtraProfit}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white border border-neutral-200/80 rounded-2xl text-center space-y-6 shadow-xs animate-fade-in">
                  <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-neutral-800">অ্যাক্সেস রিজেক্টেড (Access Denied)</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                      শুধুমাত্র এডমিনই এই ড্যাশবোর্ড ব্যবহার করতে পারবেন এবং প্রোডাক্ট বা অর্ডারের কাজ করতে পারবেন।
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView('login')}
                    className="w-full py-2.5 bg-brand-indigo hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
                  >
                    লগইন করুন (Go to Login)
                  </button>
                </div>
              )
            )}

            {currentView === 'admin-inventory' && (
              auth.isAuthenticated && auth.role === 'admin' ? (
                <ProductInventory
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white border border-neutral-200/80 rounded-2xl text-center space-y-6 shadow-xs animate-fade-in">
                  <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-neutral-800">অ্যাক্সেস রিজেক্টেড (Access Denied)</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                      শুধুমাত্র এডমিনই প্রোডাক্ট যোগ (Add) বা বাতিল (Delete) করতে পারবেন।
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView('login')}
                    className="w-full py-2.5 bg-brand-indigo hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
                  >
                    লগইন করুন (Go to Login)
                  </button>
                </div>
              )
            )}

            {currentView === 'admin-orders' && (
              auth.isAuthenticated && auth.role === 'admin' ? (
                <OrderManagement
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onUpdateOrderCourierStatus={handleUpdateOrderCourierStatus}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white border border-neutral-200/80 rounded-2xl text-center space-y-6 shadow-xs animate-fade-in">
                  <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-neutral-800">অ্যাক্সেস রিজেক্টেড (Access Denied)</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                      শুধুমাত্র এডমিনই অর্ডারসমূহ প্রসেস বা আপডেট করতে পারবেন।
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView('login')}
                    className="w-full py-2.5 bg-brand-indigo hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
                  >
                    লগইন করুন (Go to Login)
                  </button>
                </div>
              )
            )}

            {currentView === 'login' && (
              auth.isAuthenticated ? (
                <div id="auth-status-panel" className="max-w-md mx-auto my-12 p-8 bg-white border border-neutral-150 rounded-lg text-center space-y-6 shadow-sm">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-brand-indigo border border-neutral-250">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-brand-indigo font-display uppercase">Active Session</h3>
                    <p className="text-sm font-semibold text-neutral-600">{auth.name}</p>
                    <p className="text-xs text-neutral-400 font-mono">{auth.email}</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg border text-xs text-neutral-500 leading-relaxed">
                    You have authenticated as <strong className="text-brand-indigo uppercase">{auth.role}</strong>. You have full clearance to manage catalogs, view logs, and progress order life stages.
                  </div>
                  <div className="flex gap-3">
                    <button
                      id="account-logout-btn"
                      onClick={handleLogout}
                      className="flex-1 py-2.5 border border-neutral-200 text-xs font-semibold text-neutral-500 hover:text-neutral-700 uppercase rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                    <button
                      id="account-dash-btn"
                      onClick={() => setCurrentView('admin-dashboard')}
                      className="flex-1 py-2.5 bg-brand-indigo text-white text-xs font-semibold uppercase rounded-lg hover:bg-neutral-900 transition-colors"
                    >
                      Go to Admin
                    </button>
                  </div>
                </div>
              ) : (
                <LoginRegister onLoginSuccess={handleLoginSuccess} />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Editorial Page Footer */}
      <footer className="bg-white border-t border-neutral-100 py-12 text-center text-xs text-neutral-400 font-sans">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <p className="uppercase tracking-widest font-semibold text-brand-indigo">
            BD Mart Atelier Premium
          </p>
          <p className="max-w-md mx-auto leading-relaxed text-neutral-400">
            Designing sophisticated garments that combine architectural structure with luxury fabrications. Hand-tailored in Dhaka, Bangladesh.
          </p>
          <div className="flex justify-center gap-6 text-neutral-400 pt-2">
            <a href="#" className="hover:text-brand-indigo transition-colors font-semibold">Legal Notice</a>
            <span>•</span>
            <a href="#" className="hover:text-brand-indigo transition-colors font-semibold">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-brand-indigo transition-colors font-semibold">Privacy Policy</a>
          </div>
          <p className="text-[10px] text-neutral-400 pt-4">
            &copy; {new Date().getFullYear()} BD Mart Limited. All rights reserved. Built with Antigravity and Gemini.
          </p>
        </div>
      </footer>

    </div>
  );
}
