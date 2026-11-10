export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  sizes: string[];
  colors: { name: string; value: string }[];
  category: string;
  inStock: boolean;
  sku: string;
  stockCount: number;
  rating: number;
  reviewsCount: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  createdAt: string;
  notes?: string;
  shippingFee?: number;
  courierStatus?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  phone?: string;
  shopName?: string;
  address?: string;
}

export type AppView = 'storefront' | 'admin-dashboard' | 'admin-inventory' | 'admin-orders' | 'login';

export interface Transaction {
  id: string;
  desc: string;
  type: 'Credit' | 'Debit';
  amt: number;
  date: string;
}

