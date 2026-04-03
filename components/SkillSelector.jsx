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
  initiallyOpen = false
}) => {
  const [showSkillSelector, setShowSkillSelector] = useState(initiallyOpen);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter skill berdasarkan ketikan user di kotak pencarian
  const filteredSkills = useMemo(() => {
    return allSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allSkills, searchQuery]);

  // Kelompokkan skill berdasarkan kategori biar lebih rapi di UI
  const skillsByCategory = useMemo(() => {
    return filteredSkills.reduce((acc, skill) => {
      const category = skill.category || 'Lainnya';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});
  }, [filteredSkills]);

  return (
    <div className='bg-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-200'>
      <button
        type="button"
        onClick={() => setShowSkillSelector(!showSkillSelector)}
        className='w-full flex items-center justify-between p-4'
      >
        <div className='flex items-center gap-4 text-left'>
          <div className='p-3 rounded-xl bg-indigo-50 text-indigo-600'>
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
          {/* Kotak buat nyari skill atau kategori */}
          <div className='relative mb-8'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Cari skill atau kategori...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900'
            />
          </div>

          {/* Daftar pilihan skill per kategori */}
          <div className='space-y-10 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar'>
            {Object.keys(skillsByCategory).length > 0 ? (
              Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className='space-y-4'>
                  <h3 className='text-sm font-bold text-indigo-600 uppercase tracking-widest px-1'>
                    {formatCategory(category)}
                  </h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3'>
                    {skills.map((skill) => {
                      const isSelected = userSkillIds.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onToggle(skill.id);
                          }}
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
                Tidak ada skill yang ditemukan untuk pencarian "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSelector;
