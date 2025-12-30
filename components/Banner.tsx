'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Banner {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    bg_color: string;
    button_text: string;
    button_link: string;
}

// Fallback banners if database is empty
const FALLBACK_BANNERS: Banner[] = [
    {
        id: '1',
        title: 'Promo Akhir Tahun',
        subtitle: 'Diskon Hingga 50%',
        description: 'Belanja buku favorit dengan harga spesial',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        bg_color: 'from-primary to-primary/80',
        button_text: 'Belanja Sekarang',
        button_link: '/products',
    },
    {
        id: '2',
        title: 'Koleksi Terbaru',
        subtitle: 'New Arrivals 2025',
        description: 'Temukan buku-buku terbaru pilihan editor',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        bg_color: 'from-secondary to-secondary/80',
        button_text: 'Lihat Koleksi',
        button_link: '/products',
    },
    {
        id: '3',
        title: 'Flash Sale',
        subtitle: 'Hanya Hari Ini',
        description: 'Jangan lewatkan penawaran terbatas',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        bg_color: 'from-red-500 to-red-600',
        button_text: 'Belanja Sekarang',
        button_link: '/products',
    },
];

const SIDE_BANNERS = [
    {
        id: 1,
        title: 'Buku Pilihan',
        subtitle: '100% Original',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 2,
        title: 'Gratis Ongkir',
        subtitle: 'Min. Belanja 100rb',
        image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
];

const Banner: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>(FALLBACK_BANNERS);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data, error } = await supabase
                    .from('banners')
                    .select('*')
                    .eq('is_active', true)
                    .order('position', { ascending: true });

                if (error) {
                    console.log('Using fallback banners:', error.message);
                    setBanners(FALLBACK_BANNERS);
                } else if (data && data.length > 0) {
                    setBanners(data);
                }
            } catch (err) {
                console.log('Using fallback banners');
                setBanners(FALLBACK_BANNERS);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    return (
        <section className="py-4 bg-surface">
            <div className="container-80 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Main Banner Carousel */}
                    <div className="lg:col-span-2 relative rounded-2xl overflow-hidden group h-[280px] md:h-[340px]">
                        {banners.map((banner, index) => (
                            <div
                                key={banner.id}
                                className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${banner.bg_color}`} />
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                                />
                                <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 text-white">
                                    <span className="text-sm font-medium uppercase tracking-wider mb-2 opacity-90">
                                        {banner.subtitle}
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-bold mb-3">
                                        {banner.title}
                                    </h2>
                                    <p className="text-lg opacity-90 mb-6 max-w-md">
                                        {banner.description}
                                    </p>
                                    <a
                                        href={banner.button_link}
                                        className="bg-white text-primary px-6 py-2.5 rounded-full font-semibold w-fit hover:bg-opacity-90 transition-all"
                                    >
                                        {banner.button_text}
                                    </a>
                                </div>
                            </div>
                        ))}

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                                            ? 'bg-white w-6'
                                            : 'bg-white/50 hover:bg-white/70'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Side Banners */}
                    <div className="hidden lg:flex flex-col gap-4">
                        {SIDE_BANNERS.map((banner) => (
                            <div
                                key={banner.id}
                                className="relative rounded-2xl overflow-hidden h-[162px] group cursor-pointer"
                            >
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="font-bold text-lg">{banner.title}</h3>
                                    <p className="text-sm opacity-90">{banner.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;
