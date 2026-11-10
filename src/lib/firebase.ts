import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc 
} from 'firebase/firestore';
import { Product, Order } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/initialData';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
// Use specific database ID if provided in the applet config, else fallback to standard default database
const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export { db };

// Interface for database settings
export interface ShopSettings {
  shopName: string;
  supportPhone: string;
}

// Interface for registered users in DB
export interface RegisteredUser {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'admin' | 'customer';
  shopName?: string;
  address?: string;
}

// Interface for saved withdrawal accounts
export interface SavedAccount {
  id: string;
  label: string;
  type: string;
  number: string;
  details?: string;
}

// --------------------------------------------------------------------
// 1. PRODUCTS DB FUNCTIONS
// --------------------------------------------------------------------

export async function getProductsFromDb(): Promise<Product[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productsList: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      productsList.push({ id: docSnap.id, ...docSnap.data() } as Product);
    });

    // Auto-seed if database is empty
    if (productsList.length === 0) {
      console.log('No products found in Firestore. Seeding initial products...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      return INITIAL_PRODUCTS;
    }

    return productsList;
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    // Fallback to local storage or initial products if there is an error
    const saved = localStorage.getItem('bd_mart_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  }
}

export async function saveProductToDb(product: Product): Promise<void> {
  try {
    await setDoc(doc(db, 'products', product.id), product);
    console.log(`Product ${product.id} successfully saved to Firestore.`);
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
  }
}

export async function deleteProductFromDb(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', id));
    console.log(`Product ${id} successfully deleted from Firestore.`);
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
  }
}

// --------------------------------------------------------------------
// 2. ORDERS DB FUNCTIONS
// --------------------------------------------------------------------

export async function getOrdersFromDb(): Promise<Order[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const ordersList: Order[] = [];
    querySnapshot.forEach((docSnap) => {
      ordersList.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });

    // Sort by createdAt desc
    ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Auto-seed if database is empty
    if (ordersList.length === 0) {
      console.log('No orders found in Firestore. Seeding initial orders...');
      for (const ord of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', ord.id), ord);
      }
      return INITIAL_ORDERS;
    }

    return ordersList;
  } catch (error) {
    console.error('Error fetching orders from Firestore:', error);
    const saved = localStorage.getItem('bd_mart_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  }
}

export async function saveOrderToDb(order: Order): Promise<void> {
  try {
    await setDoc(doc(db, 'orders', order.id), order);
    console.log(`Order ${order.id} successfully saved to Firestore.`);
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
  }
}

// --------------------------------------------------------------------
// 3. SHOP SETTINGS DB FUNCTIONS
// --------------------------------------------------------------------

export async function getShopSettingsFromDb(): Promise<ShopSettings> {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'shop'));
    if (docSnap.exists()) {
      return docSnap.data() as ShopSettings;
    }
    // Default fallback
    const defaultSettings: ShopSettings = {
      shopName: localStorage.getItem('bd_mart_shop_name') || 'মাই অনলাইন শপ',
      supportPhone: localStorage.getItem('bd_mart_support_phone') || '০১৭xxxxxxxx'
    };
    await setDoc(doc(db, 'settings', 'shop'), defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Error fetching settings from Firestore:', error);
    return {
      shopName: localStorage.getItem('bd_mart_shop_name') || 'মাই অনলাইন শপ',
      supportPhone: localStorage.getItem('bd_mart_support_phone') || '০১৭xxxxxxxx'
    };
  }
}

export async function saveShopSettingsToDb(settings: ShopSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'shop'), settings);
    console.log('Shop settings successfully saved to Firestore.');
  } catch (error) {
    console.error('Error saving shop settings to Firestore:', error);
  }
}

// --------------------------------------------------------------------
// 4. REGISTERED USERS DB FUNCTIONS
// --------------------------------------------------------------------

export async function getRegisteredUsersFromDb(): Promise<RegisteredUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersList: RegisteredUser[] = [];
    querySnapshot.forEach((docSnap) => {
      usersList.push(docSnap.data() as RegisteredUser);
    });

    // Auto-seed default accounts if none exist
    if (usersList.length === 0) {
      console.log('No registered users found in Firestore. Seeding default system users...');
      const defaultUsers: RegisteredUser[] = [
        { name: 'Admin Administrator', email: 'admin@bdmart.com', phone: '01700000000', password: 'admin123', role: 'admin' },
        { name: 'Jannat Maya', email: 'customer@bdmart.com', phone: '01900000000', password: 'customer123', role: 'customer' },
        { name: 'MD Siyam', email: 'mdsiyam32112@gmail.com', phone: '01711111111', password: 'admin123', role: 'admin' }
      ];
      for (const u of defaultUsers) {
        await setDoc(doc(db, 'users', u.email), u);
      }
      return defaultUsers;
    }

    // Ensure mdsiyam32112@gmail.com is always present as an admin in the database
    const siyamEmail = 'mdsiyam32112@gmail.com';
    const siyamUser = usersList.find(u => u.email.toLowerCase() === siyamEmail.toLowerCase());
    if (!siyamUser) {
      const newSiyam: RegisteredUser = {
        name: 'MD Siyam',
        email: siyamEmail,
        phone: '01711111111',
        password: 'admin123',
        role: 'admin'
      };
      await setDoc(doc(db, 'users', siyamEmail), newSiyam);
      usersList.push(newSiyam);
    } else if (siyamUser.role !== 'admin') {
      siyamUser.role = 'admin';
      await setDoc(doc(db, 'users', siyamEmail), siyamUser);
    }

    return usersList;
  } catch (error) {
    console.error('Error fetching users from Firestore:', error);
    const saved = localStorage.getItem('bd_mart_registered_users');
    let localUsers: RegisteredUser[] = [];
    if (saved) {
      try {
        localUsers = JSON.parse(saved);
      } catch (e) {
        localUsers = [];
      }
    }
    
    // Ensure siyam is in local storage list if used
    const hasSiyamLocal = localUsers.some(u => u.email.toLowerCase() === 'mdsiyam32112@gmail.com');
    if (!hasSiyamLocal) {
      localUsers.push({
        name: 'MD Siyam',
        email: 'mdsiyam32112@gmail.com',
        phone: '01711111111',
        password: 'admin123',
        role: 'admin'
      });
      localStorage.setItem('bd_mart_registered_users', JSON.stringify(localUsers));
    } else {
      // Ensure role is admin in local storage
      localUsers = localUsers.map(u => u.email.toLowerCase() === 'mdsiyam32112@gmail.com' ? { ...u, role: 'admin' } : u);
      localStorage.setItem('bd_mart_registered_users', JSON.stringify(localUsers));
    }

    const fallbackList: RegisteredUser[] = [
      { name: 'Admin Administrator', email: 'admin@bdmart.com', phone: '01700000000', password: 'admin123', role: 'admin' },
      { name: 'Jannat Maya', email: 'customer@bdmart.com', phone: '01900000000', password: 'customer123', role: 'customer' },
      { name: 'MD Siyam', email: 'mdsiyam32112@gmail.com', phone: '01711111111', password: 'admin123', role: 'admin' }
    ];

    return localUsers.length > 0 ? localUsers : fallbackList;
  }
}

export async function saveRegisteredUserToDb(user: RegisteredUser): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.email), user);
    console.log(`User ${user.email} successfully saved to Firestore.`);
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
}

// --------------------------------------------------------------------
// 5. WITHDRAW ACCOUNTS DB FUNCTIONS
// --------------------------------------------------------------------

export async function getSavedAccountsFromDb(): Promise<SavedAccount[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'withdrawal_accounts'));
    const accountsList: SavedAccount[] = [];
    querySnapshot.forEach((docSnap) => {
      accountsList.push({ id: docSnap.id, ...docSnap.data() } as SavedAccount);
    });
    return accountsList;
  } catch (error) {
    console.error('Error fetching withdrawal accounts from Firestore:', error);
    const saved = localStorage.getItem('bd_mart_saved_accounts');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function saveSavedAccountToDb(account: SavedAccount): Promise<void> {
  try {
    await setDoc(doc(db, 'withdrawal_accounts', account.id), account);
    console.log(`Saved account ${account.id} successfully saved to Firestore.`);
  } catch (error) {
    console.error('Error saving withdrawal account to Firestore:', error);
  }
}

export async function deleteSavedAccountFromDb(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'withdrawal_accounts', id));
    console.log(`Saved account ${id} successfully deleted from Firestore.`);
  } catch (error) {
    console.error('Error deleting withdrawal account from Firestore:', error);
  }
}
