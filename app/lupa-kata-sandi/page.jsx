'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, CheckCircle, Send, ArrowLeft, Loader2 } from 'lucide-react';

export default function LupaKataSandiPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-kata-sandi`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-[#dde3e8] flex items-center justify-center p-6'>
      <Link
        href='/signin'
        className='absolute top-6 left-6 flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors'
      >
        <ArrowLeft size={16} />
        Kembali ke Login
      </Link>

      <div className='flex-1 flex flex-col justify-center items-center w-full max-w-sm mx-auto'>
        {/* Icon */}
        <div className='w-16 h-16 bg-[#8a9199] rounded-full flex items-center justify-center mb-6'>
          {success ? (
            <CheckCircle className='w-8 h-8 text-white' />
          ) : (
            <Mail className='w-8 h-8 text-white' />
          )}
        </div>

        <h1 className='text-4xl font-black text-gray-900 mb-1 text-center'>
          {success ? 'Cek Email Anda' : 'Lupa Kata Sandi?'}
        </h1>
        <p className='text-gray-500 text-sm mb-8 text-center'>
          {success
            ? `Link reset telah dikirim ke ${email}`
            : 'Masukkan email Anda, kami akan kirim link untuk reset kata sandi.'}
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4 w-full'>
            {error && (
              <div className='px-4 py-3 rounded-2xl bg-red-400/20 text-red-800 text-sm'>
                {error}
              </div>
            )}

            <input
              type='email'
              placeholder='Email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-3 rounded-2xl bg-[#8a9199] text-white placeholder-gray-200 outline-none focus:ring-2 focus:ring-gray-500'
            />

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 rounded-2xl bg-[#c8cdd2] text-gray-800 font-medium hover:bg-[#b8bec4] transition-colors disabled:opacity-60 flex items-center justify-center gap-2'
            >
              {loading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <>
                  Kirim Link Reset
                  <Send className='w-4 h-4' />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className='w-full flex flex-col gap-3'>
            <div className='px-4 py-3 rounded-2xl bg-[#8a9199]/20 text-gray-700 text-sm text-center'>
              Tidak menerima email? Cek folder spam atau{' '}
              <button
                onClick={() => setSuccess(false)}
                className='underline font-medium hover:text-gray-900'
              >
                coba lagi
              </button>
            </div>
          </div>
        )}

        <p className='text-xs text-gray-500 mt-6'>
          Ingat kata sandi?{' '}
          <Link href='/signin' className='hover:underline text-gray-700 font-medium'>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
