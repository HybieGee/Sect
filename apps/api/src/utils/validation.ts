export const PROFANITY_FILTER = [
  'hate', 'violence', 'racist', 'sexist'
];

export function validateCultName(name: string): boolean {
  if (!name || name.length < 3 || name.length > 50) return false;
  
  const lowerName = name.toLowerCase();
  for (const word of PROFANITY_FILTER) {
    if (lowerName.includes(word)) return false;
  }
  
  return true;
}

export function validateSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 30) return false;
  return /^[a-z0-9-]+$/.test(slug);
}

export function validateDescription(desc: string): boolean {
  if (!desc || desc.length > 500) return false;
  
  const lowerDesc = desc.toLowerCase();
  for (const word of PROFANITY_FILTER) {
    if (lowerDesc.includes(word)) return false;
  }
  
  return true;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/<[^>]*>/g, '');
}