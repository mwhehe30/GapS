# Skill Gap Tracker - Frontend

Frontend aplikasi Skill Gap Tracker menggunakan Next.js 16 dengan React 19, Tailwind CSS, dan Supabase Authentication.

## Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Language**: JavaScript/JSX

## Prerequisites

Pastikan sudah terinstall:
- Node.js 18+ 
- npm atau yarn
- Backend API sudah berjalan di `http://localhost:5000`

## Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan kredensial Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Cara mendapatkan kredensial Supabase:**
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project kamu
3. Pergi ke **Settings** → **API**
4. Copy **Project URL** untuk `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon public** key untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Jalankan Development Server

```bash
npm run dev
```

Frontend akan berjalan di [http://localhost:3000](http://localhost:3000)

### 4. Build untuk Production

```bash
npm run build
npm start
```

## Struktur Folder

```
GapS/
├── app/
│   ├── (main)/              # Protected routes (butuh login)
│   │   ├── dashboard/       # Halaman dashboard utama
│   │   ├── analytics/       # Analisis skill gap
│   │   ├── roadmap/         # Learning roadmap
│   │   ├── profile/         # User profile
│   │   └── layout.jsx       # Layout dengan sidebar
│   ├── signin/              # Halaman login
│   ├── signup/              # Halaman register
│   ├── lupa-kata-sandi/     # Reset password
│   ├── globals.css          # Global styles
│   └── layout.jsx           # Root layout
├── components/              # Reusable components
├── lib/
│   ├── api.js              # API client functions
│   └── supabase.js         # Supabase client config
├── public/                  # Static assets
└── .env                     # Environment variables
```

## Fitur Utama

1. **Authentication**
   - Login/Register dengan Supabase Auth
   - Protected routes dengan middleware
   - Session management

2. **Dashboard**
   - Overview skill gap analysis
   - Progress tracking
   - Quick actions

3. **Analytics**
   - Skill gap visualization
   - Mastered vs gap skills
   - Job role comparison

4. **Roadmap**
   - Personalized learning path
   - Phase-based learning
   - Resource recommendations
   - Progress tracking per phase

5. **Profile**
   - User information
   - Target role selection
   - Current skills management

## API Integration

Frontend berkomunikasi dengan backend melalui REST API. Semua API calls ada di `lib/api.js`.

### Available API Functions

**Roles API:**
```javascript
import { 
  getJobRoles,           // Get all roles
  getJobRoleById,        // Get role by ID
  getSkillsForRole,      // Get skills for role
  searchJobRoles         // Search roles
} from '@/lib/api';
```

**Skills API:**
```javascript
import { 
  getSkills,             // Get all skills (with optional category filter)
  getSkillCategories,    // Get all categories
  getSkillById,          // Get skill by ID with resources
  getResourcesForSkill,  // Get learning resources
  getRolesForSkill,      // Get roles that require skill
  searchSkills           // Search skills
} from '@/lib/api';
```

**Analysis & Roadmap API:**
```javascript
import { 
  getAnalysis,           // Get user's skill gap analysis
  generateRoadmap,       // Generate personalized roadmap
  getRoadmap,            // Get user's current roadmap
  updateRoadmapStatus    // Update roadmap status
} from '@/lib/api';
```

### Usage Example

```javascript
// Get all roles
const { roles } = await getJobRoles();

// Get skills by category
const { skills } = await getSkills('programming');

// Search skills
const { skills, count } = await searchSkills('react');

// Get skill with resources
const { skill, resources } = await getSkillById(skillId);

// Authenticated requests
const analysis = await getAnalysis(sessionToken);
const { roadmap } = await generateRoadmap(sessionToken);
```

**Endpoint yang digunakan:**
- `GET /api/roles` - List semua job roles
- `GET /api/roles/:id` - Detail role
- `GET /api/roles/:id/skills` - Skills untuk role
- `GET /api/roles/search?q=query` - Search roles
- `GET /api/skills` - List semua skills
- `GET /api/skills?category=programming` - Filter by category
- `GET /api/skills/categories` - List categories
- `GET /api/skills/:id` - Detail skill + resources
- `GET /api/skills/:id/resources` - Learning resources
- `GET /api/skills/:id/roles` - Roles yang butuh skill
- `GET /api/skills/search?q=query` - Search skills
- `GET /api/analysis` - Analisis skill gap (auth)
- `POST /api/roadmap/generate` - Generate roadmap (auth)
- `GET /api/roadmap` - Get roadmap (auth)
- `PATCH /api/roadmap/:id/status` - Update status (auth)

📚 **Dokumentasi lengkap:** Lihat [API_USAGE.md](./API_USAGE.md)

## Troubleshooting

### Frontend tidak bisa connect ke backend
- Pastikan backend sudah running di port 5000
- Cek `NEXT_PUBLIC_API_URL` di `.env` sudah benar
- Cek CORS settings di backend

### Authentication error
- Pastikan Supabase credentials di `.env` sudah benar
- Cek apakah Supabase project sudah enable Email Auth
- Clear browser cookies dan coba login lagi

### Build error
- Hapus folder `.next` dan `node_modules`
- Jalankan `npm install` lagi
- Pastikan Node.js versi 18+

## Development Tips

- Hot reload otomatis aktif saat development
- Gunakan React DevTools untuk debugging
- Cek Network tab di browser untuk debug API calls
- Tailwind CSS classes auto-complete dengan VS Code extension

## Deploy

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Set environment variables di Vercel dashboard
4. Deploy otomatis setiap push ke main branch

### Manual Deploy

```bash
npm run build
npm start
```

Server production akan jalan di port 3000.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
