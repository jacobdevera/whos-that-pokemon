import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
   Alert, AppBar, Button, Card, CardActions, CardContent, Dialog, DialogActions,
   DialogContent, DialogContentText, DialogTitle, FormControl, FormHelperText,
   Input, InputLabel, LinearProgress, MenuItem, List, ListItem, ListItemText,
   ListSubheader, Select, Toolbar, Typography, Box, ListItemButton, Collapse,
   ThemeProvider, createTheme, CssBaseline,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import { fetchJson, fetchPokedexes, fetchRandomPokemon } from './api';
import {
   capitalize, displayName, flavorText, isCorrectGuess, nameBlanks, startCase,
} from './pokeUtils';

const MAX_HINTS = 3;
const BEST_STREAK_KEY = 'wtp-best-streak';

const darkTheme = createTheme({
   palette: {
      mode: 'dark',
      primary: { main: '#00d4ff' },
      secondary: { main: '#ffeb3b' },
      background: { default: '#1a1a1a', paper: '#2b2b2b' },
   },
   typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
   },
});

const readBestStreak = () => {
   try {
      return Number(localStorage.getItem(BEST_STREAK_KEY)) || 0;
   } catch {
      return 0;
   }
};

const saveBestStreak = (n) => {
   try {
      localStorage.setItem(BEST_STREAK_KEY, String(n));
   } catch {
      // storage unavailable (private mode etc.) — keep it in memory only
   }
};

const App = () => {
   const [helpOpen, setHelpOpen] = useState(false);
   const [loading, setLoading] = useState(false);

   return (
      <ThemeProvider theme={darkTheme}>
         <CssBaseline />
         <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" className="pokedex-bg">
               <Toolbar>
                  <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#00d4ff' }}>
                     Who's that Pokémon?
                  </Typography>
                  <Button variant="outlined" className="neon-button" onClick={() => setHelpOpen(true)}>
                     Help
                  </Button>
               </Toolbar>
            </AppBar>
            <Dialog open={helpOpen} onClose={() => setHelpOpen(false)}>
               <DialogTitle>How to Play</DialogTitle>
               <DialogContent>
                  <DialogContentText component="div">
                     <p>
                        Pick a Pokédex — a single region or game, or the National Pokédex with
                        every Pokémon — then guess who's behind the silhouette.
                     </p>
                     <p>
                        Type your guess and press Enter. Capitals, spaces and punctuation don't
                        matter, so "mr mime" counts for Mr. Mime.
                     </p>
                     <p>
                        Stuck? Each hint reveals a little more: first the types, then the name's
                        length with height and weight, then the first letter and abilities.
                        Giving up resets your streak.
                     </p>
                  </DialogContentText>
               </DialogContent>
               <DialogActions>
                  <Button onClick={() => setHelpOpen(false)} color="primary">Okay</Button>
               </DialogActions>
            </Dialog>
            <PlayArea loading={loading} setLoading={setLoading} />
         </Box>
      </ThemeProvider>
   );
};

const PlayArea = ({ loading, setLoading }) => {
   const [pokedexes, setPokedexes] = useState([]);
   const [selected, setSelected] = useState('');
   const [pokedexData, setPokedexData] = useState(null);
   const [error, setError] = useState(null);
   const [reloadKey, setReloadKey] = useState(0);
   const startController = useRef(null);

   useEffect(() => {
      const controller = new AbortController();
      setLoading(true);
      setError(null);
      fetchPokedexes({ signal: controller.signal })
         .then((list) => {
            setPokedexes(list);
            setSelected((prev) => prev || (list.find(p => p.name === 'national') || list[0])?.name || '');
         })
         .catch((e) => {
            if (e.name !== 'AbortError') setError("Couldn't load the Pokédex list. Check your connection and try again.");
         })
         .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
         });
      return () => controller.abort();
   }, [setLoading, reloadKey]);

   useEffect(() => () => startController.current?.abort(), []);

   const gameStart = (event) => {
      event.preventDefault();
      const dex = pokedexes.find(p => p.name === selected);
      if (!dex || loading) return;
      startController.current?.abort();
      const controller = new AbortController();
      startController.current = controller;
      setLoading(true);
      setError(null);
      fetchJson(dex.url, { signal: controller.signal })
         .then((data) => {
            if (!data.pokemon_entries?.length) throw new Error('empty');
            setPokedexData(data);
         })
         .catch((e) => {
            if (e.name === 'AbortError') return;
            setError(e.message === 'empty'
               ? 'That Pokédex has no Pokémon in it. Pick another one.'
               : "Couldn't load that Pokédex. Try again.");
         })
         .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
         });
   };

   const handleRestart = useCallback(() => setPokedexData(null), []);

   return (
      <Box className="container" sx={{
         maxWidth: '500px',
         padding: '60px 20px 20px 20px',
         margin: { xs: '16px', sm: '40px auto' },
         background: 'linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 100%)',
         borderRadius: '30px',
         boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset -2px -2px 5px rgba(255,255,255,0.05)',
         border: '4px solid #333',
         position: 'relative',
         overflow: 'hidden',
      }}>
         {loading && (
            <LinearProgress
               aria-label="Loading"
               sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                  bgcolor: 'rgba(0,0,0,0.3)', zIndex: 20,
                  '& .MuiLinearProgress-bar': { bgcolor: '#00d4ff' },
               }}
            />
         )}

         <Box className="pokedex-led-group" aria-hidden="true">
            <Box className={'pokedex-led ' + (loading ? 'led-active' : '')} />
            <Box className="pokedex-led-small led-red" />
            <Box className="pokedex-led-small led-yellow" />
            <Box className="pokedex-led-small led-green" />
         </Box>

         {!pokedexData && (
            <Card component="form" onSubmit={gameStart} sx={{ bgcolor: '#333', p: 3, borderRadius: '15px', border: '1px solid #444' }}>
               <Typography variant="h6" component="h2" sx={{ color: '#00d4ff', textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
                  SELECT POKÉDEX
               </Typography>
               {error && (
                  <Alert
                     severity="error"
                     sx={{ mb: 2 }}
                     action={pokedexes.length === 0 && (
                        <Button color="inherit" size="small" onClick={() => setReloadKey(k => k + 1)}>Retry</Button>
                     )}
                  >
                     {error}
                  </Alert>
               )}
               {pokedexes.length > 0 && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                     <InputLabel id="pokedex-label">Region / Game</InputLabel>
                     <Select
                        labelId="pokedex-label"
                        id="pokedex"
                        value={selected}
                        label="Region / Game"
                        onChange={(e) => setSelected(e.target.value)}
                     >
                        {pokedexes.map((pokedex) => (
                           <MenuItem key={pokedex.name} value={pokedex.name}>
                              {startCase(pokedex.name)}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               )}
               <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !selected}
                  sx={{ bgcolor: '#00d4ff', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#00acc1' } }}
               >
                  START ADVENTURE
               </Button>
            </Card>
         )}
         {pokedexData && (
            <GuessBox pokedexData={pokedexData} handleRestart={handleRestart} setLoading={setLoading} loading={loading} />
         )}
      </Box>
   );
};

const GuessBox = ({ pokedexData, handleRestart, setLoading, loading }) => {
   const [current, setCurrent] = useState(null); // { species, pokemon, sprite }
   const [guess, setGuess] = useState('');
   const [hints, setHints] = useState(0);
   const [wrong, setWrong] = useState(false);
   const [outcome, setOutcome] = useState(null); // 'correct' | 'gaveUp' | null
   const [error, setError] = useState(null);
   const [score, setScore] = useState({ correct: 0, played: 0, streak: 0, best: readBestStreak() });
   const controllerRef = useRef(null);
   const inputRef = useRef(null);

   const chooseRandomPoke = useCallback(() => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      setError(null);
      fetchRandomPokemon(pokedexData, { signal: controller.signal })
         .then((next) => {
            setCurrent(next);
            setGuess('');
            setHints(0);
            setWrong(false);
            setOutcome(null);
         })
         .catch((e) => {
            if (e.name !== 'AbortError') setError("Couldn't reach the Pokédex. Check your connection and try again.");
         })
         .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
         });
   }, [pokedexData, setLoading]);

   useEffect(() => {
      chooseRandomPoke();
      return () => controllerRef.current?.abort();
   }, [chooseRandomPoke]);

   // Free the previous sprite's object URL when a new one replaces it.
   useEffect(() => {
      const url = current?.sprite;
      return () => {
         if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      };
   }, [current]);

   const busy = loading || !current;
   const revealed = outcome !== null;

   // Put the cursor in the guess box whenever a new round is ready.
   useEffect(() => {
      if (!busy && !revealed) inputRef.current?.focus();
   }, [busy, revealed, current]);

   const finishRound = (result) => {
      setOutcome(result);
      setScore((s) => {
         const streak = result === 'correct' ? s.streak + 1 : 0;
         const best = Math.max(s.best, streak);
         if (best !== s.best) saveBestStreak(best);
         return {
            correct: s.correct + (result === 'correct' ? 1 : 0),
            played: s.played + 1,
            streak,
            best,
         };
      });
   };

   const submitGuess = (event) => {
      event.preventDefault();
      if (busy || revealed || !guess.trim()) return;
      if (isCorrectGuess(guess, current.species)) {
         finishRound('correct');
      } else {
         setWrong(true);
      }
   };

   const giveUp = () => {
      if (busy || revealed) return;
      finishRound('gaveUp');
   };

   const handleContinue = () => {
      if (loading) return;
      chooseRandomPoke();
   };

   const name = current ? displayName(current.species) : '';
   const pokemon = current?.pokemon;

   return (
      <Box>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1, color: '#aaa', fontSize: '0.85rem' }} aria-live="polite">
            <span>Score: <b style={{ color: '#fff' }}>{score.correct}</b>/{score.played}</span>
            <span>Streak: <b style={{ color: '#fff' }}>{score.streak}</b></span>
            <span>Best: <b style={{ color: '#ffeb3b' }}>{score.best}</b></span>
         </Box>
         <Box className="pokedex-screen-container">
            <Box className="pokedex-screen">
               {current && (
                  <img
                     src={current.sprite}
                     alt={revealed ? name : 'Mystery Pokémon silhouette'}
                     className={'pokemon-sprite ' + (revealed ? '' : 'silhouette')}
                     draggable={false}
                  />
               )}
            </Box>
         </Box>
         <Card sx={{ bgcolor: '#333', borderRadius: '0 0 15px 15px', border: '2px solid #444', borderTop: 'none' }}>
            {error && (
               <Alert
                  severity="error"
                  sx={{ m: 2, mb: 0 }}
                  action={<Button color="inherit" size="small" onClick={chooseRandomPoke}>Retry</Button>}
               >
                  {error}
               </Alert>
            )}
            <CardContent sx={{ pb: 0 }}>
               <Typography
                  variant="h5"
                  sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', mb: 1, letterSpacing: '0.05em', wordBreak: 'break-word' }}
               >
                  {current && hints >= 2 ? nameBlanks(name, hints >= 3) : '???'}
               </Typography>
               {pokemon && hints >= 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                     {pokemon.types.map(t => (
                        <Box key={t.type.name} sx={{
                           px: 1.5, py: 0.5, borderRadius: '20px', bgcolor: '#00d4ff', color: '#000',
                           fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                        }}>
                           {t.type.name}
                        </Box>
                     ))}
                  </Box>
               )}
               {pokemon && hints >= 2 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, color: '#bbb' }}>
                     Height {pokemon.height / 10} m · Weight {pokemon.weight / 10} kg
                  </Typography>
               )}
               {pokemon && hints >= 3 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', mt: 0.5, color: '#bbb' }}>
                     Abilities: {pokemon.abilities.map(a => startCase(a.ability.name)).join(', ')}
                  </Typography>
               )}
            </CardContent>
            <CardContent component="form" onSubmit={submitGuess} noValidate>
               <FormControl error={wrong} fullWidth>
                  <InputLabel htmlFor="guess-input">Who's that Pokémon?</InputLabel>
                  <Input
                     id="guess-input"
                     inputRef={inputRef}
                     value={guess}
                     autoComplete="off"
                     autoCorrect="off"
                     autoCapitalize="off"
                     spellCheck={false}
                     disabled={busy || revealed}
                     onChange={(e) => { setGuess(e.target.value); setWrong(false); }}
                     sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                  />
                  <FormHelperText>
                     {wrong ? 'Not quite — try again!' : 'Type your guess and press Enter'}
                  </FormHelperText>
               </FormControl>
               <CardActions sx={{ justifyContent: 'center', gap: 1, px: 0, pt: 2, flexWrap: 'wrap' }}>
                  <Button
                     variant="outlined"
                     className="neon-button"
                     onClick={() => setHints(h => Math.min(h + 1, MAX_HINTS))}
                     disabled={busy || revealed || hints >= MAX_HINTS}
                  >
                     Hint ({MAX_HINTS - hints})
                  </Button>
                  <Button type="submit" variant="contained" disabled={busy || revealed} sx={{ bgcolor: '#00d4ff', color: '#000' }}>
                     Submit
                  </Button>
                  <Button color="error" sx={{ fontWeight: 'bold' }} onClick={giveUp} disabled={busy || revealed}>
                     Give Up
                  </Button>
               </CardActions>
            </CardContent>
         </Card>
         {current && (
            <Dialog open={revealed} onClose={handleContinue} fullWidth maxWidth="xs">
               <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {outcome === 'correct'
                     ? <><Box component="span" sx={{ color: '#4caf50' }}>Correct!</Box> It's {name}!</>
                     : <>It was {name}!</>}
               </DialogTitle>
               <DialogContent>
                  <Box sx={{ textAlign: 'center', bgcolor: '#9db29d', p: 3, borderRadius: '8px', border: '3px solid #111', mb: 2 }}>
                     <img src={current.sprite} alt={name} style={{ width: 150, height: 150, imageRendering: 'pixelated' }} />
                  </Box>
                  {flavorText(current.species) && (
                     <DialogContentText sx={{ fontStyle: 'italic', color: '#e0e0e0', mb: 1 }}>
                        {flavorText(current.species)}
                     </DialogContentText>
                  )}
                  <PokeTable pokemon={current.pokemon} />
               </DialogContent>
               <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                  <Button onClick={handleContinue} disabled={loading} autoFocus sx={{ color: '#00d4ff' }}>
                     Next Pokémon
                  </Button>
                  <Button onClick={handleRestart} variant="outlined" color="primary">New Pokédex</Button>
               </DialogActions>
            </Dialog>
         )}
      </Box>
   );
};

const PokeTable = ({ pokemon }) => {
   const [open, setOpen] = useState({});
   const toggle = (id) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));

   const sections = [
      {
         id: 'games',
         title: 'Game Index Numbers',
         items: pokemon.game_indices.map(g => `${startCase(g.version.name)}: ${g.game_index}`),
      },
      { id: 'abilities', title: 'Abilities', items: pokemon.abilities.map(a => startCase(a.ability.name)) },
      { id: 'items', title: 'Held Items', items: pokemon.held_items.map(i => startCase(i.item.name)) },
   ];

   return (
      <List dense subheader={<ListSubheader sx={{ bgcolor: 'transparent', color: '#00d4ff' }}>Information</ListSubheader>}>
         <ListItem>
            <ListItemText primary={`Height: ${pokemon.height / 10} m · Weight: ${pokemon.weight / 10} kg`} />
         </ListItem>
         <ListItem>
            <ListItemText primary={`Type: ${pokemon.types.map(t => capitalize(t.type.name)).join(', ')}`} />
         </ListItem>
         {sections.map(({ id, title, items }) => (
            <React.Fragment key={id}>
               <ListItemButton onClick={() => toggle(id)} aria-expanded={!!open[id]}>
                  <ListItemText primary={title} />
                  {open[id] ? <ExpandLess /> : <ExpandMore />}
               </ListItemButton>
               <Collapse in={!!open[id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding dense>
                     {(items.length ? items : ['None']).map((text, i) => (
                        <ListItem key={i} sx={{ pl: 4 }}>
                           <ListItemText primary={text} />
                        </ListItem>
                     ))}
                  </List>
               </Collapse>
            </React.Fragment>
         ))}
      </List>
   );
};

export default App;
