const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get user's current analysis (gap + readiness score)
 */
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

/**
 * Get all job roles
 */
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

/**
 * Get all skills (optionally filtered by category)
 */
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

/**
 * Generate roadmap based on gap analysis
 */
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

/**
 * Get latest saved roadmap for the user
 */
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
