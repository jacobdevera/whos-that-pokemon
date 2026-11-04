/** Lowercase, drop accents and punctuation, and spell out gender symbols. */
export function normalizeName(name) {
  return (name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    .replace(/[^a-z0-9]/g, '');
}

/** English name from a species record, e.g. "Mr. Mime" for `mr-mime`. */
export function displayName(species) {
  const en = species?.names?.find(n => n.language.name === 'en');
  return en ? en.name : startCase(species?.name || '');
}

export function isCorrectGuess(guess, species) {
  const g = normalizeName(guess);
  if (!g) return false;
  return g === normalizeName(species.name) || g === normalizeName(displayName(species));
}

/** Latest English Pokédex entry with the game's line/page breaks removed. */
export function flavorText(species) {
  const entries = (species?.flavor_text_entries || []).filter(e => e.language.name === 'en');
  if (entries.length === 0) return '';
  return entries[entries.length - 1].flavor_text
    .replace(/[\f\n\r­]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "M _ _ _ _ _ _ _" style blanks, keeping spaces and punctuation visible. */
export function nameBlanks(name, revealFirst = false) {
  return [...name]
    .map((ch, i) => {
      if (i === 0 && revealFirst) return ch.toUpperCase();
      return /[\p{L}\p{N}]/u.test(ch) ? '_' : ch === ' ' ? '  ' : ch;
    })
    .join(' ');
}

export function startCase(str) {
  return str
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export const capitalize = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
