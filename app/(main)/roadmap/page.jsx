'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getAnalysis, getRoadmap } from '@/lib/api';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';
import {
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  TrendingUp,
  BriefcaseBusiness,
  Lightbulb,
  BarChart2,
  ArrowUpRight,
  CheckCircle,
  Loader,
  BadgeCheck,
  Pause,
  Check,
  FileCode,
} from 'lucide-react';

export default function RoadmapPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [openPhase, setOpenPhase] = useState(0);
  const [activeFilter, setActiveFilter] = useState('semua');
  const [phaseStatuses, setPhaseStatuses] = useState({});
  const [user, setUser] = useState(null);

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

      // Ambil profil user buat tau posisi sekarang & targetnya
      const { data: profileData } = await supabase
        .from('profiles')
        .select('current_position, target_role_id, job_roles(name)')
        .eq('id', user.id)
        .maybeSingle();
      setProfile(profileData);

      if (session?.access_token) {
        try {
          // Ambil barengan data analisis sama roadmap-nya
          const [analysisData, roadmapData] = await Promise.all([
            getAnalysis(session.access_token),
            getRoadmap(session.access_token),
          ]);
          setAnalysis(analysisData);
          setRoadmap(roadmapData.roadmap);
        } catch (err) {
          const errorMessage = err?.message || '';
          if (
            !errorMessage.includes('Cannot coerce') &&
            !errorMessage.includes('Target role belum di-set')
          ) {
            console.error(err);
          }
        }
      }

      setLoading(false);
    };
    init();
  }, [router]);

  useEffect(() => {
    // Sesuaiin status per fase (ambil dari localStorage kalau ada)
    if (roadmap?.content?.phases && user?.id) {
      setPhaseStatuses((prev) => {
        if (Object.keys(prev).length === 0) {
          const savedStr = localStorage.getItem(`gaps_phases_${user.id}`);
          if (savedStr) {
            try {
              return JSON.parse(savedStr);
            } catch (e) {}
          }
          const initial = {};
          roadmap.content.phases.forEach((p, index) => {
            initial[p.phase] = index === 0 ? 'berjalan' : 'belum';
          });
          return initial;
        }
        return prev;
      });
      setOpenPhase((prev) =>
        prev === 0 ? roadmap.content.phases[0].phase : prev,
      );
    }
  }, [roadmap, user?.id]);

  useEffect(() => {
    // Simpan perubahan status fase ke localStorage tiap ada update
    if (user?.id && Object.keys(phaseStatuses).length > 0) {
      localStorage.setItem(
        `gaps_phases_${user.id}`,
        JSON.stringify(phaseStatuses),
      );
    }
  }, [phaseStatuses, user?.id]);

  const togglePhaseStatus = (phaseNumber, targetStatus) => {
    setPhaseStatuses((prev) => ({
      ...prev,
      [phaseNumber]: targetStatus,
    }));
  };

  const content = roadmap?.content;
  const score = analysis?.readinessScore ?? 0;

  // Kumpulin semua resource dari tiap fase (buat ditampilin di sidebar)
  const allResources = useMemo(
    () =>
      content?.phases?.map((phase) => ({
        phaseNumber: phase.phase,
        phaseTitle: phase.title,
        resources: phase.resources || [],
      })) || [],
    [content?.phases],
  );

  const phasesWithStatus = useMemo(() => {
    if (!content?.phases) return [];
    return content.phases.map((p) => {
      const status = phaseStatuses[p.phase] || 'belum';
      return {
        ...p,
        status,
        isSelesai: status === 'selesai',
        isBerjalan: status === 'berjalan',
      };
    });
  }, [content?.phases, phaseStatuses]);

  const stats = useMemo(() => {
    const sedang = phasesWithStatus.filter((p) => p.isBerjalan).length;
    const selesai = phasesWithStatus.filter((p) => p.isSelesai).length;
    const tersisa = phasesWithStatus.filter(
      (p) => !p.isSelesai && !p.isBerjalan,
    ).length;
    return { sedang, selesai, tersisa };
  }, [phasesWithStatus]);

  const filterTabs = [
    { id: 'semua', label: 'Semua' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'berjalan', label: 'Berjalan' },
    { id: 'belum', label: 'Belum Mulai' },
  ];

  const visiblePhases = useMemo(() => {
    return phasesWithStatus.filter((p) => {
      if (activeFilter === 'semua') return true;
      if (activeFilter === 'selesai') return p.isSelesai;
      if (activeFilter === 'berjalan') return p.isBerjalan;
      if (activeFilter === 'belum') return !p.isSelesai && !p.isBerjalan;
      return true;
    });
  }, [phasesWithStatus, activeFilter]);

  if (loading) {
    return (
      <div className='max-w-7xl pb-4 mx-auto space-y-4'>
        <Skeleton className='h-24 w-full rounded-2xl' />
        <Skeleton className='h-40 w-full rounded-2xl' />
        <Skeleton className='h-[500px] w-full rounded-2xl' />
      </div>
    );
  }

  return (
    <div className='max-w-7xl pb-4 mx-auto space-y-4'>
      {/* {JSON.stringify(roadmap)} */}
      <header className='space-y-2'>
        <h1 className='text-3xl md:text-5xl'>Skill Gap Roadmap</h1>
        <p className='text-lg md:text-2xl text-gray-900/70'>
          Panduan langkah demi langkah untuk mencapai posisi target.
        </p>
      </header>

      {!content ? (
        <div className='bg-gray-100 rounded-2xl p-10 border border-gray-300 text-center space-y-4'>
          <BookOpen className='w-10 h-10 text-gray-400 mx-auto' />
          <p className='text-gray-500'>
            Belum ada roadmap. Generate dulu di halaman Analytics.
          </p>
          <Link
            href='/analytics'
            className='inline-block px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors'
          >
            Ke Analytics
          </Link>
        </div>
      ) : (
        <>
          {/* Career path card */}
          <section className='bg-linear-to-bl from-gray-900 from-65% to-90% to-gray-800 rounded-3xl p-4 border border-gray-300 shadow-sm flex flex-col gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <div className='flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium capitalize'>
                <BriefcaseBusiness className='w-4 h-4' />
                {profile?.current_position || 'Posisi saat ini'}
              </div>
              <TrendingUp className='w-5 h-5 text-gray-400 shrink-0' />
              <div className='flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium capitalize'>
                <Target className='w-4 h-4' />
                {profile?.job_roles?.name || 'Posisi target'}
              </div>
            </div>

            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <Clock className='w-4 h-4' />
              Estimasi waktu:
              <span className='font-semibold text-gray-100'>
                {content.estimatedDuration || '-'}
              </span>
            </div>

            {/* Progress bar */}
            <div className='space-y-1'>
              <div className='h-2.5 bg-gray-500 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gray-100 rounded-full transition-all duration-700'
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
            <div className='flex justify-end text-xs gap-2 text-gray-500'>
              <span>Readiness:</span>
              <span>{score}% selesai</span>
            </div>
          </section>

          {/* Summary + Market Insight */}
          <section className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {content.summary && (
              <div className='bg-gray-100 rounded-3xl p-4 border border-gray-300 shadow-sm flex gap-4'>
                <div className='p-2.5 bg-gray-200 rounded-xl h-fit shrink-0'>
                  <BookOpen className='w-5 h-5 text-gray-600' />
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>
                    Ringkasan
                  </p>
                  <p className='text-sm text-gray-700 leading-relaxed'>
                    {content.summary}
                  </p>
                </div>
              </div>
            )}

            {content.marketInsight && (
              <div className='bg-gray-100 rounded-3xl p-4 border border-gray-300 shadow-sm flex gap-4'>
                <div className='p-2.5 bg-gray-200 rounded-xl h-fit shrink-0'>
                  <BarChart2 className='w-5 h-5 text-gray-600' />
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>
                    Market Insight
                  </p>
                  <p className='text-sm text-gray-700 leading-relaxed'>
                    {content.marketInsight}
                  </p>
                </div>
              </div>
            )}
          </section>

          <div className='rounded-3xl bg-gray-100 border border-gray-300 p-4'>
            <div className='grid grid-cols-1 xl:grid-cols-[minmax(200px,240px)_1fr_minmax(220px,280px)] gap-4'>
              {/* Kolom kiri — ringkasan */}
              <div className='grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3 xl:gap-4 h-fit'>
                <div className='bg-white rounded-3xl border border-gray-300 p-4 shadow-sm'>
                  <div className='flex items-center gap-3 mb-5'>
                    <div className='bg-gray-800 rounded-xl w-10 h-10 grid place-items-center text-white shrink-0'>
                      <Loader className='w-5 h-5' strokeWidth={2} />
                    </div>
                    <span className='text-sm font-medium text-gray-600 leading-tight'>
                      Sedang Dipelajari
                    </span>
                  </div>
                  <p className='text-3xl font-semibold text-gray-800 tabular-nums'>
                    {stats.sedang}
                  </p>
                </div>

                <div className='bg-white rounded-3xl border border-gray-300 p-4 shadow-sm'>
                  <div className='flex items-center gap-3 mb-5'>
                    <div className='bg-gray-800 rounded-xl w-10 h-10 grid place-items-center text-white shrink-0'>
                      <BadgeCheck className='w-5 h-5' strokeWidth={2} />
                    </div>
                    <span className='text-sm font-medium text-gray-600 leading-tight'>
                      Fase Selesai
                    </span>
                  </div>
                  <p className='text-3xl font-semibold text-gray-800 tabular-nums'>
                    {stats.selesai}
                  </p>
                </div>

                <div className='bg-white rounded-3xl border border-gray-300 p-4 shadow-sm'>
                  <div className='flex items-center gap-3 mb-5'>
                    <div className='bg-gray-800 rounded-xl w-10 h-10 grid place-items-center text-white shrink-0'>
                      <Pause className='w-5 h-5' strokeWidth={2} />
                    </div>
                    <span className='text-sm font-medium text-gray-600 leading-tight'>
                      Fase Tersisa
                    </span>
                  </div>
                  <p className='text-3xl font-semibold text-gray-800 tabular-nums'>
                    {stats.tersisa}
                  </p>
                </div>
              </div>

              {/* Kolom tengah — timeline */}
              <div className='bg-white rounded-3xl border border-gray-300 p-4 md:p-5 flex flex-col min-h-[320px] shadow-sm'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-5'>
                  <h2 className='text-base font-semibold text-gray-800 shrink-0'>
                    Timeline Pembelajaran
                  </h2>
                  <div className='flex flex-wrap items-center gap-2'>
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type='button'
                        onClick={() => setActiveFilter(tab.id)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                          activeFilter === tab.id
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='overflow-y-auto max-h-[520px] px-1 py-1 -mx-1 space-y-0 flex-1'>
                  {visiblePhases.length === 0 ? (
                    <p className='text-sm text-gray-500 py-8 text-center'>
                      Tidak ada fase untuk filter ini.
                    </p>
                  ) : (
                    visiblePhases.map((item, index) => {
                      const isLast = index === visiblePhases.length - 1;
                      const nodeFilled = item.isSelesai;
                      const nodeActive = item.isBerjalan;

                      return (
                        <div
                          key={item.phase}
                          className='flex gap-3 items-stretch'
                        >
                          <div
                            onClick={() => setOpenPhase(item.phase)}
                            className={`flex-1 rounded-3xl border p-4 mb-4 space-y-3 cursor-pointer transition-all hover:border-gray-400 ${
                              openPhase === item.phase
                                ? 'ring-2 ring-gray-900 border-transparent shadow-md'
                                : ''
                            } ${
                              item.isSelesai
                                ? 'bg-gray-100 border-gray-300'
                                : item.isBerjalan
                                  ? 'bg-white border-gray-800/25 shadow-sm'
                                  : 'bg-white border-gray-300'
                            }`}
                          >
                            <div className='flex items-start justify-between gap-2'>
                              <p className='text-xs text-gray-700'>
                                Fase {item.phase} —{' '}
                                {item.isSelesai
                                  ? 'Selesai'
                                  : item.isBerjalan
                                    ? 'Sedang Dipelajari'
                                    : 'Belum Dimulai'}
                              </p>
                              {item.isSelesai && (
                                <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-800 text-white'>
                                  <Check
                                    className='w-4 h-4'
                                    strokeWidth={2.5}
                                  />
                                </span>
                              )}
                              {item.isBerjalan && (
                                <Loader className='w-4 h-4 text-gray-500 shrink-0 animate-spin' />
                              )}
                            </div>

                            <h3 className='font-semibold text-gray-800 text-sm md:text-base'>
                              {item.title}
                            </h3>

                            {/* Focus Skills replace tags from template */}
                            {item.focus_skills &&
                              item.focus_skills.length > 0 && (
                                <div className='flex gap-1.5 flex-wrap pt-1'>
                                  {item.focus_skills.map((skill, i) => (
                                    <span
                                      key={`${skill}-${i}`}
                                      className='text-[11px] bg-white border border-gray-300 text-gray-700 px-2.5 py-0.5 rounded-full'
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}

                            <div className='flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600 pt-1'>
                              <span>
                                Durasi:{' '}
                                <span className='font-medium text-gray-800'>
                                  {item.duration}
                                </span>
                              </span>
                            </div>

                            {/* Sub Topics */}
                            {openPhase === item.phase &&
                              item.sub_topics &&
                              item.sub_topics.length > 0 && (
                                <div className='pt-3 border-t border-gray-100 mt-3'>
                                  <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2'>
                                    Materi yang Dipelajari
                                  </p>
                                  <ul className='space-y-2'>
                                    {item.sub_topics.map((topic, j) => (
                                      <li
                                        key={j}
                                        className='flex items-start gap-2 text-xs text-gray-700'
                                      >
                                        <Lightbulb className='w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0' />
                                        <span className='leading-relaxed'>
                                          {topic}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {/* Set status buttons */}
                            <div className='flex gap-2 pt-2 border-t border-gray-100 mt-2'>
                              {!item.isSelesai && !item.isBerjalan && (
                                <button
                                  onClick={() =>
                                    togglePhaseStatus(item.phase, 'berjalan')
                                  }
                                  className='text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors'
                                >
                                  Mulai Belajar
                                </button>
                              )}
                              {item.isBerjalan && (
                                <button
                                  onClick={() =>
                                    togglePhaseStatus(item.phase, 'selesai')
                                  }
                                  className='text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                                >
                                  Tandai Selesai
                                </button>
                              )}
                              {(item.isSelesai || item.isBerjalan) && (
                                <button
                                  onClick={() =>
                                    togglePhaseStatus(item.phase, 'belum')
                                  }
                                  className='text-xs px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                                >
                                  Ulangi / Batal
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Rail timeline */}
                          <div className='flex w-5 shrink-0 flex-col items-center self-stretch pb-4'>
                            {index > 0 && (
                              <div className='w-px flex-1 min-h-3 bg-gray-300' />
                            )}
                            <div
                              className={`z-1 h-3 w-3 shrink-0 rounded-full border-2 ${
                                nodeFilled
                                  ? 'border-gray-800 bg-gray-800'
                                  : nodeActive
                                    ? 'border-gray-800 bg-white'
                                    : 'border-gray-400 bg-white'
                              }`}
                            />
                            {!isLast && (
                              <div className='w-px flex-1 min-h-3 bg-gray-300' />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Kolom kanan — resource */}
              <div className='bg-white rounded-3xl border border-gray-300 p-4 md:p-5 shadow-sm h-fit xl:sticky xl:top-8 overflow-y-auto max-h-[80vh]'>
                <h2 className='text-base font-semibold text-gray-800 mb-4'>
                  Rekomendasi Resource Belajar
                </h2>
                <div className='space-y-6'>
                  {allResources
                    .filter((res) => res.phaseNumber === openPhase)
                    .map(({ phaseNumber, phaseTitle, resources }) => (
                      <div key={phaseNumber}>
                        <p className='text-xs font-semibold text-gray-700 mb-2'>
                          Fase {phaseNumber}: {phaseTitle}
                        </p>
                        {resources.length > 0 ? (
                          <ul className='space-y-3'>
                            {resources.map((res, i) => (
                              <li key={i}>
                                <Link
                                  href={res.url}
                                  target='_blank'
                                  className='flex items-center gap-3 rounded-2xl border border-gray-300 bg-gray-100 p-3 transition-colors hover:bg-gray-200'
                                >
                                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-white'>
                                    <BookOpen
                                      className='w-5 h-5'
                                      strokeWidth={2}
                                    />
                                  </div>
                                  <div className='min-w-0'>
                                    <p className='text-sm font-semibold text-gray-800 truncate'>
                                      {res.title}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                      {res.type} - {res.platform}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className='text-sm text-gray-500 italic border border-gray-200 rounded-xl p-3 bg-gray-50'>
                            Tidak ada resource khusus untuk fase ini.
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
