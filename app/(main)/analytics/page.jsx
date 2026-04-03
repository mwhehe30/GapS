'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/Skeleton';
import {
  getAnalysis,
  getJobRoles,
  generateRoadmap,
  getSkills,
} from '@/lib/api';
import {
  ArrowRight,
  User,
  ChevronDown,
  Loader2,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Target,
  Plus,
  Minus,
  Search,
  AlertCircle,
} from 'lucide-react';
import { formatCategory } from '@/lib/utils';
import Link from 'next/link';

const AnalyticsPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // State buat urusan form analitik
  const [currentPosition, setCurrentPosition] = useState('');
  const [targetRoleId, setTargetRoleId] = useState('');

  // State buat nampung data dari database atau API
  const [jobRoles, setJobRoles] = useState([]);
  const [userSkillIds, setUserSkillIds] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [togglingSkillId, setTogglingSkillId] = useState(null);
  const [error, setError] = useState(null);
  const [canGenerateRoadmap, setCanGenerateRoadmap] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!user) {
        router.push('/signin');
        return;
      }

      setUser(user);
      setSessionToken(session?.access_token);

      // Tarik data profil user (posisi sekarang & target)
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_position, target_role_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setCurrentPosition(profile.current_position || '');
        setTargetRoleId(profile.target_role_id || '');
      }

      // Tarik daftar skill yang udah dipunya user
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id);

      setUserSkillIds(userSkills?.map((s) => s.skill_id) || []);

      // Coba ambil analisis awal kalau session token ada (biar langsung muncul hasil lama)
      if (session?.access_token) {
        try {
          const analysisData = await getAnalysis(session.access_token);
          setAnalysis(analysisData);
        } catch (err) {
          const errorMessage = err?.message || '';
          if (
            !errorMessage.includes('Cannot coerce') &&
            !errorMessage.includes('Target role belum di-set')
          ) {
            console.error('Failed to fetch initial analysis:', err);
          }
        }
      }

      // Tarik daftar role pekerjaan buat pilihan dropdown
      try {
        const rolesData = await getJobRoles();
        setJobRoles(rolesData.roles || []);
      } catch (err) {
        console.error('Failed to fetch job roles:', err);
      }

      setLoading(false);
    };

    init();
  }, [router]);

  useEffect(() => {
    // Fungsi buat ngecek batasan 15 hari generate roadmap
    if (user?.id) {
      const lastDateStr = localStorage.getItem(
        `gaps_last_roadmap_date_${user.id}`,
      );
      if (lastDateStr) {
        const lastDate = parseInt(lastDateStr, 10);
        const diffMs = Date.now() - lastDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays < 15) {
          setCanGenerateRoadmap(false);
          setDaysRemaining(Math.ceil(15 - diffDays));
        } else {
          setCanGenerateRoadmap(true);
          setDaysRemaining(0);
        }
      }
    }
  }, [user]);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();

    // Ambil role ID: cek dari form dulu, kalau gak ada baru ambil dari state react
    const roleId = e
      ? new FormData(e.currentTarget).get('targetRoleId')
      : targetRoleId;

    if (!roleId) {
      setError('Pilih posisi target terlebih dahulu');
      return;
    }

    setAnalysisLoading(true);
    setError(null);

    try {
      // Simpan dulu settingan target role ke profil user
      await supabase.from('profiles').upsert({
        id: user.id,
        target_role_id: roleId,
      });

      // Sync state for UI consistency
      setTargetRoleId(roleId);

      const analysisData = await getAnalysis(sessionToken);
      setAnalysis(analysisData);

      // Update userSkillIds local state too
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id);
      setUserSkillIds(userSkills?.map((s) => s.skill_id) || []);

      // Smooth scroll to results
      setTimeout(() => {
        document
          .getElementById('analysis-results')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message || 'Gagal melakukan analisis');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    setError(null);

    try {
      const result = await generateRoadmap(sessionToken);
      if (result.roadmap) {
        if (user?.id) {
          localStorage.removeItem(`gaps_phases_${user.id}`);
          localStorage.setItem(
            `gaps_last_roadmap_date_${user.id}`,
            Date.now().toString(),
          );
        }
        router.push('/roadmap');
      } else {
        setError(result.message || 'Gagal membuat roadmap');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat membuat roadmap');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleToggleSkill = async (skillId, isMastered) => {
    if (!user || !sessionToken || togglingSkillId) return;

    setTogglingSkillId(skillId);
    try {
      if (isMastered) {
        // Hapus dari daftar skill yang dimiliki
        await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', user.id)
          .eq('skill_id', skillId);
      } else {
        // Tambah ke daftar skill yang dimiliki
        await supabase
          .from('user_skills')
          .insert({ user_id: user.id, skill_id: skillId });
      }

      // Refresh data analisis biar skor & daftar update otomatis
      const analysisData = await getAnalysis(sessionToken);
      setAnalysis(analysisData);

      // Update daftar ID skill buat sinkronisasi UI
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id);
      setUserSkillIds(userSkills?.map((s) => s.skill_id) || []);
    } catch (err) {
      console.error('Gagal update skill:', err);
      setError('Gagal memperbarui status skill');
    } finally {
      setTogglingSkillId(null);
    }
  };

  if (loading) {
    return (
      <div className='max-w-7xl pb-4 mx-auto space-y-8'>
        <Skeleton className='h-48 w-full rounded-2xl' />
        <Skeleton className='h-[400px] w-full rounded-2xl md:rounded-3xl' />
      </div>
    );
  }

  return (
    <div className='max-w-7xl pb-4 mx-auto space-y-4'>
      {JSON.stringify(analysis)}
      <header className='space-y-2'>
        <h1 className='text-3xl md:text-5xl'>Skill Gap Analysis</h1>
        <p className='text-2xl text-gray-900/70'>
          Lihat perbandingan skill antara profil anda dan posisi target
        </p>
      </header>

      {error && (
        <div className='p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3'>
          <XCircle className='w-5 h-5 shrink-0' />
          {error}
        </div>
      )}

      {/* Advisory for users with no skills */}
      {!analysisLoading && userSkillIds.length === 0 && (
        <div className='p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500'>
          <div className='flex items-center gap-4 text-indigo-800 text-left'>
            <div className='p-3 bg-indigo-100 rounded-xl shrink-0'>
              <AlertCircle className='w-6 h-6' />
            </div>
            <div>
              <h3 className='font-bold text-lg'>Lengkapi Daftar Skill Anda</h3>
              <p className='text-indigo-700/80 mt-1 font-medium'>
                Anda belum menambahkan skill apapun di profil. Tambahkan skill
                yang Anda miliki agar kami dapat menganalisis gap secara akurat.
              </p>
            </div>
          </div>
          <Link
            href='/profile'
            className='px-6 py-4 w-full md:w-auto bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg text-center shrink-0'
          >
            Atur Skill Sekarang
          </Link>
        </div>
      )}

      <section className='space-y-4'>
        {/* Kartu Setting Jalur Karier */}
        <div className='bg-gray-100 p-4 rounded-3xl border border-gray-300 shadow-sm'>
          <form
            className='flex flex-col md:flex-row gap-6 items-end'
            onSubmit={handleAnalyze}
          >
            <div className='flex flex-col gap-2 flex-1 w-full'>
              <label htmlFor='currentJob' className='text-gray-900/70'>
                Posisi saat ini
              </label>
              <div className='flex items-center gap-3 p-2 bg-gray-300 border border-gray-300 rounded-xl'>
                <div className='p-3 rounded-xl bg-gray-900 text-white'>
                  <User size={20} />
                </div>
                <span className='font-medium text-gray-700'>
                  {currentPosition ||
                    'Pekerjaan saat ini (belum diatur di Profil)'}
                </span>
              </div>
              {/* <p className='text-xs text-gray-500 mt-1 ml-1'>
                Ubah di menu <Link href='/profile' className='text-indigo-600 font-bold hover:underline'>Profil</Link>
              </p> */}
            </div>

            <div className='hidden md:flex py-5 items-center justify-center'>
              <ArrowRight />
            </div>

            <div className='flex flex-col gap-2 flex-1 w-full'>
              <label htmlFor='targetJob' className='text-gray-900/70'>
                Pilih posisi target
              </label>
              <div className='relative'>
                <select
                  name='targetRoleId'
                  value={targetRoleId}
                  onChange={(e) => setTargetRoleId(e.target.value)}
                  className='w-full p-5 bg-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 font-medium'
                >
                  <option value=''>Pilih Role Tujuan</option>
                  {jobRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none'>
                  <ChevronDown className='w-6 h-6 text-gray-900' />
                </div>
              </div>
            </div>

            <button
              type='submit'
              disabled={analysisLoading}
              className='px-8 py-5 bg-gray-900 text-white rounded-xl h-full w-full md:w-auto font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 flex items-center justify-center gap-2'
            >
              {analysisLoading ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                'Analisis'
              )}
            </button>
          </form>
        </div>

        {/* Render hasil analisis di sini kalau sudah ada datanya */}
        {analysis && (
          <div
            id='analysis-results'
            className='space-y-4 animate-in fade-in duration-700'
          >
            {analysisLoading ? (
              <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                <Skeleton className='md:col-span-2 h-[400px] w-full rounded-2xl' />
                <Skeleton className='md:col-span-3 h-[400px] w-full rounded-2xl' />
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Ringkasan Readiness Score */}
                <div className='bg-linear-to-br from-65% from-gray-900 to-gray-700 rounded-3xl p-4 text-white border border-gray-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6'>
                  <div className='flex items-center gap-4'>
                    <div className='p-4 bg-white/10 rounded-2xl backdrop-blur-md'>
                      <TrendingUp className='w-8 h-8 text-white' />
                    </div>
                    <div>
                      <h2 className='text-xl font-bold'>Readiness Score</h2>
                      <p className='text-gray-300 text-sm'>
                        Tingkat kesiapan Anda untuk posisi ini
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col items-center md:items-end gap-2 w-full md:w-64'>
                    <div className='flex items-end gap-1'>
                      <span className='text-4xl font-bold'>
                        {analysis?.readinessScore || 0}
                      </span>
                      <span className='text-xl text-gray-400 mb-1'>%</span>
                    </div>
                    <div className='w-full h-3 bg-gray-800 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-white transition-all duration-1000'
                        style={{ width: `${analysis?.readinessScore || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                  {/* Section: Skills Owned */}
                  <div className='md:col-span-2 p-4 bg-gray-100 rounded-3xl space-y-4 shadow-sm border border-gray-300'>
                    <div className='flex items-center justify-between'>
                      <h2 className='text-xl font-semibold'>
                        Skill yang kamu miliki
                      </h2>
                      <p className='text-gray-500'>
                        {analysis?.masteredSkills?.length || 0} skill
                      </p>
                    </div>

                    <ul className='space-y-2'>
                      {analysis?.masteredSkills?.length > 0 ? (
                        analysis.masteredSkills.map((skill) => (
                          <li
                            key={skill.id}
                            className='flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group'
                          >
                            <div className='flex items-center gap-3'>
                              <CheckCircle className='w-5 h-5 text-green-600 shrink-0' />
                              <div>
                                <div className='font-medium text-gray-900'>
                                  {skill.name}
                                </div>
                                <div className='text-xs text-gray-500 uppercase'>
                                  {formatCategory(skill.category)}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleSkill(skill.id, true)}
                              disabled={togglingSkillId === skill.id}
                              className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed'
                              title='Hapus dari skill saya'
                            >
                              {togglingSkillId === skill.id ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                              ) : (
                                <Minus className='w-4 h-4' />
                              )}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className='text-gray-500 italic p-4 text-center'>
                          Belum ada skill terdeteksi
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Section: Skills Gap */}
                  <div className='md:col-span-3 p-4 bg-gray-100 rounded-3xl space-y-4 shadow-sm border border-gray-300'>
                    <div className='flex items-center justify-between'>
                      <h2 className='text-xl font-semibold'>
                        Skill yang dibutuhkan (Gap)
                      </h2>
                      <p className='text-gray-500'>
                        {analysis?.gapSkills?.length || 0} skill
                      </p>
                    </div>

                    <ul className='space-y-2'>
                      {analysis?.gapSkills?.length > 0 ? (
                        analysis.gapSkills.map((skill) => (
                          <li
                            key={skill.id}
                            className='flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group'
                          >
                            <div className='flex items-center gap-3'>
                              <Target className='w-5 h-5 text-red-600 shrink-0' />
                              <div>
                                <div className='font-medium text-gray-900'>
                                  {skill.name}
                                </div>
                                <div className='text-xs text-gray-500 uppercase'>
                                  {formatCategory(skill.category)}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleSkill(skill.id, false)}
                              disabled={togglingSkillId === skill.id}
                              className='flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] justify-center'
                            >
                              {togglingSkillId === skill.id ? (
                                <Loader2 className='w-3 h-3 animate-spin' />
                              ) : (
                                <>
                                  <Plus className='w-3 h-3' />
                                  Mastered
                                </>
                              )}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className='text-gray-500 italic p-4 text-center'>
                          {analysis
                            ? 'Luar biasa! Tidak ada gap skill'
                            : 'Jalankan analisis untuk melihat gap'}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Section: Nice to Have Skills */}
                {analysis?.niceToHaveSkills?.length > 0 && (
                  <div className='p-4 bg-gray-100 rounded-3xl space-y-4 shadow-sm border border-gray-300'>
                    <div className='flex items-center justify-between'>
                      <h2 className='text-xl font-semibold'>
                        Skill Pendukung (Nice to Have)
                      </h2>
                      <p className='text-gray-500'>
                        {analysis.niceToHaveSkills.length} skill
                      </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                      {analysis.niceToHaveSkills.map((skill) => (
                        <div
                          key={skill.id}
                          className='flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl'
                        >
                          <div className='size-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0'>
                            <div className='size-2 bg-indigo-600 rounded-full' />
                          </div>
                          <div className='min-w-0'>
                            <div className='font-medium text-gray-900 truncate'>
                              {skill.name}
                            </div>
                            <div className='text-xs text-gray-500 uppercase truncate'>
                              {formatCategory(skill.category)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Roadmap Generation Action Area */}
                <div className='p-4 bg-indigo-50 border border-indigo-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 shadow-sm'>
                  <div className='p-4 bg-white rounded-2xl shadow-sm'>
                    <Target className='w-8 h-8 text-indigo-600' />
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Siap untuk Level Up?
                    </h2>
                    <p className='text-gray-600 mt-2 max-w-lg mx-auto'>
                      Berdasarkan analisis skill gap Anda, kami dapat menyusun
                      Roadmap Belajar yang dipersonalisasi langkah demi langkah.
                    </p>
                    {!canGenerateRoadmap && (
                      <div className='mt-4 inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium'>
                        <AlertCircle className='inline w-4 h-4 mr-2 mb-0.5' />
                        Anda baru bisa membuat roadmap baru dalam{' '}
                        {daysRemaining} hari lagi.
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleGenerateRoadmap}
                    disabled={roadmapLoading || !canGenerateRoadmap}
                    className='mt-4 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {roadmapLoading ? (
                      <Loader2 className='w-5 h-5 animate-spin' />
                    ) : (
                      'Generate Learning Roadmap'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalyticsPage;
