'use client';

import React from 'react';

const SIDE_BANNERS = [
    {
        id: 1,
        image: '/gambar/banner/Banner kanan atas.png',
    },
    {
        id: 2,
        image: '/gambar/banner/banner kanan bawah.png',
    },
];

const Banner: React.FC = () => {
    return (
        <section className="py-4 bg-surface">
            <div className="container-80">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Main Banner - 3.33:1 Aspect Ratio (1200x360) */}
                    <div className="lg:col-span-2 relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3.1/1' }}>
                        <img
                            src="/gambar/banner/Banner Kiri Atas.png"
                            alt="Main Banner"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Side Banners - 3.33:1 Aspect Ratio Each (1200x360) */}
                    <div className="hidden lg:flex flex-col gap-4">
                        {SIDE_BANNERS.map((banner) => (
                            <div
                                key={banner.id}
                                className="relative rounded-2xl overflow-hidden group cursor-pointer flex-1"
                            >
                                <img
                                    src={banner.image}
                                    alt="Banner"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;
