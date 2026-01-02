'use client';

import { HiX, HiMenu } from 'react-icons/hi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { MdLogout } from 'react-icons/md';
import React from 'react';

export interface IRoute {
  name: string;
  layout: string;
  path: string;
  icon: React.ReactNode;
  secondary?: boolean;
}

function HorizonSidebar(props: {
  routes: IRoute[];
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { routes, open, setOpen } = props;
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/sign-in');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-50 flex min-h-full w-[290px] flex-col bg-white pb-10 shadow-2xl shadow-gray-200/50 transition-all duration-300 dark:bg-navy-800 dark:text-white 
          ${open ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}`}
      >
        {/* Close button */}
        <span
          className="absolute right-4 top-4 block cursor-pointer xl:hidden"
          onClick={() => setOpen(false)}
        >
          <HiX className="h-6 w-6" />
        </span>

        {/* Logo */}
        <div className="mx-[56px] mt-[50px] flex items-center">
          <div className="text-[26px] font-bold text-navy-700 dark:text-white">
            Zaree <span className="font-medium text-brand-500">Admin</span>
          </div>
        </div>

        <div className="mb-7 mt-[58px] h-px bg-gray-200 dark:bg-white/20" />

        {/* Nav items */}
        <ul className="mb-auto pt-1 px-4 space-y-1">
          {routes.map((route, index) => {
            const fullPath = `${route.layout}/${route.path}`;
            const isActive = pathname === fullPath;

            return (
              <li key={index}>
                <Link
                  href={fullPath}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-700'
                    }`}
                >
                  <span className={isActive ? 'text-white' : 'text-inherit'}>
                    {route.icon}
                  </span>
                  <span className="font-medium">{route.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout button */}
        <div className="px-4 mt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <MdLogout className="h-6 w-6" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default HorizonSidebar;
