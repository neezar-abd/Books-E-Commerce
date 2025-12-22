import { supabase } from './supabase';

// Check if current user is admin
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Get current user profile with role
export async function getCurrentUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Dashboard Statistics
export async function getDashboardStats() {
  try {
    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'paid');

    const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get low stock products
    const { count: lowStockProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock', 10);

    return {
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalRevenue,
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      lowStockProducts: lowStockProducts || 0,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
}

// Get recent orders
export async function getRecentOrders(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (full_name),
        order_items (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting recent orders:', error.message || error);
    throw error;
  }
}

// Get all orders with filters
export async function getAllOrders(filters?: {
  status?: string;
  payment_status?: string;
  search?: string;
}) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        profiles (full_name, phone)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }

    if (filters?.search) {
      query = query.ilike('order_number', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'shipped') {
      updates.shipped_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Update payment status
export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  try {
    const updates: any = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    };

    if (paymentStatus === 'paid') {
      updates.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

// Update tracking number
export async function updateTrackingNumber(orderId: string, trackingNumber: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating tracking number:', error);
    throw error;
  }
}

// Get all users
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

// Update user role
export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Product Management
export async function getAllProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all products:', error);
    throw error;
  }
}

// Create product
export async function createProduct(productData: any) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Update product
export async function updateProduct(productId: string, productData: any) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Delete product
export async function deleteProduct(productId: string) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Get all categories
export async function getAllCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
}
