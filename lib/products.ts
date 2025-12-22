import { supabase } from './supabase';

export interface Product {
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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export const productService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .limit(8);

    if (error) throw error;
    return data || [];
  },

  // Get bestseller products
  async getBestsellers(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_bestseller', true)
      .limit(4);

    if (error) throw error;
    return data || [];
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get products by category
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId);

    if (error) throw error;
    return data || [];
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) throw error;
    return data || [];
  },

  // Get all categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },
};
