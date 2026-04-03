'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';
import {
  Target,
  BookOpen,
  CheckCircle,
  TrendingUp,
  BriefcaseBusiness,
  Check,
  Clock,
  Layers,
  BookCheck,
  BookOpenCheck,
  BookOpenText,
  BookCopy,
  Book,
} from 'lucide-react';
import { getAnalysis, getRoadmap } from '@/lib/api';
import { formatCategory } from '@/lib/utils';

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [completedProgress, setCompletedProgress] = useState([]);
  const [roadmap, setRoadmap] = useState(null);

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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('current_position, target_role_id, job_roles(name)')
        .eq('id', user.id)
        .maybeSingle();
      setProfile(profileData);

      const { data: userSkillsData } = await supabase
        .from('user_skills')
        .select('skill_id, skills(name, category)')
        .eq('user_id', user.id);

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('skill_id, skills(name, category)')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      setSkills(userSkillsData || []);
      setCompletedProgress(progressData || []);

      // Ambil data analisis dan roadmap user
      if (session?.access_token) {
        setAnalysisLoading(true);
        try {
          const [analysisData, roadmapData] = await Promise.all([
            getAnalysis(session.access_token),
            getRoadmap(session.access_token),
          ]);
          setAnalysis(analysisData);
          setRoadmap(roadmapData.roadmap);
        } catch (err) {
          // Abaikan error kalau user memang belum pernah analisis (biar gak muncul teks error aneh)
          const errorMessage = err?.message || '';
          if (
            errorMessage.includes('Cannot coerce') ||
            errorMessage.includes('Target role belum di-set')
          ) {
            setAnalysis(null);
            setAnalysisError(null);
          } else {
            setAnalysisError(errorMessage || 'Failed to fetch data');
          }
        } finally {
          setAnalysisLoading(false);
        }
      }

      setLoading(false);
    };
    init();
  }, [router]);

  const allSkills = [
    ...skills.map((s) => ({
      id: s.skill_id,
      name: s.skills?.name,
      category: s.skills?.category,
    })),
    ...completedProgress.map((p) => ({
      id: p.skill_id,
      name: p.skills?.name,
      category: p.skills?.category,
    })),
  ];
  const uniqueSkills = allSkills.filter(
    (s, i, self) => i === self.findIndex((x) => x.id === s.id),
  );

  if (loading) {
    return (
      <div className='pb-4'>
        <div className='max-w-7xl mx-auto space-y-8'>
          {/* Header Skeleton */}
          <header>
            <Skeleton className='h-12 w-96 rounded-lg' />
          </header>

          <section className='space-y-4'>
            {/* Stats row Skeleton */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className='h-32 w-full rounded-2xl' />
              ))}
            </div>

            {/* Profile + Analysis Skeleton */}
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-4'>
              <Skeleton className='lg:col-span-2 h-[450px] w-full rounded-2xl' />
              <Skeleton className='lg:col-span-3 h-[450px] w-full rounded-2xl' />
            </div>

            {/* Skills + Roadmap Skeleton */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <Skeleton className='h-[400px] w-full rounded-2xl' />
              <Skeleton className='h-[400px] w-full rounded-2xl' />
            </div>
          </section>
        </div>
      </div>
    );
  }

  const roadmapContent = roadmap?.content;

  return (
    <div className='pb-4'>
      <div className='max-w-7xl mx-auto space-y-8'>
        {/* Header */}
        <header>
          <h1 className='text-3xl md:text-5xl'>
            Selamat datang, {user?.user_metadata?.full_name || 'User'}
          </h1>
        </header>

        <section className='space-y-4'>
          {/* Baris statistik angka-angka */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='bg-linear-to-br from-66% from-gray-900 to-99% to-gray-700 rounded-3xl p-4 text-gray-100 flex flex-col gap-4 shadow-sm'>
              <div className='size-9 bg-gray-900 text-gray-100 grid place-items-center rounded-md'>
                <BookOpen />
              </div>
              <h3 className='text-3xl font-semibold'>
                {roadmapContent?.phases?.length || 0}
              </h3>
              <p className='text-gray-100/70'>Step roadmap</p>
            </div>
            <div className='bg-gray-100 rounded-3xl p-4 flex flex-col gap-4 border border-gray-300 shadow-sm'>
              <div className='size-9 bg-gray-900 text-gray-100 grid place-items-center rounded-md'>
                <BookCopy />
              </div>
              <h3 className='text-3xl font-semibold'>
                {analysis?.totalRequired || 0}
              </h3>
              <p className='text-gray-900/70'>Total Skill</p>
            </div>
            <div className='bg-gray-100 rounded-3xl p-4 flex flex-col gap-4 border border-gray-300 shadow-sm'>
              <div className='size-9 bg-gray-800 text-gray-100 grid place-items-center rounded-md'>
                <BookOpenCheck />
              </div>
              <h3 className='text-3xl font-semibold'>
                {analysis?.masteredCount || 0}
              </h3>
              <p className='text-gray-900/70'>Skill dikuasai</p>
            </div>
            <div className='bg-gray-100 rounded-3xl p-4 flex flex-col gap-4 border border-gray-300 shadow-sm'>
              <div className='size-9 bg-gray-500 text-gray-100 grid place-items-center rounded-md'>
                <BookOpenText />
              </div>
              <h3 className='text-3xl font-semibold'>
                {analysis?.gapSkills?.length || 0}
              </h3>
              <p className='text-gray-900/70'>Skill yang perlu dipelajari</p>
            </div>
          </div>

          {/* Bagian Profil & Grafik Analisis */}
          <div className='grid grid-cols-1 lg:grid-cols-5 gap-4'>
            {/* Profile card */}
            <div className='lg:col-span-2 p-4 bg-gray-100 rounded-3xl grid grid-rows-1 md:grid-rows-2 border border-gray-300 shadow-sm'>
              <div className='flex flex-col items-center gap-2 justify-center'>
                <div className='p-4 bg-linear-to-br from-60% from-gray-900 to-100% to-gray-700 text-gray-100 size-15 text-2xl font-bold grid place-items-center rounded-2xl self-center'>
                  {user?.user_metadata?.full_name?.[0]}
                </div>
                <h3 className='text-lg'>{user?.user_metadata?.full_name}</h3>
                <p className='text-gray-600'>Profile Summary</p>
              </div>
              <ul>
                <li className='flex items-center justify-between py-3'>
                  <span className='flex items-center gap-2'>
                    <BriefcaseBusiness />
                    Posisi saat ini:
                  </span>
                  <span className='font-semibold'>
                    {profile?.current_position || 'Not set'}
                  </span>
                </li>
                <li className='flex items-center justify-between py-3 border-b border-gray-300 border-t'>
                  <span className='flex items-center gap-2'>
                    <TrendingUp />
                    Posisi Tujuan:
                  </span>
                  <span className='font-semibold'>
                    {profile?.job_roles?.name || 'Not set'}
                  </span>
                </li>
                <li className='flex items-center justify-between py-3'>
                  <span>Estimasi Waktu:</span>
                  <span className='font-semibold'>
                    {roadmapContent?.estimatedDuration || 'Not set'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Analysis card */}
            <div className='lg:col-span-3 bg-gray-100 rounded-3xl p-4 border border-gray-300 shadow-sm'>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Target />
                    <div>
                      <h2>Hasil Analisis</h2>
                      <p className='text-sm text-gray-600'>
                        Skill yang perlu dimiliki untuk mencapai tujuan Anda
                      </p>
                    </div>
                  </div>
                  <Link href='/analytics' className='hover:underline'>
                    Lihat detail
                  </Link>
                </div>

                {analysisError && <div>{analysisError}</div>}

                {!analysisLoading && analysis ? (
                  analysis.gapSkills?.length > 0 ? (
                    <ul className='space-y-2'>
                      {analysis.masteredSkills
                        ? analysis.masteredSkills?.map((skill, i) => (
                            <li
                              key={skill.id}
                              className='p-2 bg-gray-300 rounded-xl'
                            >
                              <div className='flex items-center justify-between gap-2'>
                                <div className='flex items-center gap-2'>
                                  <div className='size-11 rounded-lg bg-gray-900 grid place-items-center text-white shrink-0 relative overflow-hidden'>
                                    <div className='absolute inset-0 bg-gray-900/70 flex items-center justify-center'>
                                      <Check />
                                    </div>
                                    {i + 1}
                                  </div>
                                  <div className='font-medium text-gray-900 truncate'>
                                    <h3>{skill.name}</h3>
                                    <p className='text-xs text-gray-600'>
                                      {formatCategory(skill.category)}
                                    </p>
                                  </div>
                                </div>
                                <p className='text-gray-900/70 mr-2'>
                                  sudah dipelajari
                                </p>
                              </div>
                            </li>
                          ))
                        : null}
                      {analysis.gapSkills.map((skill, i) => (
                        <li
                          key={skill.id}
                          className='p-2 bg-gray-300 rounded-xl'
                        >
                          <div className='flex items-center gap-2'>
                            <div className='size-11 rounded-lg bg-gray-900 grid place-items-center text-white shrink-0'>
                              {i + 1 + (analysis.masteredSkills?.length || 0)}
                            </div>
                            <div className='font-medium text-gray-900 truncate'>
                              <h3>{skill.name}</h3>
                              <p className='text-xs text-gray-600'>
                                {formatCategory(skill.category)}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div>Belum ada skill gap yang terdeteksi.</div>
                  )
                ) : (
                  <div className='text-center py-6'>
                    <p className='text-sm text-gray-500 mb-3'>
                      Jalankan analisis di halaman Analytics untuk melihat
                      hasilnya di sini.
                    </p>
                    <Link
                      href='/analytics'
                      className='text-sm text-indigo-600 hover:underline'
                    >
                      Ke Analytics
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* List Skill & Roadmap Singkat */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Owned skills */}
            <div className='bg-gray-100 p-4 rounded-3xl border border-gray-300 shadow-sm'>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-4'>
                  <CheckCircle />
                  <div>
                    <h2>Skills Kamu</h2>
                    <p className='text-sm text-gray-600'>
                      Skill yang sudah kamu miliki
                    </p>
                  </div>
                </div>
                <ul className='gap-2 grid grid-cols-1 md:grid-cols-2'>
                  {uniqueSkills.length > 0 ? (
                    uniqueSkills.map((skill) => (
                      <li
                        key={skill.id}
                        className='p-2 bg-gray-300 rounded-xl flex items-center gap-3'
                      >
                        <div className='size-11 rounded-lg bg-gray-900 grid place-items-center text-white shrink-0'>
                          <CheckCircle className='w-5 h-5 shrink-0' />
                        </div>
                        <div className='min-w-0'>
                          <div className='font-medium text-gray-900 truncate'>
                            {skill.name}
                          </div>
                          <div className='text-xs text-gray-900/70 truncate'>
                            {formatCategory(skill.category)}
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <div className='text-center py-6 col-span-2'>
                      <p className='text-sm text-gray-500 mb-3'>
                        Belum ada skill yang ditambahkan
                      </p>
                      <Link
                        href='/profile'
                        className='text-sm text-indigo-600 hover:underline'
                      >
                        Ke Profile
                      </Link>
                    </div>
                  )}
                </ul>
              </div>
            </div>

            {/* Roadmap phases */}
            <div className='bg-gray-100 p-4 rounded-3xl border border-gray-300 shadow-sm'>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <BookOpen />
                    <div>
                      <h2>Daftar Pembelajaran</h2>
                      <p className='text-sm text-gray-600'>
                        Semua Modul Pembelajaran Anda
                      </p>
                    </div>
                  </div>
                  <Link href='/roadmap' className='hover:underline'>
                    Lihat detail
                  </Link>
                </div>

                {roadmapContent?.phases?.length > 0 ? (
                  <ul className='space-y-2'>
                    {roadmapContent.phases.map((phase) => (
                      <li
                        key={phase.phase}
                        className='flex items-center gap-3 p-2 bg-gray-300 rounded-xl'
                      >
                        <div className='size-11 rounded-lg bg-gray-900 grid place-items-center text-white shrink-0'>
                          {phase.phase}
                        </div>
                        <div className='min-w-0'>
                          <p className='font-medium text-gray-900 truncate'>
                            {phase.title}
                          </p>
                          <div className='flex items-center gap-1'>
                            <p className='text-sm text-gray-900/70'>
                              Perkiraan durasi
                            </p>{' '}
                            -
                            <span className='flex items-center gap-1 text-sm text-gray-900/70'>
                              <Clock className='size-4' />
                              {phase.duration}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className='text-center py-6'>
                    <p className='text-sm text-gray-500 mb-3'>
                      Belum ada roadmap. Generate dulu di halaman Analytics.
                    </p>
                    <Link
                      href='/analytics'
                      className='text-sm text-indigo-600 hover:underline'
                    >
                      Ke Analytics
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
