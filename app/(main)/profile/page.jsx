'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/Skeleton';
import { 
  User, 
  Mail, 
  Briefcase, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/signin');
        return;
      }

      setUser(user);
      setFullName(user.user_metadata?.full_name || '');

      // Fetch profile details
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setCurrentPosition(profileData.current_position || '');
      }

      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // 1. Update Auth Metadata (Full Name)
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (authError) throw authError;

      // 2. Update Profiles Table (Current Position)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          current_position: currentPosition,
          updated_at: new Date().toISOString() // Optional: if you have this column
        });

      if (profileError) throw profileError;

      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      
      // Auto-refresh user state in layout might be needed, but for now just local update
      setUser({ ...user, user_metadata: { ...user.user_metadata, full_name: fullName } });

    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui profil' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto py-8 space-y-8'>
        <Skeleton className='h-[450px] w-full rounded-3xl' />
        <Skeleton className='h-32 w-full rounded-2xl' />
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto py-8 space-y-8'>
      <header className='space-y-2 text-center md:text-left'>
        <h1 className='text-3xl md:text-5xl font-bold text-gray-900'>Profil Saya</h1>
        <p className='text-xl text-gray-600'> Kelola informasi pribadi dan data profesional Anda </p>
      </header>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className='w-5 h-5 shrink-0' /> : <AlertCircle className='w-5 h-5 shrink-0' />}
          {message.text}
        </div>
      )}

      <div className='bg-gray-100 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-200'>
        <form onSubmit={handleSave} className='space-y-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Full Name */}
            <div className='space-y-2'>
              <label className='text-sm font-bold text-gray-500 uppercase tracking-wider ml-1'>
                Nama Lengkap
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <User className='w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors' />
                </div>
                <input
                  type='text'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className='w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900 font-medium'
                  placeholder='Masukkan nama lengkap'
                  required
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className='space-y-2'>
              <label className='text-sm font-bold text-gray-500 uppercase tracking-wider ml-1'>
                Email (Tidak dapat diubah)
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Mail className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  value={user?.email || ''}
                  disabled
                  className='w-full pl-12 pr-4 py-4 bg-gray-200 border border-gray-200 rounded-2xl text-gray-500 font-medium cursor-not-allowed opacity-70'
                />
              </div>
            </div>

            {/* Current Position */}
            <div className='space-y-2 md:col-span-2'>
              <label className='text-sm font-bold text-gray-500 uppercase tracking-wider ml-1'>
                Pekerjaan / Posisi Saat Ini
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Briefcase className='w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors' />
                </div>
                <input
                  type='text'
                  value={currentPosition}
                  onChange={(e) => setCurrentPosition(e.target.value)}
                  className='w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900 font-medium'
                  placeholder='Contoh: Senior Frontend Developer'
                  required
                />
              </div>
            </div>
          </div>

          <div className='pt-4 flex justify-end'>
            <button
              type='submit'
              disabled={saving}
              className='flex items-center justify-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-gray-200'
            >
              {saving ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className='w-5 h-5' />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className='p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-4'>
        <div className='p-3 bg-indigo-100 rounded-xl shrink-0'>
          <AlertCircle className='w-6 h-6 text-indigo-600' />
        </div>
        <div>
          <h3 className='font-bold text-indigo-900'>Mengapa melengkapi profil?</h3>
          <p className='text-indigo-800/70 text-sm mt-1'>
            Informasi pekerjaan saat ini digunakan untuk menganalisis gap skill Anda secara lebih akurat dalam fitur Smart Analytics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
