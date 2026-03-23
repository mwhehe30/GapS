'use client';

import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/signin');
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    getUser();
  }, [router]);

  const toggleUserModal = () => {
    setShowUserModal(!showUserModal);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  return (
    <main className='bg-gray-200 min-h-screen'>
      <header className='container mx-auto py-4'>
        <nav className='flex items-center justify-between'>
          <Link href='/' className='text-2xl font-bold text-gray-900/70'>
            Gap<span className='text-gray-900'>S</span>
          </Link>

          <div className='flex gap-4 items-center'>
            <ul className='flex gap-4 bg-gray-100 py-4 px-2.5 rounded-2xl'>
              <li>
                <Link
                  href='/dashboard'
                  className='px-2 py-3 bg-gray-200 rounded-xl'
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href='/analytics'
                  className='hover:text-blue-500 px-2 py-3 rounded-xl'
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href='/roadmap'
                  className='hover:text-blue-500 px-2 py-3 rounded-xl'
                >
                  Roadmap
                </Link>
              </li>
            </ul>

            <div className='relative'>
              <button
                onClick={toggleUserModal}
                className='p-2 bg-gray-100 rounded-2xl'
              >
                <div className='p-2 bg-gray-100 hover:bg-gray-200 rounded-xl'>
                  <User />
                </div>
              </button>

              {/* Modal/Dropdown untuk user info */}
              {showUserModal && (
                <>
                  {/* Backdrop */}
                  <div
                    className='fixed inset-0 z-40'
                    onClick={toggleUserModal}
                  />

                  {/* User Info Card */}
                  <div className='absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg z-50 overflow-hidden'>
                    <div className='p-4 border-b border-gray-200'>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                          <User size={24} className='text-gray-600' />
                        </div>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            {user?.user_metadata?.full_name ||
                              user?.email ||
                              'User'}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='p-2'>
                      <button className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg'>
                        Profile Settings
                      </button>
                      <button className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg'>
                        Account Settings
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              className='p-2 bg-gray-100 rounded-2xl'
              onClick={logout}
              title='signout'
            >
              <div className='p-2 bg-gray-100 hover:bg-red-200 rounded-xl'>
                <LogOut />
              </div>
            </button>
          </div>
        </nav>
      </header>
      <section className='container mx-auto'>{children}</section>
    </main>
  );
}
