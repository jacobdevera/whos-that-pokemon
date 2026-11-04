const API = 'https://pokeapi.co/api/v2';

export async function fetchJson(url, { signal } = {}) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

/** All Pokédexes (the API pages at 20 by default, so ask for everything). */
export async function fetchPokedexes({ signal } = {}) {
  const data = await fetchJson(`${API}/pokedex/?limit=1000`, { signal });
  return data.results;
}

/**
 * Loads the sprite into an object URL so the image address in the page
 * doesn't give away the Pokédex number. Falls back to the plain URL.
 */
export async function loadSprite(url, { signal } = {}) {
  if (typeof URL.createObjectURL !== 'function') return url;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return url;
    return URL.createObjectURL(await res.blob());
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    return url;
  }
}

export function spriteUrlOf(pokeData) {
  const s = pokeData?.sprites;
  return s?.front_default || s?.other?.['official-artwork']?.front_default || null;
}

/**
 * Picks a random Pokémon from a Pokédex that has a sprite. Tries a few
 * entries in case some lack artwork.
 */
export async function fetchRandomPokemon(pokedexData, { signal, attempts = 5 } = {}) {
  const entries = pokedexData.pokemon_entries;
  for (let i = 0; i < attempts; i++) {
    const entry = entries[Math.floor(Math.random() * entries.length)];
    const species = await fetchJson(entry.pokemon_species.url, { signal });
    const variety = species.varieties.find(v => v.is_default) || species.varieties[0];
    const pokemon = await fetchJson(variety.pokemon.url, { signal });
    const spriteUrl = spriteUrlOf(pokemon);
    if (spriteUrl) {
      const sprite = await loadSprite(spriteUrl, { signal });
      return { species, pokemon, sprite, entryNumber: entry.entry_number };
    }
  }
  throw new Error('Could not find a Pokémon with a sprite');
}
