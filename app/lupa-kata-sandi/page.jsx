'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'  
import { 
  Mail,
  CheckCircle,
  Send,
  ArrowLeft
} from 'lucide-react'

export default function LupaKataSandiPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-kata-sandi`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft className='size-5' />
          Kembali ke Login
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-slate-200 text-center">
            <div className="mx-auto w-16 h-16 bg-[#212529]/30 rounded-full flex items-center justify-center mb-4">
              {success ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {success ? 'Cek Email Anda' : 'Lupa Kata Sandi?'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {success
                ? 'Kami sudah mengirim link reset kata sandi ke email Anda'
                : 'Masukkan email Anda, kami akan kirim link untuk reset kata sandi'}
            </p>
          </div>

          <div className="p-6">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#212529]/80 focus:border-transparent"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#212529]/80 hover:bg-[#212529]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Link Reset
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#212529]/10 border border-[#212529]/40 rounded-lg p-3">
                  <p className="text-sm text-[#212529] text-center">
                    Link reset kata sandi telah dikirim ke <strong>{email}</strong>
                  </p>
                </div>

                <div className="bg-[#212529]/10 rounded-lg p-4">
                  <p className="text-sm text-[#212529]">
                    Tidak menerima email? Cek folder spam atau
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="underline font-medium ml-1 hover:text-blue-900"
                    >
                      kirim ulang
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-slate-200 text-center">
            <Link href="/masuk" className="text-sm text-[#212529] cursor-pointer hover:underline">
              Ingat kata sandi? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}