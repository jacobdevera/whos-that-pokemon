import React, { useState, useEffect } from 'react';
import PokeController from './PokeController';
import { 
   AppBar, Button, Card, CardActions, CardContent, CardMedia, Dialog, 
   DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, 
   FormHelperText, IconButton, Input, InputLabel, LinearProgress, Menu, MenuItem, 
   List, ListItem, ListItemText, ListSubheader, Select, Toolbar, Typography,
   Box, ListItemButton, Collapse, ThemeProvider, createTheme, CssBaseline
} from '@mui/material';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import _ from 'lodash';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
    },
    secondary: {
      main: '#ffeb3b',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2b2b2b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App = () => {
   const [dialogOpen, setDialogOpen] = useState(false);
   const [globalLoading, setGlobalLoading] = useState(false);

   const handleDialogOpen = () => setDialogOpen(true);
   const handleDialogClose = () => setDialogOpen(false);

   return (
      <ThemeProvider theme={darkTheme}>
         <CssBaseline />
         <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" className="pokedex-bg">
               <Toolbar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#00d4ff' }}>
                     Who's that Pokemon?
                  </Typography>
                  <Button variant="outlined" className="neon-button" onClick={handleDialogOpen}>
                     Help
                  </Button>
                  <Dialog open={dialogOpen} onClose={handleDialogClose}>
                     <DialogTitle>{"How to Play"}</DialogTitle>
                     <DialogContent>
                        <DialogContentText>
                           Choose a Pokedex from one of the various games. The national Pokedex 
                           includes all Pokemon up to generation VI. You will then be asked
                           to guess the Pokemon based on the given sprite.
                        </DialogContentText>
                     </DialogContent>
                     <DialogActions>
                        <Button onClick={handleDialogClose} color="primary">
                           Okay
                        </Button>
                     </DialogActions>
                  </Dialog>
               </Toolbar>
            </AppBar>
            <PlayArea setGlobalLoading={setGlobalLoading} globalLoading={globalLoading} />
         </Box>
      </ThemeProvider>
   );
};

const PlayArea = ({ setGlobalLoading, globalLoading }) => {
   const [value, setValue] = useState(0);
   const [pokedexes, setPokedexes] = useState([]);
   const [pokedexData, setPokedexData] = useState({});
   const [started, setStarted] = useState(false);

   useEffect(() => {
      let pokedexArray = [];
      setGlobalLoading(true);
      PokeController.fetchData('https://pokeapi.co/api/v2/pokedex/')
      .then ((data) => {
         data.results.forEach(function(pokedex) {
            pokedexArray.push(pokedex);
         })
         setPokedexes(pokedexArray);
         setGlobalLoading(false);
      });
   }, [setGlobalLoading]);

   const handleChange = (event) => {
      setValue(event.target.value);
      setStarted(false);
   };

   const gameStart = () => {
      if (!started) {
         setGlobalLoading(true);
         PokeController.fetchData(pokedexes[value].url)
         .then ((data) => {
            setPokedexData(data);
            setStarted(true);
            setGlobalLoading(false);
         })
      }
   }

   const handleRestart = () => setStarted(false);

   return (
      <Box className="container" sx={{
         maxWidth: '500px',
         padding: '60px 20px 20px 20px', 
         margin: '40px auto',
         background: 'linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 100%)',
         borderRadius: '30px',
         boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset -2px -2px 5px rgba(255,255,255,0.05)',
         border: '4px solid #333',
         position: 'relative',
         overflow: 'hidden' // Ensure loading bar doesn't spill out
      }}>
         {/* Internal Loading Bar */}
         {globalLoading && (
            <LinearProgress 
               sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0,
                  height: '6px',
                  bgcolor: 'rgba(0,0,0,0.3)',
                  zIndex: 20,
                  '& .MuiLinearProgress-bar': { bgcolor: '#00d4ff' }
               }} 
            />
         )}

         <Box className="pokedex-led-group">
            <Box className={"pokedex-led " + (globalLoading ? "led-active" : "")}></Box>
            <Box className="pokedex-led-small led-red"></Box>
            <Box className="pokedex-led-small led-yellow"></Box>
            <Box className="pokedex-led-small led-green"></Box>
         </Box>
         
         {!started && (
            <Card sx={{ bgcolor: '#333', p: 3, borderRadius: '15px', border: '1px solid #444' }}>
               <Typography variant="h6" sx={{ color: '#00d4ff', textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
                  SELECT POKEDEX
               </Typography>
               {pokedexes.length > 0 && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                     <InputLabel id="pokedex-label">Region / Game</InputLabel>
                     <Select
                        labelId="pokedex-label"
                        id="pokedex"
                        value={value}
                        label="Region / Game"
                        onChange={handleChange}
                     >
                        {pokedexes.map((pokedex, index) => (
                           <MenuItem key={pokedex.name} value={index}>
                              {_.startCase(pokedex.name)}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               )}
               <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={gameStart}
                  sx={{ 
                     bgcolor: '#00d4ff', 
                     color: '#000', 
                     fontWeight: 'bold',
                     '&:hover': { bgcolor: '#00acc1' }
                  }}
               >
                  START ADVENTURE
               </Button>
            </Card>
         )}
         {started && 
               <GuessBox 
                  pokedexData={pokedexData} 
                  handleRestart={handleRestart}
                  setGlobalLoading={setGlobalLoading} />}
      </Box>
   );
};

const GuessBox = ({ pokedexData, handleRestart, setGlobalLoading }) => {
   const [currentPokeData, setCurrentPokeData] = useState({});
   const [currentSpeciesData, setCurrentSpeciesData] = useState({});
   const [guess, setGuess] = useState('');
   const [hint, setHint] = useState('');
   const [guessed, setGuessed] = useState(false);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [flavorText, setFlavorText] = useState([]);

   useEffect(() => {
      chooseRandomPoke();
   }, [pokedexData]);

   const chooseRandomPoke = () => {
      setGlobalLoading(true);
      const pokeIndex = Math.floor(Math.random() * (pokedexData["pokemon_entries"].length));
      PokeController.fetchData(pokedexData["pokemon_entries"][pokeIndex]["pokemon_species"].url)
      .then ((speciesData) => {
         PokeController.fetchData(speciesData["varieties"][0]["pokemon"].url)
         .then((pokeData) => {
            setCurrentSpeciesData(speciesData);
            setCurrentPokeData(pokeData);
            setGlobalLoading(false);
            setGuess('');
         })
      })
   }

   const handleChange = (event) => {
      setGuess(event.target.value);
      setGuessed(false);
   };

   const giveHint = () => {
      const types = currentPokeData["types"].map(type => _.capitalize(type["type"].name));
      setHint(types.join(', '));
   }

   const submitGuess = () => {
      setGuessed(true);
      if (currentPokeData["species"]["name"].toUpperCase() === guess.toUpperCase()){
         result();
      }
   }

   const result = () => {
      const texts = currentSpeciesData["flavor_text_entries"]
         .filter(entry => entry["language"].name === "en")
         .map(entry => entry.flavor_text);
      setFlavorText(texts);
      setDialogOpen(true);
   }

   const handleClose = () => {
      setHint('');
      setGuessed(false);
      setDialogOpen(false);
      chooseRandomPoke();
   }

   const wrong = guessed && currentPokeData["species"]["name"].toUpperCase() !== guess.toUpperCase();
   const revealed = dialogOpen;

   return (
      <Box>
      { 
         !_.isEmpty(currentPokeData) && (
         <Box>
            <Box className="pokedex-screen-container">
               <Box className="pokedex-screen">
                  <CardMedia
                     component="img"
                     image={currentPokeData["sprites"]["front_default"]}
                     alt="Front of Pokemon"
                     className={"pokemon-sprite " + (revealed ? "" : "silhouette")}
                  />
               </Box>
            </Box>
            <Card sx={{ bgcolor: '#333', borderRadius: '0 0 15px 15px', border: '2px solid #444', borderTop: 'none' }}>
               <CardContent>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
                     {hint.length > 0 ? (currentPokeData["species"]["name"].split('').map(() => "_ ").join('')) : "???"}
                  </Typography>
                  {hint.length > 0 && (
                     <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {currentPokeData["types"].map(t => (
                           <Box key={t.type.name} sx={{
                              px: 1.5, py: 0.5, borderRadius: '20px', bgcolor: '#00d4ff', color: '#000',
                              fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                           }}>
                              {t.type.name}
                           </Box>
                        ))}
                     </Box>
                  )}
               </CardContent>
               <CardActions sx={{ justifyContent: 'center', gap: 1 }}>
                  <Button variant="outlined" className="neon-button" onClick={giveHint}>Hint</Button>
                  <Button variant="contained" sx={{ bgcolor: '#00d4ff', color: '#000' }} onClick={submitGuess}>Submit</Button>
                  <Button color="error" sx={{ fontWeight: 'bold' }} onClick={result}>Give Up</Button>
               </CardActions>
               <CardContent>
                  {hint.length > 0 && <PokeTable currentPokeData={currentPokeData}/>}
                  <FormControl error={wrong} fullWidth sx={{ mt: 2 }}>
                     <InputLabel htmlFor="guess-input">Who's that Pokemon?</InputLabel>
                     <Input 
                        id="guess-input" 
                        value={guess} 
                        onChange={handleChange}
                        sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                     />
                     <FormHelperText>
                        {wrong ? 'Try again!' : 'Type your guess above'}
                     </FormHelperText>
                  </FormControl>
               </CardContent>
            </Card>
            <Dialog open={dialogOpen} onClose={handleClose}>
               <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {"It's " + _.capitalize(currentPokeData["species"]["name"])+ "!"}
               </DialogTitle>
               <DialogContent>
                  <Box sx={{ textAlign: 'center', bgcolor: '#9db29d', p: 3, borderRadius: '8px', border: '3px solid #111', mb: 2 }}>
                     <img src={currentPokeData["sprites"]["front_default"]} alt="Pokemon" style={{ width: 150, height: 150, imageRendering: 'pixelated' }} />
                  </Box>
                  <DialogContentText sx={{ fontStyle: 'italic', color: '#e0e0e0' }}>
                     {flavorText[0]}
                  </DialogContentText>
               </DialogContent>
               <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                  <Button onClick={handleClose} sx={{ color: '#00d4ff' }}>Continue</Button>
                  <Button onClick={handleRestart} variant="outlined" color="primary">New Pokedex</Button>
               </DialogActions>
            </Dialog>
         </Box>
      )}
      </Box>
   );
};

const PokeTable = ({ currentPokeData }) => {
   const [infoOpen, setInfoOpen] = useState({ 1: false, 2: false, 3: false });

   const toggleInfo = (id) => setInfoOpen(prev => ({ ...prev, [id]: !prev[id] }));

   const height = currentPokeData["height"] / 10;
   const weight = currentPokeData["weight"] / 10;

   return (
      <List subheader={<ListSubheader sx={{ bgcolor: 'transparent', color: '#00d4ff' }}>Information</ListSubheader>}>
         <ListItemButton onClick={() => toggleInfo(1)}>
            <ListItemText primary="Pokedex Entry Numbers" />
            {infoOpen[1] ? <ExpandLess /> : <ExpandMore />}
         </ListItemButton>
         <Collapse in={infoOpen[1]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
               {currentPokeData["game_indices"].map((index, i) => (
                  <ListItem key={i} sx={{ pl: 4 }}>
                     <ListItemText primary={`${_.startCase(index["version"].name)}: ${index.game_index}`} />
                  </ListItem>
               ))}
            </List>
         </Collapse>

         <ListItem sx={{ py: 0.5 }}>
            <ListItemText primary={`Height: ${height} m`} />
         </ListItem>
         <ListItem sx={{ py: 0.5 }}>
            <ListItemText primary={`Weight: ${weight} kg`} />
         </ListItem>

         <ListItemButton onClick={() => toggleInfo(2)}>
            <ListItemText primary="Abilities" />
            {infoOpen[2] ? <ExpandLess /> : <ExpandMore />}
         </ListItemButton>
         <Collapse in={infoOpen[2]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
               {currentPokeData["abilities"].map((ability, i) => (
                  <ListItem key={i} sx={{ pl: 4 }}>
                     <ListItemText primary={_.startCase(ability["ability"].name)} />
                  </ListItem>
               ))}
            </List>
         </Collapse>

         <ListItemButton onClick={() => toggleInfo(3)}>
            <ListItemText primary="Held Items" />
            {infoOpen[3] ? <ExpandLess /> : <ExpandMore />}
         </ListItemButton>
         <Collapse in={infoOpen[3]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
               {currentPokeData["held_items"].length === 0 ? (
                  <ListItem sx={{ pl: 4 }}><ListItemText primary="None" /></ListItem>
               ) : (
                  currentPokeData["held_items"].map((item, i) => (
                     <ListItem key={i} sx={{ pl: 4 }}>
                        <ListItemText primary={_.startCase(item["item"].name)} />
                     </ListItem>
                  ))
               )}
            </List>
         </Collapse>
      </List>
   );
};

export default App;
