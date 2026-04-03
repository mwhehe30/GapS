'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  ArrowRight,
  CheckCircle,
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getSkills } from '@/lib/api';
import SkillSelector from '@/components/SkillSelector';
import Skeleton from '@/components/Skeleton';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  // Form states
  const [currentPosition, setCurrentPosition] = useState('');
  const [allSkills, setAllSkills] = useState([]);
  const [userSkillIds, setUserSkillIds] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/signin');
        return;
      }
      setUser(user);

      // Check if profile already exists to pre-fill
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_position')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.current_position) {
        setCurrentPosition(profile.current_position);
      }

      // Fetch all skills for step 2
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
        updated_at: new Date().toISOString()
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
      setUserSkillIds(userSkillIds); // rollback
    }
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6">
        <Skeleton className="h-12 w-3/4 mb-4 rounded-xl" />
        <Skeleton className="h-6 w-1/2 mb-12 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in zoom-in-95 duration-500">

        {/* Progress Header */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className={`h-2.5 w-16 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-gray-900' : 'bg-gray-300'}`} />
          <div className={`h-2.5 w-16 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-gray-900' : 'bg-gray-300'}`} />
        </div>

        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-gray-100 rounded-3xl shadow-sm border border-gray-200 mb-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 italic">
            {step === 1 ? "Selamat Datang di GapS!" : "Satu Langkah Lagi..."}
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {step === 1
              ? "Mari mulai dengan melengkapi informasi profesional Anda untuk hasil analisis yang akurat."
              : "Pilih skill yang sudah Anda kuasai. Anda bisa melewati bagian ini jika mau."}
          </p>
        </div>

        <div className="bg-gray-100 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/50 rounded-full blur-3xl opacity-30" />

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-8 relative">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Apa pekerjaan atau posisi Anda saat ini?
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Briefcase className="w-6 h-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    value={currentPosition}
                    onChange={(e) => setCurrentPosition(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-xl font-semibold text-gray-900 placeholder:text-gray-300 shadow-sm"
                    placeholder="Contoh: Junior Web Developer"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !currentPosition.trim()}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
              >
                {saving ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Lanjut
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-8 relative">
              <SkillSelector
                allSkills={allSkills}
                userSkillIds={userSkillIds}
                onToggle={handleSkillToggle}
                title="Pilih Skill Anda"
                description="Agar kami bisa menganalisis gap skill Anda dengan tepat"
                initiallyOpen={true}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleFinish}
                  className="flex-1 py-5 bg-gray-900 text-white rounded-2xl font-bold text-xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl order-1 sm:order-2"
                >
                  Mulai Sekarang
                  <CheckCircle className="w-6 h-6" />
                </button>

                <button
                  onClick={handleFinish}
                  className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-bold text-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 order-2 sm:order-1"
                >
                  Lewati & Selesai
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm italic">
          Data Anda aman dan dapat diubah kapan saja di menu profil.
        </p>
      </div>
    </div>
  );
}
