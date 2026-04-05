'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

function DecorPanel() {
  return (
    <div className='relative flex flex-col justify-between p-6 bg-[#e8ecef] rounded-3xl inverted-radius-kanan max-h-full'>
      <div>
        <h2 className='text-3xl font-black text-gray-900 leading-tight mb-4'>
          Curious about
          <br />
          your market
          <br />
          value?
        </h2>
        <p className='text-sm text-gray-500 leading-relaxed'>
          Temukan skill mana yang membuatmu tertinggal di industri saat ini.
          Analisis gratis dalam 2 menit.
        </p>
      </div>

      <div className='flex items-center gap-4 my-6'>
        <Image src='/signup.svg' alt='bar chart' width={64} height={64} />
        <p className='text-base font-bold text-gray-800 leading-snug'>
          Turn your data
          <br />
          into career
          <br />
          growth.
        </p>
      </div>

      <div className='relative bg-[#d4d8dc] rounded-2xl p-4 inverted-bottom-card-kanan'>
        <p className='font-bold text-gray-800 text-sm mb-1'>
          Bridge the Gap, Land the Job.
        </p>
        <p className='text-xs text-gray-600 leading-relaxed'>
          Identifikasi celah skill kamu secara instan dan dapatkan rekomendasi
          pembelajaran yang dipersonalisasi untuk karier impianmu.
        </p>
        <div className='absolute -top-3 -right-3 w-8 h-8 bg-gray-700 rounded-2xl flex items-center justify-center'>
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='white'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z' />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'error' | 'success' }

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  useEffect(() => {
    // Kalau udah terlanjur login, pindahin langsung ke dashboard
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Ekstrak data dari form pendaftaran
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('first_name');
    const lastName = formData.get('last_name');

    // Gabungin nama depan & belakang buat metadata
    const { error } = await supabase.auth.signUp({
      email: formData.get('email'),
      password: formData.get('password'),
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
        },
      },
    });
    setLoading(false);
    if (error) showToast(error.message);
    else {
      showToast('Registrasi berhasil! Silakan cek email kamu.', 'success');
      setTimeout(() => router.push('/signin'), 1500);
    }
  };

  const handleGoogle = async () => {
    // Daftar/Login pakai akun Google
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  return (
    <div className='min-h-screen bg-[#dde3e8] flex items-center justify-center p-6'>
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg transition-all ${
          toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {toast.message}
        </div>
      )}
      <Link href='/' className='absolute top-6 left-6 flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer'>
        <ArrowLeft size={16} />
        Beranda
      </Link>
      <div className='flex gap-8 w-full max-w-4xl items-stretch mt-4'>
        {/* Form - left */}
        <div className='flex-1 flex flex-col mx-auto justify-center items-center'>
          <h1 className='text-4xl font-black text-gray-900 mb-1'>
            Ayo, Mulai
            <br />
            Identifikasi Skillmu
          </h1>
          <p className='text-gray-500 text-sm mb-6'>
            Hanya butuh 1 menit untuk memulai roadmap belajarmu.
          </p>

          {/* Toggle */}
          <div className='flex bg-[#b0b8c1] rounded-2xl p-1 mb-6 w-full max-w-100'>
            <Link
              href='/signin'
              className='flex-1 text-center py-2 rounded-2xl text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors cursor-pointer'
            >
              Login
            </Link>
            <span className='flex-1 text-center py-2 rounded-xl bg-[#8a9199] text-white text-sm font-medium cursor-default'>
              Register
            </span>
          </div>

          <form
            onSubmit={handleRegister}
            className='flex flex-col gap-4 w-full max-w-100'
          >
            <div className='flex flex-col md:flex-row gap-3 '>
              <input
                name='first_name'
                type='text'
                placeholder='Nama Depan'
                required
                className='w-full flex-1 px-4 py-3 rounded-2xl bg-[#8a9199] text-white placeholder-gray-200 outline-none focus:ring-2 focus:ring-gray-500 min-w-47'
              />
              <input
                name='last_name'
                type='text'
                placeholder='Nama Belakang'
                required
                className='w-full flex-1 px-4 py-3 rounded-2xl bg-[#8a9199] text-white placeholder-gray-200 outline-none focus:ring-2 focus:ring-gray-500 min-w-50'
              />
            </div>
            <input
              name='email'
              type='email'
              placeholder='Email'
              required
              className='px-4 py-3 rounded-2xl bg-[#8a9199] text-white placeholder-gray-200 outline-none focus:ring-2 focus:ring-gray-500'
            />
            <input
              name='password'
              type='password'
              placeholder='Password'
              required
              className='px-4 py-3 rounded-2xl bg-[#8a9199] text-white placeholder-gray-200 outline-none focus:ring-2 focus:ring-gray-500'
            />

            <button
              type='submit'
              disabled={loading}
              className='py-3 rounded-2xl bg-[#c8cdd2] text-gray-800 font-medium hover:bg-[#b8bec4] transition-colors disabled:opacity-60 cursor-pointer'
            >
              {loading ? 'Memuat...' : 'Daftar'}
            </button>
          </form>

          {/* Divider */}
          <div className='w-full max-w-100 flex items-center gap-3 my-4'>
            <div className='flex-1 h-px bg-gray-400' />
            <span className='text-xs text-gray-500'>Or</span>
            <div className='flex-1 h-px bg-gray-400' />
          </div>

          {/* Google */}
          <div className='flex justify-center'>
            <button
              onClick={handleGoogle}
              className='w-12 h-12 rounded-2xl bg-[#c8cdd2] flex items-center justify-center hover:bg-[#b8bec4] transition-colors cursor-pointer'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Decor panel - right */}
        <div className='hidden md:flex flex-1'>
          <DecorPanel />
        </div>
      </div>
    </div>
  );
}
