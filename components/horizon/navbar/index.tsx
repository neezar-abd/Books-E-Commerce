'use client';

import { HiMenuAlt2 } from 'react-icons/hi';
import { FiSearch } from 'react-icons/fi';
import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

function HorizonNavbar(props: {
  onOpenSidenav: () => void;
  brandText: string;
}) {
  const { onOpenSidenav, brandText } = props;
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserName(profile.name || profile.email || 'Admin');
        }
      }
    };
    getUser();
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setDarkMode(!darkMode);
  };

  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d]">
      <div className="ml-[6px]">
        <div className="h-6 w-[224px] pt-1">
          <a
            className="text-sm font-normal text-navy-700 hover:underline dark:text-white dark:hover:text-white"
            href=" "
          >
            Admin
            <span className="mx-1 text-sm text-navy-700 hover:text-navy-700 dark:text-white">
              {' '}/{' '}
            </span>
          </a>
          <span className="text-sm font-normal capitalize text-navy-700 dark:text-white">
            {brandText}
          </span>
        </div>
        <p className="shrink text-[33px] capitalize text-navy-700 dark:text-white">
          <span className="font-bold capitalize hover:text-navy-700 dark:hover:text-white">
            {brandText}
          </span>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[61px] w-[355px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:w-[365px] md:flex-grow-0 md:gap-1 xl:w-[365px] xl:gap-2">
        {/* Search */}
        <div className="flex h-full items-center rounded-full bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white xl:w-[225px]">
          <p className="pl-3 pr-2 text-xl">
            <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
          </p>
          <input
            type="text"
            placeholder="Search..."
            className="block h-full w-full rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white sm:w-fit"
          />
        </div>

        {/* Menu button (mobile) */}
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <HiMenuAlt2 className="h-5 w-5" />
        </span>

        {/* Notifications */}
        <span className="flex cursor-pointer text-xl text-gray-600 dark:text-white">
          <MdNotificationsNone className="h-5 w-5" />
        </span>

        {/* Info */}
        <span className="flex cursor-pointer text-xl text-gray-600 dark:text-white">
          <MdInfoOutline className="h-5 w-5" />
        </span>

        {/* Dark mode toggle */}
        <div
          className="cursor-pointer text-gray-600"
          onClick={toggleDarkMode}
        >
          {darkMode ? (
            <IoMdSunny className="h-5 w-5 text-gray-600 dark:text-white" />
          ) : (
            <IoMdMoon className="h-5 w-5 text-gray-600 dark:text-white" />
          )}
        </div>

        {/* Profile */}
        <div className="relative flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HorizonNavbar;
