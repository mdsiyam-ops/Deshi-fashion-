import React, { useState } from 'react';
import { Search, MapPin, Phone, Mail, Calendar, MessageSquare, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Order } from '../types';

interface OrderManagementProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateOrderCourierStatus: (orderId: string, courierStatus: string) => void;
}

function CourierStatusUpdater({ 
  orderId, 
  initialValue, 
  onUpdate 
}: { 
  orderId: string; 
  initialValue: string; 
  onUpdate: (orderId: string, courierStatus: string) => void 
}) {
  const [val, setVal] = useState(initialValue);
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    onUpdate(orderId, val);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        কুরিয়ার স্ট্যাটাস (Courier):
      </span>
      <div className="flex gap-1 items-center">
        <input
          id={`courier-status-input-${orderId}`}
          type="text"
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setIsSaved(false);
          }}
          placeholder="যেমন: প্যাক করা হচ্ছে / কুরিয়ারে হস্তান্তর করা হয়েছে"
          className="px-2 py-1 text-xs border border-neutral-250 rounded focus:outline-none focus:border-brand-indigo bg-white font-medium text-neutral-700 w-[160px] md:w-[220px]"
        />
        <button
          onClick={handleSave}
          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
            isSaved 
              ? 'bg-emerald-600 text-white' 
              : 'bg-brand-indigo hover:bg-neutral-900 text-white'
          }`}
        >
          {isSaved ? 'সংরক্ষিত!' : 'আপডেট'}
        </button>
      </div>
    </div>
  );
}

export default function OrderManagement({ orders, onUpdateOrderStatus, onUpdateOrderCourierStatus }: OrderManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    onUpdateOrderStatus(orderId, status);
  };

  const getStatusBadgeStyle = (status: Order['status']) => {
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

  // Filter logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div id="admin-orders-view" className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6 font-sans">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 block">
            Fulfillment Dashboard
          </span>
          <h1 className="text-3xl font-extrabold text-brand-indigo tracking-tight font-display uppercase mt-1">
            Order Management
          </h1>
        </div>
      </div>

      {/* Query Bar and Filtering Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-lg border border-neutral-150/60 shadow-xs items-center">
        {/* Search */}
        <div className="md:col-span-6 relative w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="orders-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset to first page on search
            }}
            placeholder="Search Customer Name, Order ID, Phone Number..."
            className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all"
          />
        </div>

        {/* Status Category Filter dropdown */}
        <div className="md:col-span-3">
          <select
            id="orders-status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-indigo focus:bg-white transition-all font-semibold text-neutral-700"
          >
            <option value="all">All Stages ({orders.length})</option>
            <option value="Pending">Pending ({orders.filter(o => o.status === 'Pending').length})</option>
            <option value="Shipped">Shipped ({orders.filter(o => o.status === 'Shipped').length})</option>
            <option value="Delivered">Delivered ({orders.filter(o => o.status === 'Delivered').length})</option>
          </select>
        </div>

        {/* Counter readout */}
        <div className="md:col-span-3 text-right text-xs font-semibold text-neutral-400">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders Cataloging Stack */}
      <div className="space-y-6">
        {paginatedOrders.length === 0 ? (
          <div className="bg-white border border-neutral-150/60 rounded-lg py-16 text-center text-neutral-400 shadow-xs">
            <AlertCircle className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm">No transaction orders match your filters.</p>
          </div>
        ) : (
          paginatedOrders.map((o) => (
            <div
              key={o.id}
              id={`order-card-${o.id}`}
              className="bg-white border border-neutral-150/60 rounded-lg overflow-hidden shadow-xs"
            >
              
              {/* Card Header Banner */}
              <div className="px-5 py-3.5 bg-neutral-50/60 border-b border-neutral-150 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-brand-indigo tracking-tight">
                    {o.id}
                  </span>
                  <span className="text-xs text-neutral-400 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                    {formatDate(o.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Courier Status component */}
                  <CourierStatusUpdater 
                    orderId={o.id} 
                    initialValue={o.courierStatus || ''} 
                    onUpdate={onUpdateOrderCourierStatus} 
                  />

                  {/* Status state dropdown menu */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Stage:
                    </span>
                    <select
                      id={`status-dropdown-${o.id}`}
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as any)}
                      className={`px-3 py-1 text-xs font-bold uppercase rounded-sm border focus:outline-none transition-all ${getStatusBadgeStyle(o.status)}`}
                    >
                      <option value="Pending">🕒 Pending</option>
                      <option value="Shipped">🚚 Shipped</option>
                      <option value="Delivered">✅ Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card Body Grid (2 columns on md) */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Customer and Shipping Logistics (Md: 5 cols) */}
                <div className="md:col-span-5 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Consignee Details
                  </h4>
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-brand-indigo text-white font-bold rounded-full flex items-center justify-center uppercase text-xs border border-brand-indigo/20 flex-shrink-0">
                      {o.customerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <p className="font-bold text-brand-indigo text-sm truncate">{o.customerName}</p>
                      
                      <div className="flex items-center text-xs text-neutral-500">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-neutral-400 flex-shrink-0" />
                        <span className="font-mono">{o.customerPhone}</span>
                      </div>
                      
                      {o.customerEmail && (
                        <div className="flex items-center text-xs text-neutral-500">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-neutral-400 flex-shrink-0" />
                          <span className="truncate">{o.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-neutral-100" />

                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Shipping Destination
                    </h5>
                    <div className="flex items-start text-xs text-neutral-600 leading-relaxed">
                      <MapPin className="w-4 h-4 mr-2 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <span>{o.customerAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Items and Ledger Ledger (Md: 7 cols) */}
                <div className="md:col-span-7 flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-100 pt-5 md:pt-0 md:pl-6 gap-4">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                      Purchased Fashion List
                    </h4>
                    
                    {/* Inner items list */}
                    <div className="space-y-3">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex gap-3 items-center justify-between">
                          <div className="flex gap-3 items-center min-w-0">
                            <div className="w-9 aspect-[3/4] rounded-md overflow-hidden bg-neutral-100 border border-neutral-150 flex-shrink-0">
                              <img src={item.product.image || null} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-semibold text-brand-indigo truncate">{item.product.name}</h5>
                              <div className="flex gap-1.5 mt-0.5 text-[10px]">
                                <span className="text-neutral-500">Size: {item.selectedSize}</span>
                                <span className="text-neutral-400">•</span>
                                <span className="text-neutral-500">Color: {item.selectedColor}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-right flex-shrink-0">
                            <span className="text-neutral-400">Qty {item.quantity}</span>
                            <p className="font-semibold text-brand-indigo mt-0.5">৳{item.product.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes & Price Summary */}
                  <div className="space-y-4 pt-3 border-t border-neutral-100">
                    
                    {/* Buyer notes (if present) */}
                    {o.notes && (
                      <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div className="text-[11px] text-indigo-800 font-sans leading-relaxed">
                          <strong className="font-semibold">Buyer Directive:</strong> "{o.notes}"
                        </div>
                      </div>
                    )}

                    {/* Total invoice ledger */}
                    <div className="space-y-1.5 pt-1">
                      {o.shippingFee !== undefined && (
                        <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                          <span>ডেলিভারি চার্জ (Shipping Fee):</span>
                          <span className="font-semibold font-sans">৳{o.shippingFee}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                        <span className="text-xs uppercase font-bold tracking-wider text-neutral-500">
                          Total Cash on Delivery:
                        </span>
                        <span className="text-base font-black text-brand-indigo font-sans">
                          ৳{o.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-neutral-150/60 p-4 rounded-lg shadow-xs">
          <p className="text-xs text-neutral-500">
            Page <strong className="text-brand-indigo">{currentPage}</strong> of <strong className="text-brand-indigo">{totalPages}</strong>
          </p>
          <div className="flex gap-2">
            <button
              id="orders-prev-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={`p-2 border rounded-lg text-neutral-500 hover:bg-neutral-50 transition-colors ${
                currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="orders-next-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className={`p-2 border rounded-lg text-neutral-500 hover:bg-neutral-50 transition-colors ${
                currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
