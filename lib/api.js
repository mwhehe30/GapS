const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

// Daftar semua role pekerjaan yang tersedia
export const getJobRoles = async () => {
  const res = await fetch(`${API_URL}/demo/roles`, {
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

// Ambil semua skill, bisa difilter lewat kategori kalau mau
export const getSkills = async (category = null) => {
  const url = category
    ? `${API_URL}/demo/skills?category=${category}`
    : `${API_URL}/demo/skills`;
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
