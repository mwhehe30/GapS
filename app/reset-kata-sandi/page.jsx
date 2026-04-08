'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Lock,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

export default function ResetKataSandiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  useEffect(() => {
    // Supabase mengirim event PASSWORD_RECOVERY saat user klik link dari email
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setValidSession(true);
        setVerifying(false);
      }
    });

    // Fallback: cek session yang sudah ada (misal akses dari profile)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
        setVerifying(false);
      } else {
        // Tunggu sebentar untuk event PASSWORD_RECOVERY dari hash
        setTimeout(() => {
          if (!validSession) {
            setVerifying(false);
          }
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getStrength = (pw) => {
    if (pw.length === 0) return null;
    if (pw.length < 6)
      return { label: 'Terlalu pendek', width: 'w-1/4', color: 'bg-gray-400' };
    if (pw.length < 8)
      return { label: 'Lemah', width: 'w-2/4', color: 'bg-gray-500' };
    if (pw.length < 12)
      return { label: 'Sedang', width: 'w-3/4', color: 'bg-gray-700' };
    return { label: 'Kuat', width: 'w-full', color: 'bg-gray-900' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (passwords.new !== passwords.confirm) {
      setError('Kata sandi tidak cocok');
      return;
    }
    if (passwords.new.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/signin'), 3000);
  };

  const strength = getStrength(passwords.new);

  if (verifying) {
    return (
      <div className='min-h-screen bg-gray-200 flex items-center justify-center p-6'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-8 h-8 animate-spin text-gray-600' />
          <p className='text-gray-600 text-sm'>Memverifikasi link reset...</p>
        </div>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className='min-h-screen bg-gray-200 flex items-center justify-center p-6'>
        <div className='w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-300'>
          <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <Lock className='w-10 h-10 text-red-500' />
          </div>
          <h1 className='text-3xl md:text-4xl font-black text-gray-900 mb-3 text-center'>
            Link Tidak Valid
          </h1>
          <p className='text-gray-600 text-sm md:text-base mb-8 text-center'>
            Link reset kata sandi sudah kadaluarsa atau tidak valid. Silakan
            minta link baru.
          </p>
          <Link
            href='/lupa-kata-sandi'
            className='w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors text-center flex items-center justify-center shadow-lg cursor-pointer'
          >
            Minta Link Baru
          </Link>
        </div>
      </div>
    );
  }

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
        <div className='w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-6'>
          {success ? (
            <CheckCircle className='w-10 h-10 text-white' />
          ) : (
            <Lock className='w-10 h-10 text-white' />
          )}
        </div>

        <h1 className='text-xl md:text-2xl font-black text-gray-900 mb-3 text-center'>
          {success ? 'Berhasil!' : 'Buat Password Baru'}
        </h1>
        <p className='text-gray-600 text-sm md:text-base mb-8 text-center'>
          {success
            ? 'Kata sandi kamu sudah diperbarui. Mengalihkan ke halaman login...'
            : 'Masukkan password baru untuk akun Anda'}
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            {error && (
              <div className='px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm'>
                {error}
              </div>
            )}

            {/* New password */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Password Baru
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Lock className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder='Masukkan password baru'
                  required
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  className='w-full pl-12 pr-12 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all'
                />
                <button
                  type='button'
                  onClick={() => setShowNew(!showNew)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength indicator */}
              {strength && (
                <div className='mt-2'>
                  <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
                    <div
                      className={`h-full rounded-full transition-all ${strength.width} ${strength.color}`}
                    />
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Konfirmasi Password Baru
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Lock className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder='Konfirmasi password baru'
                  required
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  className='w-full pl-12 pr-12 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirm(!showConfirm)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Match indicator */}
              {passwords.confirm && (
                <p
                  className={`text-xs mt-2 font-medium ${passwords.new === passwords.confirm ? 'text-green-600' : 'text-red-500'}`}
                >
                  {passwords.new === passwords.confirm
                    ? '✓ Kata sandi cocok'
                    : '✗ Kata sandi tidak cocok'}
                </p>
              )}
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg mt-2'
            >
              {loading ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                'Ubah Password'
              )}
            </button>
          </form>
        ) : (
          <div className='px-5 py-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium'>
            Mengalihkan ke halaman login...
          </div>
        )}
      </div>
    </div>
  );
}
