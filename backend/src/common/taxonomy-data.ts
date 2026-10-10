import taxonomy from '../taxonomy/data.json' with { type: 'json' };

export { taxonomy };
export const SKILLS = taxonomy.skills;
export const CITIES = taxonomy.cities;
export const SKILL_BY_ID = new Map(SKILLS.map(skill => [skill.id, skill]));
export function skillName(id: string): string { return SKILL_BY_ID.get(id)?.name ?? id; }
export function skillRef(id: string) { return { id, name: skillName(id) }; }
