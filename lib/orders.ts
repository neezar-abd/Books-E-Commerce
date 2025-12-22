import { supabase } from './supabase';

export interface Address {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export interface CreateOrderData {
  address_id: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: any;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_title: string;
  product_image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export const orderService = {
  // Create order from cart
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Please sign in to create order');

    // Get cart items
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (id, title, price, image, stock)
      `)
      .eq('user_id', user.id);

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Get address
    const { data: address } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', orderData.address_id)
      .single();

    if (!address) throw new Error('Address not found');

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        address_id: orderData.address_id,
        subtotal: orderData.subtotal,
        shipping_cost: orderData.shipping_cost,
        tax: orderData.tax,
        discount: orderData.discount,
        total: orderData.total,
        payment_method: orderData.payment_method,
        shipping_address: address,
        notes: orderData.notes,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_title: item.products.title,
      product_image: item.products.image,
      price: item.products.price,
      quantity: item.quantity,
      subtotal: item.products.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear cart
    const { error: clearError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (clearError) throw clearError;

    return order as Order;
  },

  // Get user's orders
  async getUserOrders(): Promise<Order[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error) throw error;
    return data;
  },

  // User addresses
  async getUserAddresses(): Promise<Address[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Please sign in');

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        ...address,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
