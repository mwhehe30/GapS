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

  // Form states
  const [currentPosition, setCurrentPosition] = useState('');
  const [targetRoleId, setTargetRoleId] = useState('');

  // Data states
  const [jobRoles, setJobRoles] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [userSkillIds, setUserSkillIds] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [needsReanalysis, setNeedsReanalysis] = useState(false);

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

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_position, target_role_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setCurrentPosition(profile.current_position || '');
        setTargetRoleId(profile.target_role_id || '');
      }

      // Fetch user's currently owned skills
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id);

      setUserSkillIds(userSkills?.map((s) => s.skill_id) || []);

      // Fetch all available skills
      try {
        const skillsData = await getSkills();
        setAllSkills(skillsData.skills || []);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
      }

      // Initial analysis fetch if target exists
      if (session?.access_token) {
        try {
          const analysisData = await getAnalysis(session.access_token);
          setAnalysis(analysisData);
        } catch (err) {
          if (!err?.message?.includes('Cannot coerce')) {
            console.error('Failed to fetch initial analysis:', err);
          }
        }
      }

      // Fetch job roles
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

  const handleSkillToggle = async (skillId) => {
    if (!user) return;

    const isCurrentlyOwned = userSkillIds.includes(skillId);

    // Optimistic UI update
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

      if (analysis) {
        setNeedsReanalysis(true);
      }
    } catch (err) {
      console.error('Failed to toggle skill:', err);
      // Revert on error
      setUserSkillIds(userSkillIds);
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();

    // Use FormData if triggered by submit, otherwise fallback to React state
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
      // Update profile first
      await supabase.from('profiles').upsert({
        id: user.id,
        target_role_id: roleId,
      });

      // Sync state for UI consistency
      setTargetRoleId(roleId);

      const analysisData = await getAnalysis(sessionToken);
      setAnalysis(analysisData);
      setNeedsReanalysis(false);

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

  // Filter skills based on search
  const filteredSkills = allSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group filtered skills by category
  const skillsByCategory = filteredSkills.reduce((acc, skill) => {
    const category = skill.category || 'Lainnya';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

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

      <section className='space-y-4'>
        {/* Career Path Setup Card */}
        <div className='bg-gray-100 p-10 rounded-2xl border border-gray-300 shadow-sm'>
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

        {/* Skill Selection Section */}
        <div className='bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200'>
          <button
            onClick={() => setShowSkillSelector(!showSkillSelector)}
            className='w-full flex items-center justify-between p-8'
          >
            <div className='flex items-center gap-4 text-left'>
              <div className='p-3 rounded-xl bg-indigo-50 text-indigo-600'>
                <CheckCircle className='w-6 h-6' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  Pilih Skill yang Kamu Miliki
                </h2>
                <p className='text-gray-500'>
                  {userSkillIds.length} skill terpilih
                </p>
              </div>
            </div>
            <div className='p-2 rounded-lg bg-gray-100'>
              <ChevronDown
                className={`w-6 h-6 transition-transform text-gray-600 ${showSkillSelector ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {showSkillSelector && (
            <div className='p-10 bg-gray-100 border-t border-gray-100 animate-in slide-in-from-top-4 duration-300'>
              {/* Search Box */}
              <div className='relative mb-8'>
                <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Cari skill atau kategori...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all'
                />
              </div>

              {/* Skills Grid */}
              <div className='space-y-10 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar'>
                {Object.keys(skillsByCategory).length > 0 ? (
                  Object.entries(skillsByCategory).map(([category, skills]) => (
                    <div key={category} className='space-y-4'>
                      <h3 className='text-sm font-bold text-indigo-600 uppercase tracking-widest px-1'>
                        {formatCategory(category)}
                      </h3>
                      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3'>
                        {skills.map((skill) => {
                          const isSelected = userSkillIds.includes(skill.id);
                          return (
                            <button
                              key={skill.id}
                              onClick={() => handleSkillToggle(skill.id)}
                              className={`flex items-center justify-between gap-2 p-4 rounded-xl text-sm font-medium transition-all group ${
                                isSelected
                                  ? 'bg-gray-900 text-white shadow-lg'
                                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-400 hover:shadow-md'
                              }`}
                            >
                              <span className='truncate'>{skill.name}</span>
                              <div
                                className={`p-1 rounded-md shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-white/20'
                                    : 'bg-gray-100 group-hover:bg-indigo-100'
                                }`}
                              >
                                {isSelected ? (
                                  <Minus className='w-3 h-3' />
                                ) : (
                                  <Plus className='w-3 h-3' />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-20 text-gray-500'>
                    Tidak ada skill yang ditemukan untuk pencarian "
                    {searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results Display */}
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
              <>
                {needsReanalysis && (
              <div className='p-6 bg-yellow-50 border border-yellow-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500'>
                <div className='flex items-center gap-4 text-yellow-800 text-left'>
                  <div className='p-3 bg-yellow-100 rounded-xl shrink-0'>
                    <AlertCircle className='w-6 h-6' />
                  </div>
                  <div>
                    <h3 className='font-bold text-lg'>
                      Update Data Terdeteksi
                    </h3>
                    <p className='text-yellow-700/80 mt-1 font-medium'>
                      Anda telah mengubah daftar skill. Lakukan analisis ulang
                      untuk melihat pembaruan gap terbaru.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAnalyze()}
                  disabled={analysisLoading}
                  className='px-6 py-4 w-full md:w-auto bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 transition-colors shadow-lg active:scale-95 shrink-0 whitespace-nowrap flex items-center justify-center gap-2'
                >
                  {analysisLoading && (
                    <Loader2 className='w-5 h-5 animate-spin' />
                  )}
                  Analisis Ulang Sekarang
                </button>
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
              {/* Section: Skills Owned */}
              <div className='md:col-span-2 p-6 bg-gray-100 rounded-2xl space-y-4 shadow-sm border border-gray-300'>
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
                        className='flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl'
                      >
                        <CheckCircle className='w-5 h-5 text-green-600 shrink-0' />
                        <div>
                          <div className='font-medium text-gray-900'>
                            {skill.name}
                          </div>
                          <div className='text-xs text-gray-500 uppercase'>
                            {formatCategory(skill.category)}
                          </div>
                        </div>
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
              <div className='md:col-span-3 p-6 bg-gray-100 rounded-2xl space-y-4 shadow-sm border border-gray-300'>
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
                        className='flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl'
                      >
                        <Target className='w-5 h-5 text-red-600 shrink-0' />
                        <div>
                          <div className='font-medium text-gray-900'>
                            {skill.name}
                          </div>
                          <div className='text-xs text-gray-500 uppercase'>
                            {formatCategory(skill.category)}
                          </div>
                        </div>
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
              <div className='p-6 bg-gray-100 rounded-2xl space-y-4 shadow-sm border border-gray-300'>
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
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalyticsPage;
