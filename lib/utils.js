export function formatCategory(cat) {
  const map = {
    soft_skill: 'Soft Skill',
    knowledge: 'Knowledge',
    tools: 'Tool',
    programming: 'Programming',
  };
  return map[cat] || cat;
}
