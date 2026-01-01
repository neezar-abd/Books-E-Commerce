import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateAdminOrderNotificationEmail, generateCustomerOrderConfirmationEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email';

// Create admin client lazily to avoid build-time errors
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const {
      user_id,
      order_number,
      subtotal,
      shipping_cost,
      tax,
      discount,
      total,
      payment_method,
      shipping_address,
      order_items,
    } = body;

    console.log('📝 [API] Creating order:', order_number);

    // Create order using service role client (bypasses RLS)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        user_id,
        status: 'pending',
        payment_status: 'pending',
        payment_method,
        subtotal,
        shipping_cost,
        tax,
        discount,
        total,
        shipping_address,
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ [API] Order creation failed:', orderError);
      throw orderError;
    }
    console.log('✅ [API] Order created:', order.id);

    // Create order items
    const orderItemsData = order_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_title: item.product_title,
      product_image: item.product_image,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('❌ [API] Order items creation failed:', itemsError);
      throw itemsError;
    }
    console.log('✅ [API] Order items created');

    // Clear cart
    const { error: clearError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', user_id);

    if (clearError) {
      console.error('❌ [API] Cart clear failed:', clearError);
      throw clearError;
    }
    console.log('✅ [API] Cart cleared');

    // Send email notifications
    try {
      // Get user profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user_id)
        .single();

      const baseEmailData = {
        orderNumber: order.order_number,
        customerName: profile?.full_name || shipping_address.recipient_name,
        customerEmail: profile?.email || shipping_address.email,
        customerPhone: profile?.phone || shipping_address.recipient_phone,
        shippingAddress: {
          recipient_name: shipping_address.recipient_name,
          phone: shipping_address.recipient_phone,
          address_line1: shipping_address.address,
          city: shipping_address.city,
          province: shipping_address.province,
          postal_code: shipping_address.postal_code,
        },
        items: order_items,
        subtotal,
        shippingCost: shipping_cost,
        tax,
        discount,
        total,
        paymentMethod: payment_method,
        orderDate: order.created_at,
      };

      console.log('📧 [API] Sending email notifications...');

      // Group order items by store
      const itemsByStore: { [storeId: string]: any[] } = {};
      order_items.forEach((item: any) => {
        if (!item.store_id) return;
        if (!itemsByStore[item.store_id]) {
          itemsByStore[item.store_id] = [];
        }
        itemsByStore[item.store_id].push(item);
      });

      // Send email to each seller
      for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
        try {
          // Fetch store email
          const { data: store } = await supabaseAdmin
            .from('stores')
            .select('name, email')
            .eq('id', storeId)
            .single();

          if (store?.email) {
            const sellerEmailData = {
              ...baseEmailData,
              items: storeItems, // Only items from this store
              subtotal: storeItems.reduce((sum: number, item: any) => sum + item.subtotal, 0),
              // Recalculate totals for this store's items
              total: storeItems.reduce((sum: number, item: any) => sum + item.subtotal, 0),
            };

            console.log(`📨 [API] Sending seller notification to ${store.name} (${store.email})`);
            const sellerEmailSent = await sendEmail({
              to: store.email,
              subject: `🎉 Pesanan Baru #${order.order_number} untuk ${store.name}`,
              html: generateAdminOrderNotificationEmail(sellerEmailData),
            });

            if (sellerEmailSent) {
              console.log(`✅ [API] Seller email sent to ${store.name}`);
            } else {
              console.log(`⚠️ [API] Failed to send email to ${store.name}`);
            }
          } else {
            console.log(`⚠️ [API] No email found for store ${storeId}`);
          }
        } catch (storeError) {
          console.error(`❌ [API] Error sending email for store ${storeId}:`, storeError);
        }
      }

      // Send confirmation email to customer
      const customerEmail = profile?.email || shipping_address.email;
      if (customerEmail) {
        console.log(`📨 [API] Sending customer confirmation to: ${customerEmail}`);
        const customerEmailSent = await sendEmail({
          to: customerEmail,
          subject: `Konfirmasi Pesanan #${order.order_number} - Zaree`,
          html: generateCustomerOrderConfirmationEmail(baseEmailData),
        });

        if (customerEmailSent) {
          console.log('✅ [API] Customer email sent successfully');
        } else {
          console.log('⚠️ [API] Failed to send customer email');
        }
      } else {
        console.log('⚠️ [API] Customer email not found');
      }
    } catch (emailError) {
      console.error('❌ [API] Email notification error:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error: any) {
    console.error('❌ [API] Order creation failed:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
