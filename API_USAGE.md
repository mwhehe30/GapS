# Frontend API Usage Guide

Panduan lengkap menggunakan API functions di frontend Next.js.

## 📁 File Location

All API functions are in: `lib/api.js`

## 🔧 Setup

Make sure `.env` file has the correct API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📚 Available Functions

### 🎯 Roles API

#### 1. Get All Roles
```javascript
import { getJobRoles } from '@/lib/api';

const { roles } = await getJobRoles();
// Returns: { roles: [...] }
```

**Use Case:** Display list of all job roles in dropdown/select

---

#### 2. Get Role by ID
```javascript
import { getJobRoleById } from '@/lib/api';

const { role } = await getJobRoleById(roleId);
// Returns: { role: { id, name, description } }
```

**Use Case:** Show role details page

---

#### 3. Get Skills for Role
```javascript
import { getSkillsForRole } from '@/lib/api';

const { role, skills } = await getSkillsForRole(roleId);
// Returns: {
//   role: { id, name },
//   skills: {
//     required: [...],
//     nice_to_have: [...],
//     total: 15
//   }
// }
```

**Use Case:** Show required and nice-to-have skills for a role

---

#### 4. Search Roles
```javascript
import { searchJobRoles } from '@/lib/api';

const { query, count, roles } = await searchJobRoles('frontend');
// Returns: { query: 'frontend', count: 3, roles: [...] }
```

**Use Case:** Search functionality in role selector

---

### 🛠️ Skills API

#### 1. Get All Skills
```javascript
import { getSkills } from '@/lib/api';

// All skills
const { skills, count } = await getSkills();

// Filter by category
const { skills, count, category } = await getSkills('programming');
```

**Categories:**
- `programming` - Programming languages & frameworks
- `tools` - Software tools & platforms
- `knowledge` - Concepts & methodologies
- `soft_skill` - Interpersonal skills

**Use Case:** Display skills list, filter by category

---

#### 2. Get Skill Categories
```javascript
import { getSkillCategories } from '@/lib/api';

const { categories, count } = await getSkillCategories();
// Returns: { categories: ['programming', 'tools', ...], count: 4 }
```

**Use Case:** Build category filter dropdown

---

#### 3. Get Skill by ID
```javascript
import { getSkillById } from '@/lib/api';

const { skill, resources } = await getSkillById(skillId);
// Returns: {
//   skill: { id, name, category },
//   resources: [{ title, type, url, platform }, ...]
// }
```

**Use Case:** Show skill detail page with learning resources

---

#### 4. Get Resources for Skill
```javascript
import { getResourcesForSkill } from '@/lib/api';

const { skill, resources, byType, total } = await getResourcesForSkill(skillId);
// Returns: {
//   skill: { id, name },
//   resources: [...],
//   byType: { article: [...], video: [...] },
//   total: 3
// }
```

**Use Case:** Display learning resources grouped by type

---

#### 5. Get Roles for Skill
```javascript
import { getRolesForSkill } from '@/lib/api';

const { skill, roles } = await getRolesForSkill(skillId);
// Returns: {
//   skill: { id, name },
//   roles: {
//     required: [...],
//     nice_to_have: [...],
//     total: 12
//   }
// }
```

**Use Case:** Show which roles require this skill

---

#### 6. Search Skills
```javascript
import { searchSkills } from '@/lib/api';

const { query, count, skills } = await searchSkills('react');
// Returns: { query: 'react', count: 2, skills: [...] }
```

**Use Case:** Search functionality in skill selector

---

### 📊 Analysis API

#### Get User Analysis
```javascript
import { getAnalysis } from '@/lib/api';

const analysis = await getAnalysis(sessionToken);
// Returns: {
//   targetRole: 'Frontend Developer',
//   readinessScore: 75.5,
//   totalRequired: 10,
//   masteredCount: 7,
//   masteredSkills: [...],
//   gapSkills: [...],
//   niceToHaveSkills: [...]
// }
```

**Authentication:** Required

**Use Case:** Display user's skill gap analysis

---

### 🗺️ Roadmap API

#### 1. Generate Roadmap
```javascript
import { generateRoadmap } from '@/lib/api';

const { roadmap } = await generateRoadmap(sessionToken);
// Returns: { roadmap: { phases: [...] } }
```

**Authentication:** Required

**Use Case:** Generate personalized learning roadmap

---

#### 2. Get Roadmap
```javascript
import { getRoadmap } from '@/lib/api';

const { roadmap } = await getRoadmap(sessionToken);
// Returns: { roadmap: { id, phases, status, ... } }
```

**Authentication:** Required

**Use Case:** Display user's current roadmap

---

#### 3. Update Roadmap Status
```javascript
import { updateRoadmapStatus } from '@/lib/api';

await updateRoadmapStatus(sessionToken, roadmapId, 'berjalan');
// Status: 'selesai' | 'belum selesai' | 'berjalan'
```

**Authentication:** Required

**Use Case:** Update roadmap completion status

---

## 🎨 Usage Examples

### Example 1: Role Selector Component

```jsx
'use client';
import { useState, useEffect } from 'react';
import { getJobRoles, searchJobRoles } from '@/lib/api';

export default function RoleSelector() {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const { roles } = await getJobRoles();
      setRoles(roles);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (query.length > 2) {
      try {
        const { roles } = await searchJobRoles(query);
        setRoles(roles);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      loadRoles();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search roles..."
      />
      <select>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

### Example 2: Skill Detail Page

```jsx
'use client';
import { useState, useEffect } from 'react';
import { getSkillById } from '@/lib/api';

export default function SkillDetailPage({ params }) {
  const [skill, setSkill] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkill();
  }, [params.id]);

  const loadSkill = async () => {
    try {
      const data = await getSkillById(params.id);
      setSkill(data.skill);
      setResources(data.resources);
    } catch (error) {
      console.error('Failed to load skill:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!skill) return <div>Skill not found</div>;

  return (
    <div>
      <h1>{skill.name}</h1>
      <p>Category: {skill.category}</p>
      
      <h2>Learning Resources</h2>
      {resources.length === 0 ? (
        <p>No resources available</p>
      ) : (
        <ul>
          {resources.map((resource) => (
            <li key={resource.id}>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                {resource.title} ({resource.type})
              </a>
              <span> - {resource.platform}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### Example 3: Skills by Category

```jsx
'use client';
import { useState, useEffect } from 'react';
import { getSkills, getSkillCategories } from '@/lib/api';

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadSkills();
  }, []);

  const loadCategories = async () => {
    try {
      const { categories } = await getSkillCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadSkills = async (category = null) => {
    try {
      const { skills } = await getSkills(category);
      setSkills(skills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    loadSkills(category);
  };

  return (
    <div>
      <h1>Skills</h1>
      
      <div>
        <button onClick={() => handleCategoryChange(null)}>All</button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={selectedCategory === cat ? 'active' : ''}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {skills.map((skill) => (
            <li key={skill.id}>
              {skill.name} <span>({skill.category})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 🔐 Authentication

For authenticated endpoints, get session token from AuthContext:

```jsx
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { session } = useAuth();
  
  const loadData = async () => {
    if (session?.access_token) {
      const data = await getAnalysis(session.access_token);
      // Use data...
    }
  };
  
  // ...
}
```

---

## ⚠️ Error Handling

All API functions throw errors that should be caught:

```javascript
try {
  const { roles } = await getJobRoles();
  // Success
} catch (error) {
  console.error('API Error:', error.message);
  // Show error to user
}
```

---

## 🧪 Testing

Test API functions in browser console:

```javascript
// Open browser console on your Next.js page
import { getJobRoles } from './lib/api';

getJobRoles().then(console.log).catch(console.error);
```

---

## 📝 Notes

1. All functions are async - use `await` or `.then()`
2. API URL is configured in `.env` file
3. No authentication needed for roles/skills endpoints
4. Authentication required for analysis/roadmap endpoints
5. All functions return JSON objects
6. Errors are thrown and should be caught

---

**Last Updated:** April 5, 2026
