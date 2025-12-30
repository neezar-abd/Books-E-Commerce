const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nizarabdurr@gmail.com',
    pass: 'oaue arwk bjkz udew',
  },
});

// Template functions copied from email-templates.ts
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function generateAdminOrderNotificationEmail(data) {
  const itemsHtml = data.items
    .map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px;">${item.title}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; text-align: right; font-weight: 600;">${formatCurrency(item.subtotal)}</td>
      </tr>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pesanan Baru #${data.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.5;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      border: 1px solid #ddd;
    }
    .header {
      padding: 24px;
      border-bottom: 2px solid #000;
      background-color: #fff;
    }
    .header h1 {
      font-size: 20px;
      font-weight: 700;
      color: #000;
      margin-bottom: 8px;
    }
    .header .badge {
      display: inline-block;
      background-color: #000;
      color: #fff;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 24px;
    }
    .section {
      margin-bottom: 24px;
    }
    .section:last-child {
      margin-bottom: 0;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #000;
      margin-bottom: 12px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      padding: 6px 0;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #333;
      text-align: right;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    table th {
      background-color: #f5f5f5;
      padding: 10px 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000;
      border-bottom: 1px solid #ddd;
    }
    .totals {
      margin-top: 20px;
      border-top: 2px solid #000;
      padding-top: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      padding: 6px 0;
    }
    .total-row.grand {
      font-size: 16px;
      font-weight: 700;
      color: #000;
      padding-top: 8px;
    }
    .address-box {
      background-color: #f9f9f9;
      padding: 14px;
      border-left: 3px solid #000;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 24px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pesanan Baru</h1>
      <span class="badge">Perlu Diproses</span>
    </div>

    <div class="content">
      <div class="section">
        <div class="section-title">Informasi Pesanan</div>
        <div class="info-row">
          <span class="info-label">Nomor:</span>
          <span class="info-value">#${data.orderNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tanggal:</span>
          <span class="info-value">${formatDate(data.orderDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Metode:</span>
          <span class="info-value">${data.paymentMethod}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Pelanggan</div>
        <div class="info-row">
          <span class="info-label">Nama:</span>
          <span class="info-value">${data.customerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${data.customerEmail}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Telepon:</span>
          <span class="info-value">${data.customerPhone}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Alamat Pengiriman</div>
        <div class="address-box">
          <strong>${data.shippingAddress.recipient_name}</strong><br>
          ${data.shippingAddress.phone}<br>
          ${data.shippingAddress.address_line1}<br>
          ${data.shippingAddress.address_line2 ? data.shippingAddress.address_line2 + '<br>' : ''}
          ${data.shippingAddress.city}, ${data.shippingAddress.province} ${data.shippingAddress.postal_code}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Produk</div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Produk</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Harga</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Ringkasan</div>
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(data.subtotal)}</span>
        </div>
        <div class="total-row">
          <span>Ongkos Kirim:</span>
          <span>${formatCurrency(data.shippingCost)}</span>
        </div>
        <div class="total-row">
          <span>Pajak:</span>
          <span>${formatCurrency(data.tax)}</span>
        </div>
        ${data.discount > 0 ? `
        <div class="total-row">
          <span>Diskon:</span>
          <span>-${formatCurrency(data.discount)}</span>
        </div>
        ` : ''}
        <div class="totals">
          <div class="total-row grand">
            <span>TOTAL:</span>
            <span>${formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Email otomatis dari Lumina Books</p>
      <p style="margin-top: 8px; color: #999;">Jangan balas email ini</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateCustomerOrderConfirmationEmail(data) {
  const itemsHtml = data.items
    .map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px;">${item.title}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; text-align: right; font-weight: 600;">${formatCurrency(item.subtotal)}</td>
      </tr>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Pesanan #${data.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.5;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      border: 1px solid #ddd;
    }
    .header {
      padding: 30px 24px;
      background-color: #000;
      color: #fff;
      text-align: center;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 24px;
    }
    .section {
      margin-bottom: 24px;
    }
    .section:last-child {
      margin-bottom: 0;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #000;
      margin-bottom: 12px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      padding: 6px 0;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #333;
      text-align: right;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    table th {
      background-color: #f5f5f5;
      padding: 10px 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000;
      border-bottom: 1px solid #ddd;
    }
    .totals {
      margin-top: 20px;
      border-top: 2px solid #000;
      padding-top: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      padding: 6px 0;
    }
    .total-row.grand {
      font-size: 16px;
      font-weight: 700;
      color: #000;
      padding-top: 8px;
    }
    .address-box {
      background-color: #f9f9f9;
      padding: 14px;
      border-left: 3px solid #000;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 24px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pesanan Dikonfirmasi</h1>
      <p>Terima kasih telah berbelanja</p>
    </div>

    <div class="content">
      <div class="section">
        <div class="section-title">Informasi Pesanan</div>
        <div class="info-row">
          <span class="info-label">Nomor:</span>
          <span class="info-value">#${data.orderNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tanggal:</span>
          <span class="info-value">${formatDate(data.orderDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Metode:</span>
          <span class="info-value">${data.paymentMethod}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Alamat Pengiriman</div>
        <div class="address-box">
          <strong>${data.shippingAddress.recipient_name}</strong><br>
          ${data.shippingAddress.phone}<br>
          ${data.shippingAddress.address_line1}<br>
          ${data.shippingAddress.address_line2 ? data.shippingAddress.address_line2 + '<br>' : ''}
          ${data.shippingAddress.city}, ${data.shippingAddress.province} ${data.shippingAddress.postal_code}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Produk Anda</div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Produk</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Harga</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Ringkasan Pembayaran</div>
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(data.subtotal)}</span>
        </div>
        <div class="total-row">
          <span>Ongkos Kirim:</span>
          <span>${formatCurrency(data.shippingCost)}</span>
        </div>
        <div class="total-row">
          <span>Pajak:</span>
          <span>${formatCurrency(data.tax)}</span>
        </div>
        ${data.discount > 0 ? `
        <div class="total-row">
          <span>Diskon:</span>
          <span>-${formatCurrency(data.discount)}</span>
        </div>
        ` : ''}
        <div class="totals">
          <div class="total-row grand">
            <span>TOTAL:</span>
            <span>${formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Kami sedang memproses pesanan Anda</p>
      <p style="margin-top: 12px;">Lumina Books - Toko Buku Online</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Sample data
const sampleOrderData = {
  orderNumber: 'TEST20251226000099',
  customerName: 'Siti Aminah',
  customerEmail: 'siti@example.com',
  customerPhone: '08123456789',
  shippingAddress: {
    recipient_name: 'Siti Aminah',
    phone: '08123456789',
    address_line1: 'Jln. Raya Sudirman No. 123',
    address_line2: 'Apt. 5B',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postal_code: '12190',
  },
  items: [
    {
      title: 'Laskar Pelangi - Andrea Hirata',
      quantity: 2,
      price: 85000,
      subtotal: 170000,
    },
    {
      title: 'Negeri 5 Menara - Ahmad Fuadi',
      quantity: 1,
      price: 95000,
      subtotal: 95000,
    },
  ],
  subtotal: 265000,
  shippingCost: 25000,
  tax: 29250,
  discount: 0,
  total: 319250,
  paymentMethod: 'Bank Transfer',
  orderDate: new Date().toISOString(),
};

async function sendTestEmails() {
  try {
    // Send admin notification
    const adminHTML = generateAdminOrderNotificationEmail(sampleOrderData);
    await transporter.sendMail({
      from: 'nizarabdurr@gmail.com',
      to: 'nizarabdurr@gmail.com',
      subject: `Pesanan Baru #${sampleOrderData.orderNumber}`,
      html: adminHTML,
    });
    console.log('✅ Admin notification email sent!');

    // Send customer confirmation
    const customerHTML = generateCustomerOrderConfirmationEmail(sampleOrderData);
    await transporter.sendMail({
      from: 'nizarabdurr@gmail.com',
      to: sampleOrderData.customerEmail,
      subject: `Konfirmasi Pesanan #${sampleOrderData.orderNumber}`,
      html: customerHTML,
    });
    console.log('✅ Customer confirmation email sent!');

    console.log('\n📧 Both test emails sent successfully!');
    console.log('📬 Check your inbox for admin notification');
    console.log('📬 Check siti@example.com email address for customer confirmation');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending emails:', error.message);
    process.exit(1);
  }
}

sendTestEmails();
