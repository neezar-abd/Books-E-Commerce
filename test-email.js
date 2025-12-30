#!/usr/bin/env node

/**
 * Script untuk test email API
 * Run dengan: node test-email.js
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    
    process.env[key.trim()] = value.trim();
  });
}

loadEnv();

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');

  // Check environment variables
  console.log('📋 Checking Environment Variables:');
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not Set'}`);
  console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not Set'}`);
  console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Not Set'}\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ EMAIL_USER atau EMAIL_PASSWORD tidak diset di .env.local');
    process.exit(1);
  }

  try {
    // Create transporter
    console.log('🔌 Connecting to Gmail SMTP...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Connected!\n');

    // Test send email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: `"Lumina Books Test" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: '🧪 Test Email - Lumina Books Email System',
      html: `
        <h2>🎉 Test Email Berhasil!</h2>
        <p>Sistem email notification Lumina Books sudah berfungsi dengan baik.</p>
        <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
        <hr>
        <p>Ini adalah email test otomatis. Abaikan jika ini bukan yang Anda harapkan.</p>
      `,
    });

    console.log('✅ Email berhasil dikirim!');
    console.log(`   Message ID: ${info.messageId}\n`);

    console.log('🎉 Semua konfigurasi email sudah benar!');
    console.log('   Email notification siap digunakan saat ada order masuk.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📌 Troubleshooting:');
    console.error('   1. Pastikan EMAIL_USER dan EMAIL_PASSWORD benar di .env.local');
    console.error('   2. Pastikan menggunakan Gmail App Password (bukan password biasa)');
    console.error('   3. Pastikan 2FA (Two-Factor Authentication) sudah diaktifkan di Gmail');
    console.error('   4. Coba buat app password baru di: https://myaccount.google.com/apppasswords');
    process.exit(1);
  }
}

testEmail();
