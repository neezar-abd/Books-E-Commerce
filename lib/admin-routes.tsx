import React from 'react';
import { MdHome, MdShield, MdStore, MdShoppingCart, MdSettings, MdPeople, MdInventory } from 'react-icons/md';

export interface IRoute {
    name: string;
    layout: string;
    path: string;
    icon: React.ReactNode;
}

const routes: IRoute[] = [
    {
        name: 'Dashboard',
        layout: '/admin',
        path: 'dashboard',
        icon: <MdHome className="h-6 w-6" />,
    },
    {
        name: 'Moderasi Produk',
        layout: '/admin',
        path: 'moderation',
        icon: <MdShield className="h-6 w-6" />,
    },
    {
        name: 'Kelola Toko',
        layout: '/admin',
        path: 'stores',
        icon: <MdStore className="h-6 w-6" />,
    },
    {
        name: 'Produk',
        layout: '/admin',
        path: 'products',
        icon: <MdInventory className="h-6 w-6" />,
    },
    {
        name: 'Orders',
        layout: '/admin',
        path: 'orders',
        icon: <MdShoppingCart className="h-6 w-6" />,
    },
    {
        name: 'Users',
        layout: '/admin',
        path: 'users',
        icon: <MdPeople className="h-6 w-6" />,
    },
    {
        name: 'Settings',
        layout: '/admin',
        path: 'settings',
        icon: <MdSettings className="h-6 w-6" />,
    },
];

export default routes;
