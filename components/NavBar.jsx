'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '#' },
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav
      className={`sticky top-4 z-50 mx-auto transition-all duration-500 ease-in-out backdrop-blur-sm rounded-2xl ${
        scrolled ? 'max-w-7xl bg-gray-700/10' : 'container'
      }`}
    >
      {/* Main bar */}
      <div className='flex gap-2 items-center justify-between p-4'>
        <div className='flex gap-8 items-center'>
          <Link href='/' className='text-2xl font-bold text-gray-900/70'>
            Gap<span className='text-gray-900'>S</span>
          </Link>

          <ul className='hidden md:flex gap-2'>
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className='flex gap-2 items-center'>
          <div className='hidden md:flex gap-2'>
            {user ? (
              <>
                <Link
                  href='/dashboard'
                  className='px-4 py-2 bg-gray-900 text-white rounded-md flex items-center gap-2'
                >
                  Dashboard
                  <ArrowRight size={18} />
                </Link>
                <button
                  onClick={logout}
                  className='px-4 py-2 bg-red-500 text-white rounded-md'
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href='/signin' className='px-4 py-2 rounded-md flex items-center gap-2'>
                  Login
                </Link>
                <Link
                  href='/signup'
                  className='px-4 py-2 bg-gray-900 text-white rounded-md flex items-center gap-2'
                >
                  Register
                  <ArrowRight size={18} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className='md:hidden p-2 rounded-xl hover:bg-gray-200/50 transition-colors'
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label='Toggle menu'
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className='md:hidden px-4 pb-4 flex flex-col gap-2'>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className='px-3 py-2 rounded-xl hover:bg-gray-200/50 transition-colors'
            >
              {link.name}
            </Link>
          ))}
          <div className='border-t border-gray-300/50 mt-2 pt-2 flex flex-col gap-2'>
            {user ? (
              <>
                <Link
                  href='/dashboard'
                  onClick={() => setMenuOpen(false)}
                  className='px-4 py-2 bg-gray-900 text-white rounded-md flex items-center gap-2'
                >
                  Dashboard
                  <ArrowRight size={18} />
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className='px-4 py-2 bg-red-500 text-white rounded-md text-left'
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href='/signin'
                  onClick={() => setMenuOpen(false)}
                  className='px-4 py-2 rounded-md'
                >
                  Login
                </Link>
                <Link
                  href='/signup'
                  onClick={() => setMenuOpen(false)}
                  className='px-4 py-2 bg-gray-900 text-white rounded-md flex items-center gap-2'
                >
                  Register
                  <ArrowRight size={18} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
