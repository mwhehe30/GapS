'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Briefcase, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import { getSkills } from '@/lib/api';
import SkillSelector from '@/components/SkillSelector';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [currentPosition, setCurrentPosition] = useState('');
  const [allSkills, setAllSkills] = useState([]);
  const [userSkillIds, setUserSkillIds] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_position')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.current_position) { router.push('/dashboard'); return; }

      try {
        const skillsData = await getSkills();
        setAllSkills(skillsData.skills || []);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
      }

      setLoading(false);
    };
    init();
  }, [router]);

  const handleNextStep = async (e) => {
    if (e) e.preventDefault();
    if (!currentPosition.trim()) return;
    setSaving(true);
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        current_position: currentPosition,
        updated_at: new Date().toISOString(),
      });
      setStep(2);
    } catch (err) {
      console.error('Error saving position:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkillToggle = async (skillId) => {
    const isCurrentlyOwned = userSkillIds.includes(skillId);
    const newUserSkillIds = isCurrentlyOwned
      ? userSkillIds.filter((id) => id !== skillId)
      : [...userSkillIds, skillId];
    setUserSkillIds(newUserSkillIds);
    try {
      if (isCurrentlyOwned) {
        await supabase.from('user_skills').delete().eq('user_id', user.id).eq('skill_id', skillId);
      } else {
        await supabase.from('user_skills').insert({ user_id: user.id, skill_id: skillId });
      }
    } catch (err) {
      console.error('Failed to toggle skill:', err);
      setUserSkillIds(userSkillIds);
    }
  };

  const handleFinish = () => router.push('/dashboard');

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-200 flex items-center justify-center'>
        <div className='w-8 h-8 border-4 border-gray-400 border-t-gray-800 rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-200 flex items-center justify-center p-6'>
      <div className={`flex-1 flex flex-col justify-center items-center w-full mx-auto ${step === 1 ? 'max-w-sm' : 'max-w-3xl'}`}>

        {/* Progress dots */}
        <div className='flex items-center gap-3 mb-8'>
          <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-gray-800' : 'bg-gray-400'}`} />
          <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-gray-800' : 'bg-gray-400'}`} />
        </div>

        <h1 className='text-4xl font-black text-gray-900 mb-1 text-center'>
          {step === 1 ? 'Selamat Datang!' : 'Satu Langkah Lagi'}
        </h1>
        <p className='text-gray-500 text-sm mb-8 text-center'>
          {step === 1
            ? 'Ceritakan posisi kamu saat ini untuk memulai analisis.'
            : 'Pilih skill yang sudah kamu kuasai. Bisa dilewati jika mau.'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleNextStep} className='flex flex-col gap-4 w-full'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                <Briefcase className='w-5 h-5 text-gray-300' />
              </div>
              <input
                type='text'
                autoFocus
                value={currentPosition}
                onChange={(e) => setCurrentPosition(e.target.value)}
                placeholder='Contoh: Junior Web Developer'
                required
                className='w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-500 text-white placeholder-gray-200 outline-none focus:ring-2 focus:ring-gray-600'
              />
            </div>

            <button
              type='submit'
              disabled={saving || !currentPosition.trim()}
              className='w-full py-3 rounded-2xl bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer'
            >
              {saving ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <>
                  Lanjut
                  <ChevronRight className='w-4 h-4' />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className='flex flex-col gap-4 w-full'>
            <SkillSelector
              allSkills={allSkills}
              userSkillIds={userSkillIds}
              onToggle={handleSkillToggle}
              title='Pilih Skill Anda'
              description='Agar kami bisa menganalisis gap skill Anda dengan tepat'
              initiallyOpen={true}
              columns='compact'
            />

            <button
              onClick={handleFinish}
              className='w-full py-3 rounded-2xl bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition-colors flex items-center justify-center gap-2 cursor-pointer'
            >
              Mulai Sekarang
              <CheckCircle className='w-4 h-4' />
            </button>

            <button
              onClick={handleFinish}
              className='w-full py-3 rounded-2xl text-gray-500 text-sm hover:text-gray-700 transition-colors cursor-pointer'
            >
              Lewati & Selesai
            </button>
          </div>
        )}

        <p className='text-xs text-gray-400 mt-6 text-center'>
          Data kamu aman dan bisa diubah kapan saja di menu profil.
        </p>
      </div>
    </div>
  );
}
