'use client';

import { LogOut, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Cari tahu lagi di halaman mana sekarang
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Status menu mobile (tutup/buka)

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
    // Hapus semua data simpanan lokal biar bersih
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('gaps_')) {
        localStorage.removeItem(key);
      }
    });
    await supabase.auth.signOut();
    router.push('/signin');
  };

  // Tampilin null/kosong dulu pas lagi nunggu status login
  if (loading) {
    return null; 
  }

  return (
    <main className='bg-gray-200 min-h-screen'>
      <header className='container mx-auto p-4 transition-colors duration-300 bg-transparent sticky top-0 z-50'>
        <nav className='flex items-center justify-between'>
          <Link href='/' className='text-2xl font-bold text-gray-900/70'>
            Gap<span className='text-gray-900'>S</span>
          </Link>

          <div className='flex gap-2 md:gap-4 items-center'>
            <ul className='hidden lg:flex gap-4 bg-gray-100 py-4 px-2 rounded-2xl'>
              <li>
                <Link
                  href='/dashboard'
                  className={`px-3 py-3 rounded-xl transition-colors ${pathname === '/dashboard'
                      ? 'bg-gray-200 font-semibold text-gray-900'
                      : 'hover:text-gray-900 text-gray-900/60'
                    }`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href='/analytics'
                  className={`px-3 py-3 rounded-xl transition-colors ${pathname === '/analytics'
                      ? 'bg-gray-200 font-semibold text-gray-900'
                      : 'hover:text-gray-900 text-gray-900/60'
                    }`}
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href='/roadmap'
                  className={`px-3 py-3 rounded-xl transition-colors ${pathname === '/roadmap'
                      ? 'bg-gray-200 font-semibold text-gray-900'
                      : 'hover:text-gray-900 text-gray-900/60'
                    }`}
                >
                  Roadmap
                </Link>
              </li>
              <li>
                <Link
                  href='/profile'
                  className={`px-3 py-3 rounded-xl transition-colors ${pathname === '/profile'
                      ? 'bg-gray-200 font-semibold text-gray-900'
                      : 'hover:text-gray-900 text-gray-900/60'
                    }`}
                >
                  Profile
                </Link>
              </li>
            </ul>

            <div className='relative'>
              <button
                onClick={toggleUserModal}
                className='p-2 bg-gray-100 rounded-2xl'
              >
                <div className='p-2 bg-gray-100 hover:bg-gray-200 rounded-xl'>
                  <User size={20} />
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
                  <div className='absolute right-0 mt-2 w-max bg-white rounded-xl shadow-lg z-50 overflow-hidden text-gray-900'>
                    <div className='p-4 border-b border-gray-200'>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                          <User size={24} className='text-gray-600' />
                        </div>
                        <div>
                          <h3 className='font-semibold'>
                            {user?.user_metadata?.full_name ||
                              user?.email ||
                              'User'}
                          </h3>
                          <p className='text-sm text-gray-600 truncate'>
                            {user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='p-2'>
                      <Link
                        href='/profile'
                        onClick={() => setShowUserModal(false)}
                        className='flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium'
                      >
                        <User size={18} />
                        Lihat Profil
                      </Link>
                      <button
                        onClick={logout}
                        className='w-full flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-sm font-medium'
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              className='p-2 bg-gray-100 rounded-2xl hidden md:block'
              onClick={logout}
              title='signout'
            >
              <div className='p-2 bg-gray-100 hover:bg-red-200 rounded-xl'>
                <LogOut size={20} />
              </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className='p-2 bg-gray-100 rounded-2xl lg:hidden'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className='p-2 bg-gray-100 hover:bg-gray-200 rounded-xl'>
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className='lg:hidden mt-4 bg-gray-100 rounded-2xl p-4 space-y-2'>
            <Link
              href='/dashboard'
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl transition-colors ${pathname === '/dashboard'
                  ? 'bg-gray-200 font-semibold text-gray-900'
                  : 'hover:bg-gray-200 text-gray-900/60'
                }`}
            >
              Dashboard
            </Link>
            <Link
              href='/analytics'
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl transition-colors ${pathname === '/analytics'
                  ? 'bg-gray-200 font-semibold text-gray-900'
                  : 'hover:bg-gray-200 text-gray-900/60'
                }`}
            >
              Analytics
            </Link>
            <Link
              href='/roadmap'
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl transition-colors ${pathname === '/roadmap'
                  ? 'bg-gray-200 font-semibold text-gray-900'
                  : 'hover:bg-gray-200 text-gray-900/60'
                }`}
            >
              Roadmap
            </Link>
            <Link
              href='/profile'
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl transition-colors ${pathname === '/profile'
                  ? 'bg-gray-200 font-semibold text-gray-900'
                  : 'hover:bg-gray-200 text-gray-900/60'
                }`}
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className='w-full text-left px-4 py-3 rounded-xl bg-red-100 text-red-600 mt-4 flex items-center gap-2'
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </header>
      <section className='container mx-auto px-4'>{children}</section>
    </main>
  );
}
