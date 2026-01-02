import { supabase } from './supabase';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

// Check if current user is admin
// Check if current user is admin (using server-side API to bypass RLS)
export async function isAdmin(): Promise<boolean> {
  try {
    console.log('[isAdmin] Getting session...');

    // Get current session to extract access token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.log('[isAdmin] No session or access token found');
      return false;
    }

    console.log('[isAdmin] Calling server API with token...');

    // Call API with access token in Authorization header
    const response = await fetch('/api/auth/check-admin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      console.error('[isAdmin] API response not OK:', response.status);
      return false;
    }

    const data = await response.json();
    console.log('[isAdmin] API response:', data);

    return data.isAdmin === true;
  } catch (error) {
    console.error('[isAdmin] Error checking admin status:', error);
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
      .select('*')
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
    // Validate required fields
    if (!productData.title || !productData.author || !productData.price) {
      throw new Error('Title, Author, dan Price adalah field yang wajib diisi');
    }

    // Ensure numeric fields are numbers
    const cleanData = {
      ...productData,
      price: Number(productData.price),
      original_price: productData.original_price ? Number(productData.original_price) : null,
      discount: productData.discount ? Number(productData.discount) : 0,
      stock: Number(productData.stock) || 0,
      rating: productData.rating ? Number(productData.rating) : 0,
      review_count: productData.review_count ? Number(productData.review_count) : 0,
      publication_year: productData.publication_year ? Number(productData.publication_year) : null,
      pages: productData.pages ? Number(productData.pages) : null,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([cleanData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Failed to create product');
    }
    return data;
  } catch (error: any) {
    console.error('Error creating product:', error.message || error);
    throw new Error(error.message || 'Failed to create product');
  }
}

// Update product
export async function updateProduct(productId: string, productData: any) {
  try {
    // Validate required fields
    if (!productData.title || !productData.author || !productData.price) {
      throw new Error('Title, Author, dan Price adalah field yang wajib diisi');
    }

    // Ensure numeric fields are numbers
    const cleanData = {
      ...productData,
      price: Number(productData.price),
      original_price: productData.original_price ? Number(productData.original_price) : null,
      discount: productData.discount ? Number(productData.discount) : 0,
      stock: Number(productData.stock) || 0,
      rating: productData.rating ? Number(productData.rating) : 0,
      review_count: productData.review_count ? Number(productData.review_count) : 0,
      publication_year: productData.publication_year ? Number(productData.publication_year) : null,
      pages: productData.pages ? Number(productData.pages) : null,
    };

    const { data, error } = await supabase
      .from('products')
      .update(cleanData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Failed to update product');
    }
    return data;
  } catch (error: any) {
    console.error('Error updating product:', error.message || error);
    throw new Error(error.message || 'Failed to update product');
  }
}

// Delete product
export async function deleteProduct(productId: string) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Failed to delete product');
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting product:', error.message || error);
    throw new Error(error.message || 'Failed to delete product');
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

// =============================================
// ANALYTICS & CHARTS
// =============================================

// Get revenue chart data (last 6 months)
export async function getRevenueChartData() {
  try {
    const months = [];
    const now = new Date();

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      months.push({
        month: format(date, 'MMM yyyy'),
        start: startOfMonth(date).toISOString(),
        end: endOfMonth(date).toISOString(),
      });
    }

    // Get revenue for each month
    const chartData = await Promise.all(
      months.map(async ({ month, start, end }) => {
        const { data } = await supabase
          .from('orders')
          .select('total')
          .eq('payment_status', 'paid')
          .gte('created_at', start)
          .lte('created_at', end);

        const revenue = data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

        return {
          month,
          revenue: Math.round(revenue),
        };
      })
    );

    return chartData;
  } catch (error) {
    console.error('Error getting revenue chart data:', error);
    throw error;
  }
}

// Get orders chart data (last 6 months)
export async function getOrdersChartData() {
  try {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      months.push({
        month: format(date, 'MMM yyyy'),
        start: startOfMonth(date).toISOString(),
        end: endOfMonth(date).toISOString(),
      });
    }

    const chartData = await Promise.all(
      months.map(async ({ month, start, end }) => {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', start)
          .lte('created_at', end);

        return {
          month,
          orders: count || 0,
        };
      })
    );

    return chartData;
  } catch (error) {
    console.error('Error getting orders chart data:', error);
    throw error;
  }
}

// Get top selling products
export async function getTopSellingProducts(limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        product_title,
        product_image,
        quantity
      `);

    if (error) throw error;

    // Aggregate by product
    const productMap = new Map();
    data?.forEach(item => {
      const existing = productMap.get(item.product_id) || {
        product_id: item.product_id,
        product_title: item.product_title,
        product_image: item.product_image,
        total_sold: 0,
      };
      existing.total_sold += item.quantity;
      productMap.set(item.product_id, existing);
    });

    // Sort and limit
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, limit);

    return topProducts;
  } catch (error) {
    console.error('Error getting top selling products:', error);
    throw error;
  }
}

// Get order status distribution
export async function getOrderStatusDistribution() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status');

    if (error) throw error;

    const distribution = data?.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution || {}).map(([status, count]) => ({
      status,
      count,
    }));
  } catch (error) {
    console.error('Error getting order status distribution:', error);
    throw error;
  }
}

// =============================================
// EXPORT DATA
// =============================================

// Export orders to CSV/Excel format
export async function exportOrders(format: 'csv' | 'excel' = 'csv') {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_number,
        created_at,
        customer_name,
        customer_phone,
        status,
        payment_status,
        payment_method,
        subtotal,
        shipping_cost,
        tax,
        total
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data for export
    const exportData = data?.map(order => ({
      'Order Number': order.order_number,
      'Date': new Date(order.created_at).toLocaleDateString('id-ID'),
      'Customer': order.customer_name || 'N/A',
      'Phone': order.customer_phone || 'N/A',
      'Status': order.status,
      'Payment Status': order.payment_status,
      'Payment Method': order.payment_method,
      'Subtotal': order.subtotal,
      'Shipping': order.shipping_cost,
      'Tax': order.tax,
      'Total': order.total,
    }));

    return exportData;
  } catch (error) {
    console.error('Error exporting orders:', error);
    throw error;
  }
}

// Export products
export async function exportProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        title,
        author,
        price,
        stock,
        isbn,
        publisher,
        publication_year,
        language,
        is_featured,
        is_bestseller,
        created_at,
        categories (name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const exportData = data?.map(product => ({
      'Title': product.title,
      'Author': product.author,
      'Category': product.categories?.[0]?.name || 'N/A',
      'Price': product.price,
      'Stock': product.stock,
      'ISBN': product.isbn || 'N/A',
      'Publisher': product.publisher || 'N/A',
      'Year': product.publication_year || 'N/A',
      'Language': product.language,
      'Featured': product.is_featured ? 'Yes' : 'No',
      'Bestseller': product.is_bestseller ? 'Yes' : 'No',
      'Created': new Date(product.created_at).toLocaleDateString('id-ID'),
    }));

    return exportData;
  } catch (error) {
    console.error('Error exporting products:', error);
    throw error;
  }
}

// Export users
export async function exportUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const exportData = data?.map(user => ({
      'Name': user.full_name || 'N/A',
      'Phone': user.phone || 'N/A',
      'Role': user.role,
      'Joined': new Date(user.created_at).toLocaleDateString('id-ID'),
    }));

    return exportData;
  } catch (error) {
    console.error('Error exporting users:', error);
    throw error;
  }
}

// =============================================
// Storage Functions for Image Upload
// =============================================

// Upload image to Supabase Storage
export async function uploadProductImage(file: File): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Delete image from Supabase Storage
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/storage/v1/object/public/products/');
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    // Delete file
    const { error } = await supabase.storage
      .from('products')
      .remove([`products/${filePath}`]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// Get all images in storage bucket
export async function listProductImages() {
  try {
    const { data, error } = await supabase.storage
      .from('products')
      .list('products', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error listing images:', error);
    throw error;
  }
}
