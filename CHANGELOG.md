# Changelog - Frontend GapS

## [2.2.0] - 2026-04-05

### 🎨 UI/UX Major Redesign

#### Changed
- **Auth Pages Redesign** - Complete visual overhaul for better UX
  - Updated `app/lupa-kata-sandi/page.jsx` - Modern card-based layout
  - Updated `app/reset-kata-sandi/page.jsx` - Improved form design
  - All content now inside single centered card (max-w-md)
  - Larger icons (w-20 h-20) with better visual hierarchy
  - Input fields with labels and icons for better clarity
  - Dark button (bg-gray-900) for stronger CTA
  - Better spacing and typography (p-8 md:p-10)
  - Enhanced borders and shadows (shadow-xl, border-gray-300)
  - Improved success/error states with better visual feedback

#### Added
- Form labels for all input fields
- Icon indicators inside input fields (Mail, Lock)
- Better placeholder text
- Enhanced password strength indicator
- Improved error message styling with borders

---

## [2.1.0] - 2026-04-05

### 🎨 UI/UX Improvements

#### Changed
- **Color System Standardization** - Replaced hex colors with Tailwind gray classes
  - Updated `app/onboarding/page.jsx`
  - Updated `app/lupa-kata-sandi/page.jsx`
  - Updated `app/reset-kata-sandi/page.jsx`
  - All auth pages now use consistent color-gray variables from `globals.css`
  - Color mapping: `#dde3e8` → `gray-200`, `#8a9199` → `gray-500`, `#c8cdd2` → `gray-300`

- **Loading Component Redesign** - Replaced all Skeleton loaders with spinner loading
  - Updated `app/(main)/roadmap/page.jsx`
  - Updated `app/(main)/dashboard/page.jsx`
  - Updated `app/(main)/analytics/page.jsx`
  - Updated `app/(main)/profile/page.jsx`
  - Loading style now matches onboarding page for consistency

#### Added
- **New Loading Component** - `components/Loading.jsx`
  - Three sizes: `small`, `default`, `large`
  - `fullScreen` prop for full-page loading
  - Consistent spinner design across all pages

#### Removed
- Skeleton loader component (replaced with spinner)
- Hardcoded hex colors in auth pages

---

## [2.0.0] - 2026-04-05

### 🎉 Major Update: API Endpoints Migration

#### Changed
- **API Endpoints Updated** - Migrated from `/api/demo/*` to `/api/*` endpoints
  - `GET /api/demo/roles` → `GET /api/roles`
  - `GET /api/demo/skills` → `GET /api/skills`
  - All demo endpoints now use production endpoints

#### Added
- **New API Functions** in `lib/api.js`:
  
  **Roles API (4 new functions):**
  - `getJobRoleById(roleId)` - Get specific role details
  - `getSkillsForRole(roleId)` - Get required & nice-to-have skills for role
  - `searchJobRoles(query)` - Search roles by name
  
  **Skills API (6 new functions):**
  - `getSkillCategories()` - Get all skill categories
  - `getSkillById(skillId)` - Get skill details with resources
  - `getResourcesForSkill(skillId)` - Get learning resources for skill
  - `getRolesForSkill(skillId)` - Get roles that require skill
  - `searchSkills(query)` - Search skills by name
  
- **Documentation Files:**
  - `API_USAGE.md` - Complete guide for using API functions
  - `CHANGELOG.md` - This file

#### Updated
- `README.md` - Updated API Integration section with new endpoints
- `lib/api.js` - Organized into sections (Analysis, Roles, Skills, Roadmap)

### 📊 API Functions Summary

**Total Functions:** 15

| Category | Functions | Auth Required |
|----------|-----------|---------------|
| Roles | 4 | No |
| Skills | 6 | No |
| Analysis | 1 | Yes |
| Roadmap | 3 | Yes |

### 🔄 Migration Guide

#### Before (v1.x):
```javascript
// Old endpoints
const { roles } = await fetch('/api/demo/roles');
const { skills } = await fetch('/api/demo/skills');
```

#### After (v2.0):
```javascript
// New endpoints
import { getJobRoles, getSkills } from '@/lib/api';

const { roles } = await getJobRoles();
const { skills } = await getSkills();
```

### ✨ New Features

#### 1. Category Filtering
```javascript
// Get only programming skills
const { skills } = await getSkills('programming');

// Get all categories
const { categories } = await getSkillCategories();
```

#### 2. Search Functionality
```javascript
// Search roles
const { roles, count } = await searchJobRoles('frontend');

// Search skills
const { skills, count } = await searchSkills('react');
```

#### 3. Detailed Resources
```javascript
// Get skill with learning resources
const { skill, resources } = await getSkillById(skillId);

// Get resources grouped by type
const { byType } = await getResourcesForSkill(skillId);
// byType.article = [...]
// byType.video = [...]
```

#### 4. Relationship Queries
```javascript
// Get skills for a role
const { skills } = await getSkillsForRole(roleId);
// skills.required = [...]
// skills.nice_to_have = [...]

// Get roles that need a skill
const { roles } = await getRolesForSkill(skillId);
// roles.required = [...]
// roles.nice_to_have = [...]
```

### 🐛 Bug Fixes
- Fixed API endpoint paths to use production routes
- Improved error handling in API functions

### 📝 Notes
- All existing functionality remains the same
- No breaking changes for components using old functions
- New functions are additions, not replacements
- Demo endpoints still available for backward compatibility

### 🚀 Performance
- Direct API calls (no `/demo` prefix) = faster response
- Better caching with production endpoints
- Reduced API call overhead

### 📚 Documentation
- Complete API usage guide in `API_USAGE.md`
- Examples for all new functions
- Migration guide included

---

## [1.0.0] - 2026-03-XX

### Initial Release
- Basic authentication with Supabase
- Dashboard with skill gap analysis
- Roadmap generation
- Profile management
- Demo endpoints for testing

---

**Maintained by:** Skill Gap Tracker Team  
**Last Updated:** April 5, 2026
