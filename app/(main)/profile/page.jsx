'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/components/Loading';
import {
  User,
  Mail,
  Briefcase,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { getSkills } from '@/lib/api';
import SkillSelector from '@/components/SkillSelector';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // State buat urusan input form profil
  const [fullName, setFullName] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');

  // State buat manajemen skill user
  const [allSkills, setAllSkills] = useState([]);
  const [userSkillIds, setUserSkillIds] = useState([]);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fungsi buat narik semua data user sekaligus pas awal buka
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/signin');
        return;
      }

      setUser(user);
      setFullName(user.user_metadata?.full_name || '');

      // Ambil detail info profil tambahan (posisi sekarang, dsb)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setCurrentPosition(profileData.current_position || '');
      }

      // Ambil daftar ID skill yang udah dipilih user sebelumnya
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id);
      setUserSkillIds(userSkills?.map((s) => s.skill_id) || []);

      // Ambil daftar semua skill yang tersedia di sistem biar bisa dipilih user
      try {
        const skillsData = await getSkills();
        setAllSkills(skillsData.skills || []);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleSave = async (e) => {
    // Fungsi buat nyimpen semua perubahan profil ke database
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // 1. Update Auth Metadata (Full Name)
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (authError) throw authError;

      // 2. Update Profiles Table (Current Position)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        current_position: currentPosition,
        updated_at: new Date().toISOString(), // Optional: if you have this column
      });

      if (profileError) throw profileError;

      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });

      // Auto-refresh user state in layout might be needed, but for now just local update
      setUser({
        ...user,
        user_metadata: { ...user.user_metadata, full_name: fullName },
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Gagal memperbarui profil',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSkillToggle = async (skillId) => {
    // Fungsi buat tambah/hapus skill dari profil user (toggle)
    if (!user) return;

    const isCurrentlyOwned = userSkillIds.includes(skillId);
    const newUserSkillIds = isCurrentlyOwned
      ? userSkillIds.filter((id) => id !== skillId)
      : [...userSkillIds, skillId];
    setUserSkillIds(newUserSkillIds);

    try {
      if (isCurrentlyOwned) {
        await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', user.id)
          .eq('skill_id', skillId);
      } else {
        await supabase
          .from('user_skills')
          .insert({ user_id: user.id, skill_id: skillId });
      }
    } catch (err) {
      console.error('Failed to toggle skill:', err);
      setUserSkillIds(userSkillIds); // rollback
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className='max-w-7xl mx-auto pb-4 space-y-6'>
      <header className='space-y-2'>
        <h1 className='text-3xl md:text-5xl'>Profile</h1>
        <p className='text-lg md:text-2xl text-gray-900/70'>
          Kelola informasi pribadi dan data profesional Anda
        </p>
      </header>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className='w-5 h-5 shrink-0' />
          ) : (
            <AlertCircle className='w-5 h-5 shrink-0' />
          )}
          {message.text}
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Profile Card - Left Side */}
        <div className='lg:col-span-1'>
          <div className='bg-gray-100 rounded-3xl p-6 shadow-sm border border-gray-300 space-y-6 h-full flex flex-col justify-between'>
            {/* Avatar */}
            <div className='flex flex-col items-center text-center space-y-4'>
              <div className='w-24 h-24 rounded-2xl bg-linear-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg'>
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>
                  {user?.user_metadata?.full_name || 'User'}
                </h2>
                <p className='text-sm text-gray-600 mt-1'>{user?.email}</p>
              </div>
            </div>

            {/* Quick Info */}
            <div className='space-y-3 pt-4 border-t border-gray-300'>
              <div className='flex items-center gap-3 text-sm'>
                <div className='w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0'>
                  <Briefcase className='w-5 h-5 text-white' />
                </div>
                <div className='min-w-0'>
                  <p className='text-xs text-gray-500 font-medium'>
                    Posisi Saat Ini
                  </p>
                  <p className='font-semibold text-gray-900 truncate'>
                    {currentPosition || 'Belum diatur'}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3 text-sm'>
                <div className='w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0'>
                  <CheckCircle className='w-5 h-5 text-white' />
                </div>
                <div className='min-w-0'>
                  <p className='text-xs text-gray-500 font-medium'>
                    Total Skills
                  </p>
                  <p className='font-semibold text-gray-900'>
                    {userSkillIds.length} skill
                  </p>
                </div>
              </div>
            </div>

            {/* Change Password Button */}
            <Link
              href='/reset-kata-sandi?from=profile'
              className='flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-all border border-gray-300 shadow-sm'
            >
              <KeyRound className='w-4 h-4' />
              Ganti Password
            </Link>
          </div>
        </div>

        {/* Form Card - Right Side */}
        <div className='lg:col-span-2'>
          <div className='bg-gray-100 rounded-3xl p-6 shadow-sm border border-gray-300'>
            <h3 className='text-xl font-bold text-gray-900 mb-6'>
              Informasi Profil
            </h3>

            <form onSubmit={handleSave} className='space-y-6'>
              {/* Full Name */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700'>
                  Nama Lengkap
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <User className='w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors' />
                  </div>
                  <input
                    type='text'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className='w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 font-medium'
                    placeholder='Masukkan nama lengkap'
                    required
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700'>
                  Email
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <Mail className='w-5 h-5 text-gray-400' />
                  </div>
                  <input
                    type='email'
                    value={user?.email || ''}
                    disabled
                    className='w-full pl-12 pr-4 py-3.5 bg-gray-200 border border-gray-300 rounded-2xl text-gray-500 font-medium cursor-not-allowed'
                  />
                </div>
                <p className='text-xs text-gray-500 ml-1'>
                  Email tidak dapat diubah
                </p>
              </div>

              {/* Current Position */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700'>
                  Pekerjaan / Posisi Saat Ini
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <Briefcase className='w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors' />
                  </div>
                  <input
                    type='text'
                    value={currentPosition}
                    onChange={(e) => setCurrentPosition(e.target.value)}
                    className='w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 font-medium'
                    placeholder='Contoh: Senior Frontend Developer'
                    required
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className='pt-4'>
                <button
                  type='submit'
                  disabled={saving}
                  className='w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold text-base hover:bg-gray-800 transition-all disabled:opacity-70 shadow-lg'
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
        </div>
      </div>

      {/* Skill Selection Section */}
      <SkillSelector
        allSkills={allSkills}
        userSkillIds={userSkillIds}
        onToggle={handleSkillToggle}
      />

      {/* Info Card */}
      <div className='p-6 bg-gray-100 rounded-3xl border border-gray-300 shadow-sm'>
        <div className='flex items-start gap-4'>
          <div className='p-3 bg-gray-900 rounded-xl shrink-0'>
            <AlertCircle className='w-6 h-6 text-white' />
          </div>
          <div>
            <h3 className='font-bold text-gray-900 text-lg'>
              Mengapa melengkapi profil?
            </h3>
            <p className='text-gray-600 text-sm mt-1'>
              Informasi pekerjaan saat ini digunakan untuk menganalisis gap
              skill Anda secara lebih akurat dalam fitur Smart Analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
