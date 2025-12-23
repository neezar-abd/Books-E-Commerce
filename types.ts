export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  discount?: number;
  isNew?: boolean;
  type: 'Chair' | 'Nightstand' | 'Sofa' | 'Lighting' | 'Other';
}

export interface Deal {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  image: string;
  discount: number;
  endTime: string;
}

export interface BlogPost {
  id: number;
  date: string;
  title: string;
  description: string;
  image: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

// Admin Types
export interface AdminUser {
  id: string;
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  user_id: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method: string;
  shipping_address: any;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    phone: string;
  };
}

export interface AdminProduct {
  id: string;
  title: string;
  author: string;
  category_id: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  discount: number;
  stock: number;
  rating: number;
  review_count: number;
  image: string | null;
  isbn: string | null;
  publisher: string | null;
  publication_year: number | null;
  pages: number | null;
  language: string;
  is_featured: boolean;
  is_bestseller: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
  };
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  lowStockProducts: number;
}