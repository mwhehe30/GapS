'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Target,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Zap,
  Map,
  CircleCheckBig,
  CircleQuestionMark,
} from 'lucide-react';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      fetchDashboardData(session?.access_token);
    };
    init();
  }, [router]);

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const [analysisRes, roadmapRes] = await Promise.all([
        fetch(`${apiUrl}/api/analysis`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/roadmap`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const [analysis, roadmap] = await Promise.all([
        analysisRes.json(),
        roadmapRes.json(),
      ]);
      if (analysisRes.ok) setAnalysisData(analysis);
      if (roadmapRes.ok) setRoadmapData(roadmap.roadmap);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[calc(100vh-64px)]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin' />
          <p className='text-gray-500 text-sm animate-pulse'>
            Gathering your progress...
          </p>
        </div>
      </div>
    );
  }

  const readiness = analysisData?.readinessScore || 0;
  const mastered = analysisData?.masteredCount || 0;
  const total = analysisData?.totalRequired || 0;
  const gapCount = analysisData?.gapSkills?.length || 0;
  const targetRole = analysisData?.targetRole || 'Not Set';

  const allMasteredSkills = analysisData?.masteredSkills || [];

  const readinessLabel =
    readiness >= 80
      ? 'Excellent'
      : readiness >= 60
        ? 'Good'
        : readiness >= 40
          ? 'Developing'
          : 'Needs Work';

  const readinessColor =
    readiness >= 80
      ? 'text-green-600'
      : readiness >= 60
        ? 'text-blue-600'
        : readiness >= 40
          ? 'text-yellow-600'
          : 'text-red-500';

  return (
    <section className='min-h-screen bg-gray-200 p-4 md:p-6 text-gray-900 container mx-auto'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl md:text-3xl font-bold mb-4'>
          Welcome back, {user?.user_metadata?.full_name || 'User'}
        </h1>

        <div className='flex items-center gap-4'>
          <div className=''>
            <div className='flex items-end gap-2'>
              <Target className='size-5' />
              <h3 className='text-3xl'>{total}</h3>
            </div>
            <p className='text-sm'>Target</p>
          </div>

          <div>
            <div className='flex items-end gap-2'>
              <CircleCheckBig className='size-5' />
              <h3 className='text-3xl'>{mastered}</h3>
            </div>
            <p className='text-sm'>Selesai</p>
          </div>

          <div>
            <div className='flex items-end gap-2'>
              <CircleQuestionMark className='size-5' />
              <h3 className='text-3xl'>{gapCount}</h3>
            </div>
            <p className='text-sm'>Sisa</p>
          </div>
        </div>
      </div>

      {/* Mobile: single column stack, Desktop: 4-col 2-row grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:h-[calc(100vh-140px)]'>
        {/* Card 1: Readiness Score — col 1, row 1 */}
        <div className='bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between overflow-hidden relative group'>
          <div className='absolute -right-4 -top-4 text-gray-100 group-hover:text-gray-200 transition-colors'>
            <Award size={100} />
          </div>
          <div>
            <h3 className='text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2'>
              <TrendingUp size={14} /> Readiness Score
            </h3>
            <div className='flex flex-col items-center justify-center'>
              <div className='relative w-28 h-28 flex items-center justify-center'>
                <svg className='w-full h-full transform -rotate-90'>
                  <circle
                    cx='56'
                    cy='56'
                    r='50'
                    stroke='currentColor'
                    strokeWidth='9'
                    fill='transparent'
                    className='text-gray-100'
                  />
                  <circle
                    cx='56'
                    cy='56'
                    r='50'
                    stroke='currentColor'
                    strokeWidth='9'
                    fill='transparent'
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * readiness) / 100}
                    strokeLinecap='round'
                    className='text-gray-900 transition-all duration-1000 ease-out'
                  />
                </svg>
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='text-3xl font-extrabold'>{readiness}%</span>
                </div>
              </div>
              <span className={`mt-2 text-xs font-bold ${readinessColor}`}>
                {readinessLabel}
              </span>
            </div>
          </div>
          <p className='text-xs text-gray-500 mt-3 italic'>
            Career fit for{' '}
            <span className='text-gray-900 font-bold'>{targetRole}</span>
          </p>
        </div>

        {/* Card 2: Mastery — col 2, row 1 */}
        <div className='bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between overflow-hidden'>
          <h3 className='text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2'>
            <CheckCircle2 size={14} /> Skills Mastered
          </h3>
          <div className='space-y-2'>
            <div className='flex items-end justify-between'>
              <span className='text-4xl font-extrabold text-gray-900'>
                {mastered}
              </span>
              <span className='text-gray-400 text-sm pb-1'>
                / {total} required
              </span>
            </div>
            <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
              <div
                className='bg-gray-900 h-full rounded-full transition-all duration-1000'
                style={{
                  width: total > 0 ? `${(mastered / total) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
          <div className='mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500'>
            <span className='font-medium'>{gapCount} gaps remaining</span>
            <Target size={14} className='text-gray-900' />
          </div>
        </div>

        {/* Card 3: Quick Actions — col 3, row 1 */}
        <div className='bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between'>
          <div>
            <h3 className='text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2'>
              <Zap size={14} /> Quick Actions
            </h3>
            <p className='text-sm text-gray-500 mb-4'>
              Jump right back into your workflow.
            </p>
          </div>
          <div className='flex flex-col gap-3'>
            <button
              onClick={() => router.push('/analysis')}
              className='w-full flex items-center justify-between px-4 py-3 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-opacity'
            >
              <span className='flex items-center gap-2'>
                <Target size={15} /> Run Analysis
              </span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => router.push('/roadmap')}
              className='w-full flex items-center justify-between px-4 py-3 bg-gray-100 text-gray-900 text-sm font-bold rounded-2xl hover:bg-gray-200 transition-colors border border-gray-200'
            >
              <span className='flex items-center gap-2'>
                <Map size={15} /> View Roadmap
              </span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Card 4: Learning Roadmap Timeline — col 4, row 1+2 (row-span-2) */}
        {/* On mobile this renders in normal flow after card 3 */}
        <div className='bg-white rounded-3xl border border-gray-200 p-6 md:row-span-2 flex flex-col sm:col-span-2 md:col-span-1'>
          <div className='border-b border-gray-100 pb-4 mb-4 flex items-center justify-between'>
            <h3 className='text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2'>
              <Clock size={14} /> Learning Roadmap
            </h3>
            {roadmapData && (
              <span className='px-2 py-0.5 bg-gray-100 text-gray-900 text-[10px] rounded font-bold uppercase border border-gray-200'>
                Active
              </span>
            )}
          </div>

          <div className='flex-1 overflow-y-auto pr-1'>
            {roadmapData?.content?.phases ? (
              <div className='space-y-5 pt-1'>
                {roadmapData.content.phases.slice(0, 4).map((phase, idx) => (
                  <div
                    key={idx}
                    className='relative pl-6 border-l-2 border-gray-200 last:border-transparent pb-4'
                  >
                    <div className='absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-900 flex items-center justify-center'>
                      <div className='w-1.5 h-1.5 rounded-full bg-gray-900' />
                    </div>
                    <p className='text-[10px] font-bold text-gray-400 uppercase mb-0.5'>
                      {phase.duration}
                    </p>
                    <h4 className='text-sm font-extrabold text-gray-900 line-clamp-1 mb-1'>
                      {phase.title}
                    </h4>
                    <p className='text-xs text-gray-500 line-clamp-2'>
                      {phase.focus_skills?.join(', ')}
                    </p>
                  </div>
                ))}
                {roadmapData.content.phases.length > 4 && (
                  <p className='text-center text-[10px] text-gray-400 font-medium pt-1'>
                    + {roadmapData.content.phases.length - 4} more phases
                  </p>
                )}
              </div>
            ) : (
              <div className='h-full flex flex-col items-center justify-center text-center p-4 gap-3'>
                <div className='w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 text-gray-400'>
                  <BookOpen size={22} />
                </div>
                <p className='text-xs text-gray-500'>
                  No roadmap generated yet.
                </p>
                <button
                  onClick={() => router.push('/roadmap')}
                  className='px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity'
                >
                  Generate Path
                </button>
              </div>
            )}
          </div>

          {roadmapData && (
            <button
              onClick={() => router.push('/roadmap')}
              className='mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-bold rounded-2xl transition-colors border border-gray-200 flex items-center justify-center gap-2'
            >
              Continue Learning <ArrowRight size={15} />
            </button>
          )}
        </div>

        {/* Card 5: All Mastered Skills — col 1, row 2 */}
        <div className='bg-white rounded-3xl border border-gray-200 p-6 flex flex-col overflow-hidden relative group'>
          <div className='absolute right-[-8px] bottom-[-8px] text-gray-100 rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-transform'>
            <BookOpen size={72} />
          </div>
          <h3 className='text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 shrink-0'>
            <CheckCircle2 size={14} /> Skills Learned
          </h3>
          <div className='flex-1 overflow-y-auto min-h-0'>
            {allMasteredSkills.length > 0 ? (
              <div className='space-y-1.5'>
                {allMasteredSkills.map((skill, i) => (
                  <div
                    key={skill.id ?? i}
                    className='flex items-center gap-2 px-2 py-1.5 rounded-xl bg-gray-50 border border-gray-100'
                  >
                    <CheckCircle2
                      size={13}
                      className='text-gray-900 shrink-0'
                    />
                    <div className='min-w-0'>
                      <p className='text-xs font-semibold text-gray-800 truncate'>
                        {skill.name}
                      </p>
                      {skill.category && (
                        <p className='text-[10px] text-gray-400 capitalize'>
                          {skill.category}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-xs text-gray-400 italic'>
                No skills learned yet.
              </p>
            )}
          </div>
          <p className='text-[10px] text-gray-400 mt-3 shrink-0'>
            {allMasteredSkills.length} skills total
          </p>
        </div>

        {/* Card 6: Skill Breakdown — col 2+3, row 2 (col-span-2) */}
        <div className='bg-white rounded-3xl border border-gray-200 p-6 sm:col-span-2 md:col-span-2 flex flex-col'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2'>
              <TrendingUp size={14} /> Skill Breakdown
            </h3>
            <div className='flex gap-3'>
              <span className='flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase'>
                <span className='w-2 h-2 rounded-full bg-gray-900 inline-block' />{' '}
                Mastered
              </span>
              <span className='flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase'>
                <span className='w-2 h-2 rounded-full bg-gray-200 inline-block' />{' '}
                Gap
              </span>
            </div>
          </div>

          <div className='flex-1 flex flex-col justify-center gap-4'>
            {mastered + gapCount > 0 ? (
              <>
                <div className='p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-xs text-gray-500'>
                      Overall Progress
                    </span>
                    <span className='text-xs font-bold text-gray-900'>
                      {Math.round((mastered / (mastered + gapCount)) * 100)}%
                      complete
                    </span>
                  </div>
                  {/* Segmented bar */}
                  <div className='flex gap-0.5 h-4 rounded-lg overflow-hidden'>
                    {Array.from({
                      length: Math.min(mastered + gapCount, 30),
                    }).map((_, i) => {
                      const scaledMastered = Math.round(
                        (mastered / (mastered + gapCount)) *
                          Math.min(mastered + gapCount, 30),
                      );
                      return (
                        <div
                          key={i}
                          className={`flex-1 transition-all duration-700 ${i < scaledMastered ? 'bg-gray-900' : 'bg-gray-200'}`}
                        />
                      );
                    })}
                  </div>
                  <div className='flex justify-between mt-2 text-[10px] text-gray-400 font-medium'>
                    <span>{mastered} mastered</span>
                    <span>{gapCount} to go</span>
                  </div>
                </div>

                {/* Gap skill tags */}
                {analysisData?.gapSkills?.length > 0 && (
                  <div className='flex flex-wrap gap-1.5'>
                    {analysisData.gapSkills.slice(0, 8).map((skill, i) => (
                      <span
                        key={i}
                        className='px-2.5 py-1 bg-white border border-gray-200 text-gray-600 text-[10px] font-semibold rounded-lg'
                      >
                        {skill.name}
                      </span>
                    ))}
                    {analysisData.gapSkills.length > 8 && (
                      <span className='px-2.5 py-1 text-gray-400 text-[10px] font-semibold'>
                        +{analysisData.gapSkills.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className='text-center py-6'>
                <Sparkles size={28} className='text-gray-300 mx-auto mb-2' />
                <p className='text-xs text-gray-500'>
                  Run an analysis to see your skill breakdown.
                </p>
                <button
                  onClick={() => router.push('/analysis')}
                  className='mt-3 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity'
                >
                  Start Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
