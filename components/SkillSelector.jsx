'use client';

import { useState, useMemo } from 'react';
import { 
  CheckCircle, 
  ChevronDown, 
  Search, 
  Plus, 
  Minus 
} from 'lucide-react';
import { formatCategory } from '@/lib/utils';

const SkillSelector = ({ 
  allSkills = [], 
  userSkillIds = [], 
  onToggle, 
  title = "Pilih Skill yang Kamu Miliki",
  description,
  initiallyOpen = false,
  columns = 'default'
}) => {
  const [showSkillSelector, setShowSkillSelector] = useState(initiallyOpen);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSkills = useMemo(() => {
    return allSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allSkills, searchQuery]);

  // Pisahkan selected skills dan unselected skills
  const { selectedSkills, unselectedSkills } = useMemo(() => {
    const selected = [];
    const unselected = [];
    
    filteredSkills.forEach(skill => {
      if (userSkillIds.includes(skill.id)) {
        selected.push(skill);
      } else {
        unselected.push(skill);
      }
    });

    // Sort alphabetically
    selected.sort((a, b) => a.name.localeCompare(b.name));
    unselected.sort((a, b) => a.name.localeCompare(b.name));

    return { selectedSkills: selected, unselectedSkills: unselected };
  }, [filteredSkills, userSkillIds]);

  const skillsByCategory = useMemo(() => {
    const categorized = unselectedSkills.reduce((acc, skill) => {
      const category = skill.category || 'Lainnya';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});

    return categorized;
  }, [unselectedSkills]);

  return (
    <div className='bg-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-200'>
      <button
        type="button"
        onClick={() => setShowSkillSelector(!showSkillSelector)}
        className='w-full flex items-center justify-between p-4'
      >
        <div className='flex items-center gap-4 text-left'>
          <div className='p-3 rounded-xl bg-[#212529]/10 text-gray-600'>
            <CheckCircle className='w-6 h-6' />
          </div>
          <div>
            <h2 className='text-xl md:text-2xl font-bold text-gray-900'>
              {title}
            </h2>
            <p className='text-gray-500 text-sm'>
              {description || `${userSkillIds.length} skill terpilih`}
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
        <div className='p-4 bg-gray-100 border-t border-gray-200 animate-in slide-in-from-top-4 duration-300'>
          <div className='relative mb-8'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Cari skill atau kategori...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#212529]/80 focus:bg-white transition-all text-gray-900'
            />
          </div>

          <div className='space-y-10 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar'>
            {/* Selected Skills Section - Tampil di paling atas */}
            {selectedSkills.length > 0 && (
              <div className='space-y-4'>
                <h3 className='text-sm font-bold text-gray-900 uppercase tracking-widest px-1 flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' />
                  Skills Terpilih ({selectedSkills.length})
                </h3>
                <div className={`grid gap-3 ${
                  columns === 'compact'
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                }`}>
                  {selectedSkills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onToggle(skill.id);
                      }}
                      className='flex items-center justify-between gap-2 p-4 rounded-xl text-sm font-medium transition-all group bg-gray-900 text-white shadow-lg'
                    >
                      <span className='truncate'>{skill.name}</span>
                      <div className='p-1 rounded-md shrink-0 transition-colors bg-white/20'>
                        <Minus className='w-3 h-3' />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Unselected Skills by Category */}
            {Object.keys(skillsByCategory).length > 0 ? (
              Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className='space-y-4'>
                  <h3 className='text-sm font-bold text-gray-700 uppercase tracking-widest px-1'>
                    {formatCategory(category)}
                  </h3>
                  <div className={`grid gap-3 ${
                    columns === 'compact'
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                  }`}>
                    {skills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onToggle(skill.id);
                        }}
                        className='flex items-center justify-between gap-2 p-4 rounded-xl text-sm font-medium transition-all group bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-400 hover:shadow-md'
                      >
                        <span className='truncate'>{skill.name}</span>
                        <div className='p-1 rounded-md shrink-0 transition-colors bg-gray-100 group-hover:bg-gray-100'>
                          <Plus className='w-3 h-3' />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : selectedSkills.length === 0 ? (
              <div className='text-center py-20 text-gray-500'>
                Tidak ada skill yang ditemukan untuk pencarian "{searchQuery}"
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSelector;
