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
    <div className='min-h-screen bg-gray-200 flex items-center justify-center p-6'>
      <Link
        href='/signin'
        className='absolute top-6 left-6 flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer'
      >
        <ArrowLeft size={16} />
        Kembali
      </Link>

      <div className='w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-300'>
        {/* Icon */}
        <div className='w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-6'>
          {success ? (
            <CheckCircle className='w-10 h-10 text-white' />
          ) : (
            <Mail className='w-10 h-10 text-white' />
          )}
        </div>

        <h1 className='text-xl md:text-2xl font-black text-gray-900 mb-3 text-center'>
          {success ? 'Cek email anda' : 'Lupa Password?'}
        </h1>
        <p className='text-gray-600 text-sm md:text-base mb-8 text-center'>
          {success
            ? 'Kami sudah mengirim link reset password ke email Anda'
            : 'Masukkan email Anda, kami akan kirim link untuk reset password'}
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            {error && (
              <div className='px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm'>
                {error}
              </div>
            )}

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Email
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Mail className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  placeholder='JohnDoe@gmail.com'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all'
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg'
            >
              {loading ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                'Kirim link reset'
              )}
            </button>
          </form>
        ) : (
          <div className='flex flex-col gap-4'>
            <div className='px-5 py-4 rounded-2xl bg-gray-100 border border-gray-300'>
              <p className='text-sm text-gray-700 mb-1'>
                Link reset password telah dikirim ke
              </p>
              <p className='font-semibold text-gray-900'>{email}</p>
            </div>

            <div className='px-5 py-4 rounded-2xl bg-gray-100 border border-gray-300 text-gray-700 text-sm'>
              Tidak menerima email? Cek folder spam atau{' '}
              <button
                onClick={() => setSuccess(false)}
                className='underline font-semibold hover:text-gray-900 transition-colors cursor-pointer'
              >
                Kirim ulang
              </button>
            </div>
          </div>
        )}

        <p className='text-xs text-gray-500 mt-6 text-center'>
          Ingat kata sandi?{' '}
          <Link
            href='/signin'
            className='hover:underline text-gray-700 font-semibold cursor-pointer'
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
