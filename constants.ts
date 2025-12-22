import { Product, Deal, BlogPost, Testimonial } from './types';

// Konten dipilih untuk estetika minimalis dan editorial

export const HERO_PRODUCTS = [
  {
    id: 1,
    name: "Fiksi Modern",
    count: "1.200+ Judul",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    price: 350000
  },
  {
    id: 2,
    name: "Desain & Seni",
    count: "850+ Judul",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    price: 650000
  }
];

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000', // Will be fetched from DB in real app
    title: "The Midnight Library",
    category: "Fiction",
    price: 155000,
    originalPrice: 200000,
    rating: 4.8,
    discount: 25,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    type: "Other"
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: "Atomic Habits",
    category: "Non-Fiction",
    price: 175000,
    originalPrice: 230000,
    rating: 4.9,
    discount: 24,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
    type: "Other"
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: "Sapiens",
    category: "Non-Fiction",
    price: 195000,
    originalPrice: 260000,
    rating: 4.7,
    discount: 25,
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80",
    type: "Other"
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: "The Seven Husbands of Evelyn Hugo",
    category: "Fiction",
    price: 158000,
    originalPrice: 210000,
    rating: 4.9,
    discount: 25,
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&q=80",
    type: "Other"
  }
];

export const DEALS: Deal[] = [
  {
    id: 1,
    title: "Koleksi Murakami",
    category: "Box Set",
    price: 1250000,
    originalPrice: 1750000,
    rating: 5.0,
    discount: 30,
    image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    endTime: "2024-12-31"
  },
  {
    id: 2,
    title: "Penguin Classics",
    category: "Klasik",
    price: 590000,
    originalPrice: 880000,
    rating: 4.9,
    discount: 33,
    image: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    endTime: "2024-12-31"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Siti Nurhaliza",
    role: "Dosen Sastra",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "Kurasi di Lumina sangat istimewa. Saya menemukan edisi langka dengan sampul yang merupakan karya seni sejati.",
    rating: 5.0
  },
  {
    id: 2,
    name: "Budi Santoso",
    role: "Art Director",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "Saya suka seleksi minimalisnya. Membantu saya menemukan buku yang tidak hanya enak dibaca tapi juga indah di rak.",
    rating: 5.0
  }
];

export const BLOGS: BlogPost[] = [
  {
    id: 1,
    date: "15 April 2024",
    title: "Kembalinya Sampul Buku Minimalis",
    description: "Mengapa tipografi sederhana dan ruang negatif mendominasi rak buku.",
    image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    date: "14 April 2024",
    title: "Kurasi Perpustakaan Rumah Anda",
    description: "Tips menata koleksi untuk estetika dan kemudahan akses.",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    date: "12 April 2024",
    title: "10 Buku Seni Terbaik untuk Meja Kopi",
    description: "Inspirasi visual yang menjadi pusat perhatian ruang tamu Anda.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  }
];