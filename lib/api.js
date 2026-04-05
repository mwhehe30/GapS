const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================
// ANALYSIS API
// ============================================================

// Ambil data analisis skill gap user
export const getAnalysis = async (sessionToken) => {
  const res = await fetch(`${API_URL}/analysis`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch analysis');
  }

  return res.json();
};

// ============================================================
// ROLES API
// ============================================================

// Daftar semua role pekerjaan yang tersedia
export const getJobRoles = async () => {
  const res = await fetch(`${API_URL}/roles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch job roles');
  }

  return res.json();
};

// Ambil detail role berdasarkan ID
export const getJobRoleById = async (roleId) => {
  const res = await fetch(`${API_URL}/roles/${roleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch job role');
  }

  return res.json();
};

// Ambil skills yang dibutuhkan untuk role tertentu
export const getSkillsForRole = async (roleId) => {
  const res = await fetch(`${API_URL}/roles/${roleId}/skills`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch skills for role');
  }

  return res.json();
};

// Search roles berdasarkan nama
export const searchJobRoles = async (query) => {
  const res = await fetch(`${API_URL}/roles/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to search job roles');
  }

  return res.json();
};

// ============================================================
// SKILLS API
// ============================================================

// Ambil semua skill, bisa difilter lewat kategori kalau mau
export const getSkills = async (category = null) => {
  const url = category
    ? `${API_URL}/skills?category=${category}`
    : `${API_URL}/skills`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch skills');
  }

  return res.json();
};

// Ambil semua kategori skill yang tersedia
export const getSkillCategories = async () => {
  const res = await fetch(`${API_URL}/skills/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch skill categories');
  }

  return res.json();
};

// Ambil detail skill berdasarkan ID (dengan resources)
export const getSkillById = async (skillId) => {
  const res = await fetch(`${API_URL}/skills/${skillId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch skill');
  }

  return res.json();
};

// Ambil learning resources untuk skill tertentu
export const getResourcesForSkill = async (skillId) => {
  const res = await fetch(`${API_URL}/skills/${skillId}/resources`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch resources for skill');
  }

  return res.json();
};

// Ambil roles yang membutuhkan skill tertentu
export const getRolesForSkill = async (skillId) => {
  const res = await fetch(`${API_URL}/skills/${skillId}/roles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch roles for skill');
  }

  return res.json();
};

// Search skills berdasarkan nama
export const searchSkills = async (query) => {
  const res = await fetch(`${API_URL}/skills/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to search skills');
  }

  return res.json();
};

// ============================================================
// ROADMAP API
// ============================================================

// Bikin roadmap baru berdasarkan hasil analisis gap user
export const generateRoadmap = async (sessionToken) => {
  const res = await fetch(`${API_URL}/roadmap/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to generate roadmap');
  }

  return res.json();
};

// Update status keseluruhan roadmap (selesai / belum selesai / berjalan)
export const updateRoadmapStatus = async (sessionToken, roadmapId, status) => {
  const res = await fetch(`${API_URL}/roadmap/${roadmapId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update roadmap status');
  }

  return res.json();
};

// Ambil data roadmap terbaru milik user
export const getRoadmap = async (sessionToken) => {
  const res = await fetch(`${API_URL}/roadmap`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch roadmap');
  }

  return res.json();
};

// ============================================================
// ROADMAP PROGRESS API
// ============================================================

// Ambil progress semua fase untuk roadmap tertentu
export const getRoadmapProgress = async (sessionToken, roadmapId) => {
  const res = await fetch(`${API_URL}/roadmap-progress/${roadmapId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch roadmap progress');
  }

  return res.json();
};

// Update status fase roadmap
export const updatePhaseStatus = async (sessionToken, roadmapId, phase, status) => {
  const res = await fetch(`${API_URL}/roadmap-progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ roadmapId, phase, status }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update phase status');
  }

  return res.json();
};

// Hapus semua progress roadmap (saat generate baru)
export const clearRoadmapProgress = async (sessionToken, roadmapId) => {
  const res = await fetch(`${API_URL}/roadmap-progress/${roadmapId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to clear roadmap progress');
  }

  return res.json();
};
