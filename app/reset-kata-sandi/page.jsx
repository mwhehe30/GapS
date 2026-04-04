'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Lock,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'

export default function ResetKataSandiPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [fromProfile, setFromProfile] = useState(false)
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: '',
  })

  useEffect(() => {
    const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // User sudah login (akses dari profile)
        const params = new URLSearchParams(window.location.search)
        setFromProfile(params.get('from') === 'profile')
        setVerifying(false)
        return
      }

      // Tidak ada session, cek token dari email reset
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')

      if (!accessToken) {
        router.push('/signin')
        return
      }

      setVerifying(false)
    }

    verifySession()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (passwords.new !== passwords.confirm) {
      setError('Kata sandi tidak sama')
      setLoading(false)
      return
    }

    if (passwords.new.length < 6) {
      setError('Kata sandi minimal 6 karakter')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    setTimeout(() => {
      router.push(fromProfile ? '/profile' : '/signin')
    }, 3000)
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#212529] mx-auto"></div>
          <p className="mt-4 text-slate-600">Memverifikasi link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-slate-200 text-center">
            <div className="mx-auto w-16 h-16 bg-[#212529]/30 rounded-full flex items-center justify-center mb-4">
              {success ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {success ? 'Kata sandi Berhasil Diubah!' : 'Buat Kata sandi Baru'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {success
                ? fromProfile
                  ? 'Kata sandi Anda sudah diperbarui. Mengalihkan ke profil...'
                  : 'Kata sandi Anda sudah diperbarui. Mengalihkan ke login...'
                : 'Masukkan Kata sandi baru untuk akun Anda'}
            </p>
          </div>

          <div className="p-6">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-[#212529]/10 border border-[#212529] rounded-lg p-3">
                    <p className="text-sm text-[#212529]">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="new" className="text-sm font-medium text-slate-700">
                    Kata sandi Baru
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="new"
                      type="password"
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#212529]/80 focus:border-transparent"
                      placeholder="Minimal 6 karakter"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm" className="text-sm font-medium text-slate-700">
                    Konfirmasi kata sandi Baru
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirm"
                      type="password"
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#212529]/80 focus:border-transparent"
                      placeholder="Ketik ulang password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {passwords.new && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">Kekuatan kata sandi:</div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwords.new.length < 6
                            ? 'w-1/3 bg-[#ADB5BD]'
                            : passwords.new.length < 8
                              ? 'w-2/3 bg-[#495057]'
                              : 'w-full bg-[#212529]'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {passwords.new.length < 6
                        ? 'Terlalu pendek'
                        : passwords.new.length < 8
                          ? 'Sedang'
                          : 'Kuat'}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#212529]/80 hover:bg-[#212529]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-5"
                >
                  {loading ? 'Menyimpan...' : 'Ubah Password'}
                </button>
              </form>
            ) : (
              <div className="bg-[#212529]/10 border border-[#212529]/40 rounded-lg p-3">
                <p className="text-sm text-[#212529] text-center">
                  Kata sandi berhasil diubah! Mengalihkan ke halaman login...
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border-slate-200 text-center">
            <Link href={fromProfile ? "/profile" : "/signin"} className="inline-flex items-center text-sm text-[#212529] hover:underline gap-1">
              <ArrowLeft className="size-4" />
              {fromProfile ? 'Kembali ke Profil' : 'Kembali ke Login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}