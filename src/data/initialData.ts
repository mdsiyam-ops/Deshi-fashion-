import { Product, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Atelier Oversized Wool Coat',
    description: 'Elevated with architectural shoulders, a double-breasted closure, and a premium double-faced wool blend. Perfect for transition season layering. This signature coat combines minimalist structure with luxurious drape, featuring deep welt pockets and tailored lapels.',
    price: 21735.00,
    originalPrice: 28175.00,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Oatmeal', value: '#E1D9D1' },
      { name: 'Camel', value: '#C19A6B' },
      { name: 'Charcoal Black', value: '#2C2C2C' }
    ],
    category: 'Outerwear',
    inStock: true,
    sku: 'BD-COAT-001',
    stockCount: 14,
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: 'prod-2',
    name: 'Classic Double-Breasted Blazer',
    description: 'An unstructured blazer crafted from recycled Italian wool blend fabric, offering a comfortable, relaxed drape with standard notch lapels. It features dynamic double-vent styling, full interior lining, and premium tonal buttons.',
    price: 15525.00,
    originalPrice: 20125.00,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Navy', value: '#1E293B' },
      { name: 'Noir Black', value: '#0F172A' },
      { name: 'Houndstooth', value: '#475569' }
    ],
    category: 'Suits & Blazers',
    inStock: true,
    sku: 'BD-BLZR-002',
    stockCount: 8,
    rating: 4.9,
    reviewsCount: 92
  },
  {
    id: 'prod-3',
    name: 'Atelier Silk Knit Sweater',
    description: 'Spun from clean organic silk and high-twist fine cotton yarn. Designed for an ultra-soft feel, natural moisture-wicking comfort, and a gorgeous low-profile mock collar. This sweater exhibits elegant micro-ribbing details on cuffs and hem.',
    price: 10925.00,
    image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Cream', value: '#FDFBF7' },
      { name: 'Sage Green', value: '#9CA3AF' },
      { name: 'Soft Taupe', value: '#D1D5DB' }
    ],
    category: 'Knitwear',
    inStock: true,
    sku: 'BD-SWTR-003',
    stockCount: 22,
    rating: 4.7,
    reviewsCount: 148
  },
  {
    id: 'prod-4',
    name: 'Modern Pleated Trousers',
    description: 'Crafted from sustainable tencel and combed cotton gabardine, featuring a fluid straight-leg silhouette with structured front pleats. Designed with an adjustable hidden waistband, button-through back pockets, and clean blind-stitched cuffs.',
    price: 12650.00,
    originalPrice: 16100.00,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Sand Beige', value: '#D2B48C' },
      { name: 'Olive Drab', value: '#556B2F' },
      { name: 'Ink Navy', value: '#1A2436' }
    ],
    category: 'Pants & Shorts',
    inStock: true,
    sku: 'BD-TRSR-004',
    stockCount: 11,
    rating: 4.6,
    reviewsCount: 76
  },
  {
    id: 'prod-5',
    name: 'Minimalist Linen Utility Dress',
    description: 'Cut from crisp, heavy-weight Belgian flax linen, featuring structural front pockets, a concealed full placket, and a soft self-tie cord. Wear loose for a relaxed silhouette, or belted for structured daily tailoring.',
    price: 14375.00,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=1200'
    ],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Sage Green', value: '#708238' },
      { name: 'Off-White', value: '#F8F8FF' },
      { name: 'Terracotta', value: '#E2725B' }
    ],
    category: 'Dresses',
    inStock: false,
    sku: 'BD-DRSS-005',
    stockCount: 0,
    rating: 4.5,
    reviewsCount: 38
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9842',
    customerName: 'Amina Rahman',
    customerPhone: '+880 1712-345678',
    customerAddress: 'House 42, Road 12, Banani, Dhaka',
    customerEmail: 'amina@example.com',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedSize: 'M',
        selectedColor: 'Oatmeal'
      }
    ],
    totalPrice: 21735.00,
    status: 'Pending',
    createdAt: '2026-07-11T02:34:00-07:00',
    notes: 'Please call before delivery.'
  },
  {
    id: 'ORD-9839',
    customerName: 'Asif Zaman',
    customerPhone: '+880 1819-876543',
    customerAddress: 'Flat 4B, Building 17, Gulshan-2, Dhaka',
    customerEmail: 'asif.zaman@example.com',
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        selectedSize: 'L',
        selectedColor: 'Noir Black'
      },
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 1,
        selectedSize: 'L',
        selectedColor: 'Cream'
      }
    ],
    totalPrice: 26450.00,
    status: 'Shipped',
    createdAt: '2026-07-10T15:12:00-07:00',
    notes: 'Leave with security guard if not available.'
  },
  {
    id: 'ORD-9832',
    customerName: 'Tasnim Chowdhury',
    customerPhone: '+880 1511-223344',
    customerAddress: 'Plot 204, Sector 4, Uttara, Dhaka',
    customerEmail: 'tasnim@example.com',
    items: [
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 1,
        selectedSize: 'M',
        selectedColor: 'Sand Beige'
      }
    ],
    totalPrice: 12650.00,
    status: 'Delivered',
    createdAt: '2026-07-09T10:45:00-07:00'
  },
  {
    id: 'ORD-9811',
    customerName: 'Kazi Mahbub',
    customerPhone: '+880 1912-998877',
    customerAddress: 'Avenue 5, Mirpur DOHS, Dhaka',
    customerEmail: 'kazi@example.com',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedSize: 'XL',
        selectedColor: 'Charcoal Black'
      }
    ],
    totalPrice: 21735.00,
    status: 'Delivered',
    createdAt: '2026-07-08T18:22:00-07:00',
    notes: 'Prefer afternoon delivery.'
  }
];
