import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit2, Download, ToggleLeft, ToggleRight, X, Trash2, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductInventoryProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductInventory({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}: ProductInventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Custom Category fields
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Handle slide drawer opening
  const openAddDrawer = () => {
    setDrawerMode('add');
    setEditingProductId(null);
    setName('');
    setSku(`BD-APRL-${Math.floor(100 + Math.random() * 900)}`);
    setCategory('Panjabi');
    setIsCustomCategory(false);
    setCustomCategoryName('');
    setPrice('');
    setOriginalPrice('');
    setStockCount('15');
    setImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200');
    setDescription('');
    setError('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (product: Product) => {
    setDrawerMode('edit');
    setEditingProductId(product.id);
    setName(product.name);
    setSku(product.sku);
    
    const defaultCats = [
      'Panjabi', 'Saree', 'Salwar Kameez', 'Woven Shirt', 'Suits & Blazers', 
      'Knitwear', 'Pants & Shorts', 'Dresses', 'Accessories'
    ];
    const isCustom = !defaultCats.includes(product.category);
    
    setCategory(isCustom ? '__NEW__' : product.category);
    setIsCustomCategory(isCustom);
    setCustomCategoryName(isCustom ? product.category : '');
    
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setStockCount(product.stockCount.toString());
    setImage(product.image);
    setDescription(product.description);
    setError('');
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let resolvedCategory = category;
    if (category === '__NEW__' || isCustomCategory) {
      if (!customCategoryName.trim()) {
        setError('দয়া করে নতুন ক্যাটেগরি বা প্রোডাক্টের ধরনের নাম লিখুন।');
        return;
      }
      resolvedCategory = customCategoryName.trim();
    }

    if (!name || !sku || !resolvedCategory || !price || !stockCount || !image) {
      setError('দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।');
      return;
    }

    const priceNum = parseFloat(price);
    const stockCountNum = parseInt(stockCount);
    
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please provide a valid price.');
      return;
    }

    if (isNaN(stockCountNum) || stockCountNum < 0) {
      setError('Please provide a valid stock count.');
      return;
    }

    if (drawerMode === 'add') {
      const newProd: Product = {
        id: `prod-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        description: description || 'No description provided.',
        price: priceNum,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        image,
        images: [image],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Noir Black', value: '#111827' },
          { name: 'Oatmeal Beige', value: '#E5E7EB' }
        ],
        category: resolvedCategory,
        sku,
        stockCount: stockCountNum,
        inStock: stockCountNum > 0,
        rating: 4.8,
        reviewsCount: 1
      };
      onAddProduct(newProd);
    } else {
      const updatedProd: Product = {
        ...products.find(p => p.id === editingProductId)!,
        name,
        description: description || 'No description provided.',
        price: priceNum,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        image,
        category: resolvedCategory,
        sku,
        stockCount: stockCountNum,
        inStock: stockCountNum > 0
      };
      onUpdateProduct(updatedProd);
    }

    setIsDrawerOpen(false);
  };

  // Quick Inline Stock Status Toggle Switch
  const handleToggleStockStatus = (product: Product) => {
    const isCurrentlyInStock = product.inStock;
    const newStockCount = isCurrentlyInStock ? 0 : 10;
    const updated: Product = {
      ...product,
      inStock: !isCurrentlyInStock,
      stockCount: newStockCount
    };
    onUpdateProduct(updated);
  };

  // Compile CSV dataset and trigger download
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Original Price', 'Stock Status', 'Quantity'];
    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.category,
      p.price.toFixed(2),
      p.originalPrice ? p.originalPrice.toFixed(2) : '',
      p.inStock ? 'In Stock' : 'Out of Stock',
      p.stockCount
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bd_mart_inventory_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Catalog
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (stockFilter === 'in-stock') return matchesSearch && p.inStock;
    if (stockFilter === 'out-of-stock') return matchesSearch && !p.inStock;
    return matchesSearch;
  });

  return (
    <div id="product-inventory-view" className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6 font-sans">
      
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 block">
            Warehouse Logistics • প্রোডাক্ট ম্যানেজমেন্ট
          </span>
          <h1 className="text-3xl font-extrabold text-brand-indigo tracking-tight font-display uppercase mt-1">
            Product Inventory
          </h1>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-neutral-200 text-xs font-semibold rounded-lg hover:bg-neutral-50 text-neutral-700 uppercase transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            id="add-new-product-btn"
            onClick={openAddDrawer}
            className="flex items-center gap-1.5 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg uppercase transition-all shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4" />
            নতুন প্রোডাক্ট যোগ করুন (Add Product)
          </button>
        </div>
      </div>

      {/* Query Bar & Stock Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-neutral-150/60 shadow-xs">
        {/* Search */}
        <div className="w-full sm:max-w-xs relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="inventory-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Name, SKU, Category..."
            className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all"
          />
        </div>

        {/* Filtering Pills */}
        <div className="flex bg-neutral-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            id="filter-all-btn"
            onClick={() => setStockFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              stockFilter === 'all' ? 'bg-white text-brand-indigo shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            All ({products.length})
          </button>
          <button
            id="filter-instock-btn"
            onClick={() => setStockFilter('in-stock')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              stockFilter === 'in-stock' ? 'bg-white text-brand-indigo shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            In Stock ({products.filter(p => p.inStock).length})
          </button>
          <button
            id="filter-outstock-btn"
            onClick={() => setStockFilter('out-of-stock')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              stockFilter === 'out-of-stock' ? 'bg-white text-brand-indigo shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Out of Stock ({products.filter(p => !p.inStock).length})
          </button>
        </div>
      </div>

      {/* Main Table Showcase */}
      <div className="bg-white border border-neutral-150/60 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-150 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                <th className="py-3 px-4">Item Detail</th>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">In Stock Status</th>
                <th className="py-3 px-4 text-center">Qty Available</th>
                <th className="py-3 px-4 text-center">Modify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400">
                    No products matching search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} id={`inventory-row-${p.id}`} className="hover:bg-neutral-50/50 transition-colors">
                    
                    {/* Item Detail */}
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-10 aspect-[3/4] rounded-md overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                        <img src={p.image || null} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-brand-indigo truncate max-w-xs sm:max-w-md">{p.name}</h4>
                        <div className="flex gap-1.5 mt-1">
                          {p.colors.map(col => (
                            <span key={col.name} className="w-2.5 h-2.5 rounded-full border border-neutral-350" style={{ backgroundColor: col.value }} title={col.name} />
                          ))}
                          <span className="text-[10px] text-neutral-400">• Size {p.sizes.join(', ')}</span>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-4 px-4 font-mono text-xs text-neutral-500">
                      {p.sku}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-0.5 text-xs text-neutral-600 bg-neutral-100 rounded-sm">
                        {p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 text-right font-semibold text-brand-indigo">
                      ৳{p.price.toLocaleString()}
                      {p.originalPrice && (
                        <div className="text-[10px] line-through text-neutral-400 font-normal">
                          ৳{p.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* Stock status toggle */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <button
                          id={`inline-stock-toggle-${p.id}`}
                          onClick={() => handleToggleStockStatus(p)}
                          className="focus:outline-none transition-transform active:scale-95 text-neutral-600"
                          title="Flick active stock status"
                        >
                          {p.inStock ? (
                            <div className="flex items-center gap-1 cursor-pointer bg-emerald-50 text-emerald-800 border border-emerald-200 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              Active Stock
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 cursor-pointer bg-red-50 text-red-800 border border-red-200 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                              Out of Stock
                            </div>
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-4 text-center font-mono font-semibold text-neutral-600">
                      {p.stockCount}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          id={`edit-item-btn-${p.id}`}
                          onClick={() => openEditDrawer(p)}
                          className="p-1.5 rounded-md text-neutral-500 hover:text-brand-indigo hover:bg-neutral-100 transition-colors"
                          title="Edit Product Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-item-btn-${p.id}`}
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide Drawer container (Add/Edit Product form) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              id="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Sliding Drawer Body */}
            <motion.div
              id="drawer-body"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col font-sans"
            >
              {/* Drawer header */}
              <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-brand-indigo font-display uppercase tracking-wide">
                    {drawerMode === 'add' ? 'নতুন প্রোডাক্ট যোগ করুন (Add Product)' : 'প্রোডাক্ট এডিট করুন (Edit Product)'}
                  </h3>
                  <p className="text-xs text-neutral-400">ইনভেন্টরি রেকর্ড ও ড্রপশিপিং স্টক ম্যানেজার</p>
                </div>
                <button
                  id="close-drawer-btn"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer content (Form) */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-semibold">
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                    প্রোডাক্টের নাম (Product Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: প্রিমিয়াম কটন পাঞ্জাবি"
                    className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                      এসকেইউ কোড (SKU) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="form-sku-input"
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="BD-APRL-001"
                      className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                      ক্যাটেগরি (Category) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="form-category-select"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (e.target.value === '__NEW__') {
                          setIsCustomCategory(true);
                        } else {
                          setIsCustomCategory(false);
                        }
                      }}
                      className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all font-semibold text-neutral-800"
                      required
                    >
                      <option value="Panjabi">পাঞ্জাবি (Panjabi)</option>
                      <option value="Saree">শাড়ি (Saree)</option>
                      <option value="Salwar Kameez">সালোয়ার কামিজ (Salwar Kameez)</option>
                      <option value="Woven Shirt">শার্ট (Shirts)</option>
                      <option value="Suits & Blazers">ব্লেজার (Suits & Blazers)</option>
                      <option value="Knitwear">কটন টি-শার্ট ও নিটওয়্যার (Knitwear)</option>
                      <option value="Pants & Shorts">প্যান্ট (Pants)</option>
                      <option value="Dresses">মেয়েদের থ্রি-পিস ও ড্রেস (Dresses)</option>
                      <option value="Accessories">অন্যান্য সামগ্রী (Accessories)</option>
                      
                      {/* Dynamic list of custom categories present in database */}
                      {Array.from(new Set(products.map(p => p.category)))
                        .filter(cat => ![
                          'Panjabi', 'Saree', 'Salwar Kameez', 'Woven Shirt', 'Suits & Blazers', 
                          'Knitwear', 'Pants & Shorts', 'Dresses', 'Accessories'
                        ].includes(cat))
                        .map(cat => (
                          <option key={cat} value={cat}>{cat} (কাস্টম ধরন)</option>
                        ))
                      }
                      <option value="__NEW__">➕ নতুন ধরন/ক্যাটেগরি লিখুন (Type Custom...)</option>
                    </select>

                    {(category === '__NEW__' || isCustomCategory) && (
                      <div className="mt-2 p-2.5 bg-orange-50/40 border border-orange-100 rounded-lg space-y-1 animate-fade-in">
                        <label className="text-[10px] font-bold text-orange-800 uppercase block">নতুন ধরনের নাম (Type Custom Category Name) *</label>
                        <input
                          type="text"
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                          placeholder="যেমন: পাঞ্জাবি, শাড়ি, জুয়েলারি বা অন্য নাম"
                          className="w-full bg-white border border-orange-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-orange-500"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                      মূল্য (৳) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="form-price-input"
                      type="number"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="2500"
                      className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                      আগের মূল্য (৳)
                    </label>
                    <input
                      id="form-compareprice-input"
                      type="number"
                      step="1"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="3500"
                      className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                      স্টক সংখ্যা <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="form-stock-input"
                      type="number"
                      value={stockCount}
                      onChange={(e) => setStockCount(e.target.value)}
                      placeholder="50"
                      className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Cover Image Input with High Quality Preset Selectors */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                    প্রোডাক্টের কভার ইমেজ (Cover Image) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="form-image-input"
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-... অথবা ফাইল আপলোড করুন"
                      className="flex-1 bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all truncate"
                      required
                    />
                    
                    <label className="shrink-0 bg-indigo-600 hover:bg-neutral-900 text-white font-bold text-[11px] px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm active:scale-97">
                      📁 ফাইল আপলোড
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setImage(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                  </div>

                  {image && image.startsWith('data:image') && (
                    <div className="p-2 border border-emerald-100 bg-emerald-50/30 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-700">✓ ডিভাইস থেকে ছবি সফলভাবে নেওয়া হয়েছে</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setImage('')} 
                        className="text-[9px] text-rose-500 hover:underline font-bold"
                      >
                        মুছে ফেলুন (Clear)
                      </button>
                    </div>
                  )}

                  {/* Preset Selector Thumbnails */}
                  <div className="space-y-1.5 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                    <p className="text-[10px] font-bold text-neutral-600">
                      💡 কুইক ইমেজ লাইব্রেরী (ক্লিক করে ছবি নির্বাচন করুন):
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { name: 'পাঞ্জাবি', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400' },
                        { name: 'শাড়ি', url: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=400' },
                        { name: 'কামিজ', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400' },
                        { name: 'শার্ট', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400' },
                        { name: 'পোলো', url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=400' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          className={`aspect-[3/4] rounded-md overflow-hidden border-2 relative transition-all group ${
                            image === preset.url ? 'border-orange-500 scale-95 shadow-xs' : 'border-neutral-200 hover:border-neutral-400'
                          }`}
                          title={preset.name}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5 truncate">
                            {preset.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                    প্রোডাক্টের বিবরণ (Description)
                  </label>
                  <textarea
                    id="form-desc-input"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="যেমন সাইজ, ফেব্রিক কোয়ালিটি ও ফিটিং সম্পর্কিত তথ্য এখানে উল্লেখ করুন..."
                    className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all resize-none font-sans"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    id="form-cancel-btn"
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 py-2.5 border border-neutral-200 text-xs font-semibold text-neutral-500 hover:text-neutral-700 uppercase rounded-lg transition-colors"
                  >
                    বাতিল করুন
                  </button>
                  <button
                    id="form-submit-btn"
                    type="submit"
                    className="flex-1 py-2.5 bg-orange-600 text-white text-xs font-bold uppercase rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {drawerMode === 'add' ? 'প্রোডাক্ট সংরক্ষণ করুন' : 'পরিবর্তনগুলো সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
