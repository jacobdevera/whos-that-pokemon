import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const json = (body, ok = true) => Promise.resolve({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) });

const routes = {
  'https://pokeapi.co/api/v2/pokedex/?limit=1000': {
    results: [
      { name: 'national', url: 'dex/national' },
      { name: 'paldea', url: 'dex/paldea' },
    ],
  },
  'dex/national': { pokemon_entries: [{ entry_number: 122, pokemon_species: { url: 'species/mr-mime' } }] },
  'species/mr-mime': {
    name: 'mr-mime',
    names: [{ name: 'Mr. Mime', language: { name: 'en' } }],
    varieties: [{ is_default: true, pokemon: { url: 'pokemon/122' } }],
    flavor_text_entries: [{ flavor_text: 'A pantomime\fexpert.', language: { name: 'en' } }],
  },
  'pokemon/122': {
    height: 13, weight: 545,
    sprites: { front_default: 'sprite/122.png' },
    types: [{ type: { name: 'psychic' } }, { type: { name: 'fairy' } }],
    abilities: [{ ability: { name: 'soundproof' } }],
    game_indices: [], held_items: [],
  },
};

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  globalThis.fetch = vi.fn((url) => (url in routes ? json(routes[url]) : json({}, false)));
});

async function startGame(user) {
  render(<App />);
  await screen.findByRole('combobox');
  await user.click(screen.getByRole('button', { name: /start adventure/i }));
  return screen.findByLabelText(/who's that pokémon\?/i, { selector: 'input' });
}

describe('App', () => {
  it('requests every Pokédex, not just the first page', async () => {
    render(<App />);
    await screen.findByRole('combobox');
    expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokedex/?limit=1000', expect.anything());
  });

  it('submits on Enter and accepts a loosely typed name', async () => {
    const user = userEvent.setup();
    const input = await startGame(user);
    await vi.waitFor(() => expect(input).toBeEnabled());

    await user.type(input, 'mr mim{Enter}');
    expect(screen.getByText(/not quite/i)).toBeInTheDocument();

    await user.type(input, 'e{Enter}');
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/correct!/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/it's mr\. mime!/i)).toBeInTheDocument();
    expect(within(dialog).getByText('A pantomime expert.')).toBeInTheDocument();
    expect(screen.getByText(/score:/i)).toHaveTextContent('Score: 1/1');
  });

  it('giving up shows the answer and resets the streak', async () => {
    const user = userEvent.setup();
    const input = await startGame(user);
    await vi.waitFor(() => expect(input).toBeEnabled());
    await user.click(screen.getByRole('button', { name: /give up/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/it was mr\. mime!/i)).toBeInTheDocument();
    expect(screen.getByText(/score:/i)).toHaveTextContent('Score: 0/1');
  });

  it('reveals hints one step at a time', async () => {
    const user = userEvent.setup();
    const input = await startGame(user);
    await vi.waitFor(() => expect(input).toBeEnabled());
    const hint = screen.getByRole('button', { name: /hint/i });

    await user.click(hint);
    expect(screen.getByText('psychic')).toBeInTheDocument();
    expect(screen.queryByText(/height/i)).not.toBeInTheDocument();

    await user.click(hint);
    expect(screen.getByText(/height 1.3 m/i)).toBeInTheDocument();

    await user.click(hint);
    expect(screen.getByText(/abilities: soundproof/i)).toBeInTheDocument();
    expect(hint).toBeDisabled();
  });

  it('shows a retry option when the Pokédex list fails to load', async () => {
    globalThis.fetch = vi.fn(() => json({}, false));
    render(<App />);
    expect(await screen.findByText(/couldn't load the pokédex list/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
