import { describe, it, expect } from 'vitest';
import { normalizeName, displayName, isCorrectGuess, flavorText, nameBlanks, startCase } from './pokeUtils';

const species = (name, enName) => ({
  name,
  names: [
    { name: 'ignored', language: { name: 'ja' } },
    { name: enName, language: { name: 'en' } },
  ],
});

describe('isCorrectGuess', () => {
  it.each([
    ['mr-mime', 'Mr. Mime', 'mr mime'],
    ['mr-mime', 'Mr. Mime', 'Mr. Mime'],
    ['mr-mime', 'Mr. Mime', 'MRMIME'],
    ['ho-oh', 'Ho-Oh', 'hooh'],
    ['farfetchd', 'Farfetch’d', "farfetch'd"],
    ['nidoran-f', 'Nidoran♀', 'nidoran f'],
    ['nidoran-m', 'Nidoran♂', 'Nidoran♂'],
    ['flabebe', 'Flabébé', 'flabebe'],
    ['type-null', 'Type: Null', 'type null'],
    ['pikachu', 'Pikachu', '  PIKACHU  '],
  ])('%s accepts "%s"', (name, en, guess) => {
    expect(isCorrectGuess(guess, species(name, en))).toBe(true);
  });

  it('rejects wrong or empty guesses', () => {
    expect(isCorrectGuess('raichu', species('pikachu', 'Pikachu'))).toBe(false);
    expect(isCorrectGuess('', species('pikachu', 'Pikachu'))).toBe(false);
    expect(isCorrectGuess('  ', species('pikachu', 'Pikachu'))).toBe(false);
  });
});

describe('displayName', () => {
  it('uses the English name', () => {
    expect(displayName(species('mr-mime', 'Mr. Mime'))).toBe('Mr. Mime');
  });
  it('falls back to a start-cased API name', () => {
    expect(displayName({ name: 'tapu-koko', names: [] })).toBe('Tapu Koko');
  });
});

describe('flavorText', () => {
  it('cleans up form feeds and newlines', () => {
    const s = {
      flavor_text_entries: [
        { flavor_text: 'old', language: { name: 'en' } },
        { flavor_text: 'Bonjour', language: { name: 'fr' } },
        { flavor_text: 'It stores\nelectricity\fin its\ncheeks.', language: { name: 'en' } },
      ],
    };
    expect(flavorText(s)).toBe('It stores electricity in its cheeks.');
  });
  it('returns empty when there is no English entry', () => {
    expect(flavorText({ flavor_text_entries: [] })).toBe('');
  });
});

describe('nameBlanks', () => {
  it('keeps punctuation and spaces visible', () => {
    expect(nameBlanks('Mr. Mime')).toBe('_ _ .    _ _ _ _');
  });
  it('can reveal the first letter', () => {
    expect(nameBlanks('Eevee', true)).toBe('E _ _ _ _');
  });
});

it('normalizeName and startCase', () => {
  expect(normalizeName('Flabébé')).toBe('flabebe');
  expect(startCase('original-ulaula')).toBe('Original Ulaula');
});
