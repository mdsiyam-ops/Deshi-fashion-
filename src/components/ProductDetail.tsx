import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, Phone, MessageSquare, ShoppingBag, ArrowRight, Check, X } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  activeProduct: Product;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onPlaceOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerEmail?: string;
    selectedSize: string;
    selectedColor: string;
    notes?: string;
    product: Product;
    shippingFee: number;
  }) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onBackToHome?: () => void;
}

export default function ProductDetail({
  activeProduct,
  products,
  onSelectProduct,
  onPlaceOrder,
  wishlist,
  onToggleWishlist,
  onBackToHome
}: ProductDetailProps) {
  // Store selected states for currently visible product
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; value: string } | null>(null);
  const [activeImage, setActiveImage] = useState<string>(activeProduct?.image || '');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState('');

  // Shipping Option state: inside Dhaka (60) or outside (120)
  const [shippingOption, setShippingOption] = useState<'inside' | 'outside'>('inside');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Synchronize size, color, image when the active product changes
  useEffect(() => {
    if (activeProduct) {
      setSelectedSize(activeProduct.sizes[0] || '');
      setSelectedColor(activeProduct.colors[0] || null);
      setActiveImage(activeProduct.image);
      setOrderSuccess(false);
      setIsCheckoutOpen(false);
      setShippingOption('inside');
    }
  }, [activeProduct]);

  const isLiked = wishlist.includes(activeProduct?.id || '');

  // Recommended Products: all other products
  const recommendedProducts = products.filter(p => p.id !== activeProduct?.id && p.inStock);

  // Generate URL/messages for WhatsApp / Messenger ordering
  const getSocialMessage = (platform: 'whatsapp' | 'messenger') => {
    const colorName = selectedColor ? selectedColor.name : 'any';
    const msg = `Hello BD Mart, I would like to order "${activeProduct.name}" in Size: ${selectedSize}, Color: ${colorName}. SKU: ${activeProduct.sku}. Please let me know how to proceed!`;
    const encoded = encodeURIComponent(msg);
    
    if (platform === 'whatsapp') {
      return `https://wa.me/8801700000000?text=${encoded}`;
    } else {
      return `https://m.me/bdmart?text=${encoded}`;
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      setFormError('Please fill in your name, phone number, and shipping address.');
      return;
    }

    // Trigger order callback to App.tsx
    onPlaceOrder({
      customerName,
      customerPhone,
      customerAddress,
      customerEmail,
      selectedSize,
      selectedColor: selectedColor?.name || 'Standard',
      notes,
      product: activeProduct,
      shippingFee: shippingOption === 'inside' ? 60 : 120
    });

    const mockId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    setLastPlacedOrderId(mockId);
    setOrderSuccess(true);
    setFormError('');
    
    // Clear form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerEmail('');
    setNotes('');
  };

  if (!activeProduct) {
    return (
      <div className="text-center py-20 bg-brand-bg font-sans">
        <p className="text-neutral-500">No active product selected.</p>
      </div>
    );
  }

  return (
    <div id="product-detail-view" className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      
      {onBackToHome && (
        <button
          id="back-to-home-btn"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
        >
          ← হোমপেজে ফিরে যান
        </button>
      )}

      {/* Upper Grid Layout: Photo display and Product selections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Side: Images Section (Lg: 7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-100 relative border border-neutral-150/50">
            <img
              id="main-product-image"
              src={activeImage || null}
              alt={activeProduct.name}
              className="w-full h-full object-cover transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            {/* Wishlist Button Overlay */}
            <button
              id="wishlist-toggle-btn"
              onClick={() => onToggleWishlist(activeProduct.id)}
              className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs p-3 rounded-full shadow-md text-brand-indigo hover:scale-105 active:scale-95 transition-all"
              aria-label="Toggle wishlist"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-500 hover:text-rose-500'
                }`}
              />
            </button>

            {/* Out of stock badge overlay */}
            {!activeProduct.inStock && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-brand-indigo text-white font-display uppercase tracking-widest text-xs font-semibold px-4 py-2.5 rounded-lg shadow-md">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

          {/* Miniature Photo Shelf */}
          {activeProduct.images && activeProduct.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1 no-scrollbar">
              {activeProduct.images.map((img, i) => (
                <button
                  key={i}
                  id={`product-thumb-btn-${i}`}
                  onClick={() => setActiveImage(img)}
                  className={`relative flex-shrink-0 w-20 aspect-[4/5] rounded-lg overflow-hidden border transition-all ${
                    activeImage === img ? 'border-brand-indigo ring-1 ring-brand-indigo/30' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <img src={img || null} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Description and Custom Swatches (Lg: 5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Category */}
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-400 font-sans block">
              {activeProduct.category}
            </span>

            {/* Title & Price */}
            <div>
              <h1 id="product-detail-title" className="text-2xl md:text-3xl font-extrabold text-brand-indigo tracking-tight font-display">
                {activeProduct.name}
              </h1>
              
              <div className="flex items-baseline gap-3 mt-3">
                <span id="product-detail-price" className="text-xl font-bold text-brand-indigo font-sans">
                  ৳{activeProduct.price.toLocaleString()}
                </span>
                {activeProduct.originalPrice && (
                  <span className="text-sm line-through text-neutral-400 font-sans">
                    ৳{activeProduct.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Ratings Summary */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(activeProduct.rating) ? 'fill-amber-400' : 'text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold font-sans">{activeProduct.rating}</span>
              <span className="text-neutral-400">({activeProduct.reviewsCount} verified reviews)</span>
            </div>

            <hr className="border-neutral-100" />

            {/* Short Description */}
            <p className="text-sm text-neutral-600 font-sans leading-relaxed">
              {activeProduct.description}
            </p>

            <hr className="border-neutral-100" />

            {/* Interactive Color Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-sans">
                  Color: <span className="text-brand-indigo font-bold">{selectedColor?.name}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {activeProduct.colors.map((color, i) => (
                  <button
                    key={i}
                    id={`color-swatch-btn-${color.name.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                      selectedColor?.name === color.name
                        ? 'border-brand-indigo ring-2 ring-brand-indigo/20 scale-105'
                        : 'border-neutral-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {selectedColor?.name === color.name && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          color.value.toLowerCase() === '#fdfbf7' || color.value.toLowerCase() === '#e1d9d1'
                            ? 'text-neutral-800'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Size Chips */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-sans">
                  Size: <span className="text-brand-indigo font-bold">{selectedSize}</span>
                </span>
                <button className="text-xs text-neutral-400 underline hover:text-brand-indigo">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeProduct.sizes.map((size) => (
                  <button
                    key={size}
                    id={`size-chip-btn-${size}`}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      selectedSize === size
                        ? 'bg-brand-indigo text-white border-brand-indigo'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase CTA Buttons */}
          <div className="mt-8 space-y-3">
            {activeProduct.inStock ? (
              <button
                id="order-now-btn"
                onClick={() => {
                  setOrderSuccess(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full bg-brand-indigo text-white py-3.5 rounded-lg text-sm font-semibold tracking-wide uppercase hover:bg-neutral-900 transition-all shadow-sm flex items-center justify-center gap-2 group active:scale-99"
              >
                <ShoppingBag className="w-4 h-4" />
                Order Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-neutral-100 text-neutral-400 py-3.5 rounded-lg text-sm font-semibold tracking-wide uppercase cursor-not-allowed text-center border border-neutral-200"
              >
                Sold Out
              </button>
            )}

            {/* Social Commerce Ordering Integrations */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <a
                id="social-whatsapp-btn"
                href={getSocialMessage('whatsapp')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-2.5 px-3 border border-emerald-100 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100/60 transition-all"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Order via WhatsApp
              </a>
              <a
                id="social-messenger-btn"
                href={getSocialMessage('messenger')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-2.5 px-3 border border-indigo-100 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-semibold hover:bg-indigo-100/60 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                Order via Messenger
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended "You May Also Like" Slider Shelf */}
      {recommendedProducts.length > 0 && (
        <div className="mt-16 border-t border-neutral-150 pt-12">
          <h2 className="text-xl font-bold text-brand-indigo tracking-tight uppercase font-display mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommendedProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                id={`rec-item-card-${p.id}`}
                onClick={() => onSelectProduct(p)}
                className="group cursor-pointer space-y-3"
              >
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-neutral-50 relative border border-neutral-150/40">
                  <img
                    src={p.image || null}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {p.originalPrice && (
                    <span className="absolute top-2 left-2 bg-brand-indigo text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
                      Sale
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-sm font-semibold text-brand-indigo truncate leading-tight group-hover:underline">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-xs font-bold text-brand-indigo font-sans">
                      ৳{p.price.toLocaleString()}
                    </span>
                    {p.originalPrice && (
                      <span className="text-[11px] line-through text-neutral-400 font-sans">
                        ৳{p.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stateful Drawer (Bottom Sheet Checkout Form) */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            {/* Dark background modal overlay */}
            <motion.div
              id="checkout-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              id="checkout-bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl shadow-xl max-h-[92vh] flex flex-col font-sans"
            >
              {/* Drawer Handle */}
              <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto my-3 flex-shrink-0" />

              {/* Drawer Header */}
              <div className="px-6 pb-4 border-b border-neutral-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-brand-indigo font-display uppercase tracking-wide">
                    {orderSuccess ? 'Order Success' : 'Place Your Order'}
                  </h3>
                  <p className="text-xs text-neutral-500">BD Mart Direct Checkout</p>
                </div>
                <button
                  id="close-checkout-btn"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="overflow-y-auto px-6 py-4 flex-1">
                {orderSuccess ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12 space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                      <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-brand-indigo font-display uppercase">Thank You!</h4>
                      <p className="text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
                        Your order for <strong className="text-brand-indigo">{activeProduct.name}</strong> has been received and saved successfully.
                      </p>
                      <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 inline-block font-mono text-xs text-neutral-500 font-semibold mt-2">
                        ORDER ID: {lastPlacedOrderId}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                      The order has been registered in the system and will display immediately on the Admin control panel dashboard.
                    </p>
                    <div className="pt-6">
                      <button
                        id="success-continue-btn"
                        onClick={() => setIsCheckoutOpen(false)}
                        className="px-6 py-2.5 bg-brand-indigo text-white text-xs font-semibold rounded-lg uppercase tracking-wider hover:bg-neutral-900 transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
                    {/* Left side: item overview (Md: 5 cols) */}
                    <div className="md:col-span-5 bg-neutral-50 rounded-lg p-4 border border-neutral-100 self-start">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 font-sans">
                        Item Summary
                      </h4>
                      <div className="flex gap-4">
                        <div className="w-16 aspect-[3/4] rounded-md overflow-hidden bg-white border border-neutral-200 flex-shrink-0">
                          <img src={activeImage || null} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-semibold text-brand-indigo truncate">{activeProduct.name}</h5>
                          <p className="text-xs text-neutral-400 mt-0.5 font-mono">SKU: {activeProduct.sku}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-brand-indigo text-white text-[10px] font-bold">
                              Size: {selectedSize}
                            </span>
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-sm text-neutral-800 text-[10px] font-bold border border-neutral-300"
                              style={{ borderLeft: `4px solid ${selectedColor?.value}` }}
                            >
                              Color: {selectedColor?.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <hr className="my-4 border-neutral-200" />

                      <div className="space-y-2 text-sm text-neutral-600">
                        <div className="flex justify-between">
                          <span>Subtotal (সাবটোটাল)</span>
                          <span className="font-semibold">৳{activeProduct.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Shipping Charge (ডেলিভারি চার্জ)</span>
                          <span className="font-bold text-brand-indigo">৳{shippingOption === 'inside' ? '60' : '120'}</span>
                        </div>
                        <hr className="border-dashed border-neutral-200" />
                        <div className="flex justify-between text-brand-indigo font-bold text-base pt-1">
                          <span>Total (মোট)</span>
                          <span id="checkout-total-val">৳{(activeProduct.price + (shippingOption === 'inside' ? 60 : 120)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: checkout form (Md: 7 cols) */}
                    <form onSubmit={handleCheckoutSubmit} className="md:col-span-7 space-y-4">
                      {formError && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium">
                          {formError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="checkout-name-input"
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Jannat Maya"
                            className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-indigo focus:bg-white transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                            Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="checkout-phone-input"
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+880 1712-345678"
                            className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-indigo focus:bg-white transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                          Email Address
                        </label>
                        <input
                          id="checkout-email-input"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="jannat@example.com"
                          className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-indigo focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                          Shipping Address <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          id="checkout-address-input"
                          rows={2}
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="House 42, Road 12, Banani, Dhaka, Bangladesh"
                          className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-indigo focus:bg-white transition-all resize-none"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                          Delivery Location (ডেলিভারি এলাকা) <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            id="shipping-inside-btn"
                            type="button"
                            onClick={() => setShippingOption('inside')}
                            className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                              shippingOption === 'inside'
                                ? 'border-brand-indigo bg-indigo-50/20 shadow-xs'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <span className="text-xs font-bold text-neutral-800">ঢাকার মধ্যে (Inside Dhaka)</span>
                            <span className="text-xs font-black text-brand-indigo mt-1">৳৬০ (60 Taka)</span>
                          </button>
                          
                          <button
                            id="shipping-outside-btn"
                            type="button"
                            onClick={() => setShippingOption('outside')}
                            className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                              shippingOption === 'outside'
                                ? 'border-brand-indigo bg-indigo-50/20 shadow-xs'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <span className="text-xs font-bold text-neutral-800">ঢাকার বাইরে (Outside Dhaka)</span>
                            <span className="text-xs font-black text-brand-indigo mt-1">৳১২০ (120 Taka)</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                          Delivery Instructions / Notes
                        </label>
                        <textarea
                          id="checkout-notes-input"
                          rows={1}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Please ring the bell or leave with security."
                          className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-indigo focus:bg-white transition-all resize-none"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          id="checkout-submit-btn"
                          type="submit"
                          className="w-full bg-brand-indigo text-white py-3 rounded-lg text-sm font-semibold tracking-wide uppercase hover:bg-neutral-900 transition-all flex items-center justify-center gap-2 active:scale-99"
                        >
                          Confirm Order & Confirm Delivery
                        </button>
                        <p className="text-[10px] text-center text-neutral-400 mt-2 font-medium">
                          By confirming, you agree to payment of ৳{(activeProduct.price + (shippingOption === 'inside' ? 60 : 120)).toLocaleString()} cash on delivery.
                        </p>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
