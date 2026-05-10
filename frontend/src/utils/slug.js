export function toSlug(str = '') {
  return str
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')   // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
