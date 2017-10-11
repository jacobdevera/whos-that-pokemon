import React from 'react';
import PokeController from './PokeController';
import { 
   AppBar, Button, Card, CardActions, CardHeader, CardContent, CardMedia, Dialog, 
   DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl,
   FormControlLabel, FormGroup, FormHelperText, FormLabel,
   IconButton, Input, InputLabel, LinearProgress, Menu, MenuItem, 
   List, ListItem, ListItemText, ListSubheader, Radio, RadioGroup, Select, TextField, Toolbar, Typography 
} from 'material-ui';

import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import { withStyles } from 'material-ui/styles';

import _ from 'lodash';

const styles = theme => ({ 
   button: {
      margin: theme.spacing.unit
   },
   load: {
      position: 'absolute',
      top: '64px',
      left: '0',
      right: '0'
   },
   container: {
      maxWidth: '768px',
      padding: 16,
      marginLeft: 'auto',
      marginRight: 'auto',
   },
   media: {
      height: 100,
      width: 100
   },
});

class App extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         anchorEl: null,
         menuOpen: false,
         dialogOpen: false
      };
   }

   handleMenuOpen = (event) => {
      this.setState({menuOpen: true, anchorEl: event.currentTarget});
   };

   handleMenuClose = () => {
      this.setState({menuOpen: false});
   };

   handleDialogOpen = () => {
      this.setState({dialogOpen: true});
   };

   handleDialogClose = () => {
      this.setState({dialogOpen: false});
   };

   render() {
      return (
         <div>
            <AppBar position="static">
               <Toolbar>
                  <Typography type="title" color="inherit">
                     Who's that Pokemon?
                  </Typography>
                  <IconButton
                     aria-label="More"
                     aria-owns={this.state.menuOpen ? 'simple-menu' : null}
                     aria-haspopup="true"
                     onClick={this.handleMenuOpen}
                  >
                     <MoreVertIcon />
                  </IconButton>
                  <Menu
                     id="simple-menu"
                     anchorEl={this.state.anchorEl}
                     open={this.state.menuOpen}
                     onRequestClose={this.handleMenuClose}
                  >
                     <MenuItem onClick={this.handleDialogOpen}>Help</MenuItem>
                  </Menu>
                  <Dialog open={this.state.dialogOpen} onRequestClose={this.handleDialogClose}>
                     <DialogTitle>{"How to Play"}</DialogTitle>
                     <DialogContent>
                        <DialogContentText>
                           Choose a Pokedex from one of the various games. The national Pokedex 
                           includes all 721 Pokemon up to generation VI. You will then be asked
                           to guess the Pokemon based on the given sprite.
                        </DialogContentText>
                     </DialogContent>
                     <DialogActions>
                        <Button onClick={this.handleDialogClose} color="primary">
                           Okay
                        </Button>
                     </DialogActions>
                  </Dialog>
               </Toolbar>
            </AppBar>
            <PlayArea classes={this.props.classes}/>
         </div>
      );
   }
}

class PlayArea extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         value: 0,
         pokedexes: [],
         pokedexData: {},
         started: false,
         loading: false
      };
   }

   componentDidMount() {
      // fetch list of pokedexes
      var pokedexArray = [];
      PokeController.fetchData('https://pokeapi.co/api/v2/pokedex/')
      .then ((data) => {
         data.results.forEach(function(pokedex) {
            pokedexArray.push(pokedex);
         })
         this.setState({pokedexes: pokedexArray});
      });
   }

   handleChange = value => event => {
      this.setState({[value]: event.target.value});
   };

   gameStart = () => {
      // get pokedex data from selected pokedex
      if (!this.state.started) {
         this.setState({loading: true});
         PokeController.fetchData(this.state.pokedexes[this.state.value].url)
         .then ((data) => {
            this.setState({
               pokedexData: data,
               started: true,
               loading: false
            });
         })
      }
   }

   // choosing a new pokedex will unmount the guessing box
   handleRestart = () => {
      this.setState({started: false});
   }

   render() {
      return (
         <div className={this.props.classes.container}>
            {this.state.pokedexes ?
               <FormControl margin="normal" component="fieldset">
                  <InputLabel htmlFor="pokedex">Pokedex</InputLabel>
                  <Select
                     value={this.state.value}
                     onChange={this.handleChange('value')}
                     input={<Input id="pokedex" />}
                  >
                     {this.state.pokedexes.map((pokedex, index) => (
                        <MenuItem
                           key={pokedex.name}
                           value={index}
                        >
                           {_.startCase(pokedex.name)}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl> : <LinearProgress className={this.props.classes.load}/>
            }
            <Button className={this.props.classes.button} raised color="primary" label="Start" onClick={this.gameStart}>
               Start
            </Button>
            {this.state.loading && <LinearProgress className={this.props.classes.load}/>}
            {this.state.started && 
                  <GuessBox classes={this.props.classes} 
                     pokedex={this.state.value} 
                     pokedexData={this.state.pokedexData} 
                     handleRestart={this.handleRestart} />}
         </div>
      );
   }
}

class GuessBox extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         currentPoke: {},
         currentPokeData: {},
         currentSpeciesData: {},
         loading: false,
         guess: '',
         hint: '',
         guessed: false,
         dialogOpen: false,
         flavorText: [],
         moreInfo: false
      };
   }

   componentDidMount() {
      this.chooseRandomPoke();
   }

   chooseRandomPoke = () => {
      this.setState({loading: true});
      // select a random Pokemon for the player to guess
      var pokeIndex = Math.floor(Math.random() * (this.props.pokedexData["pokemon_entries"].length));
      // get data for current Pokemon
      PokeController.fetchData(this.props.pokedexData["pokemon_entries"][pokeIndex]["pokemon_species"].url)
      .then ((speciesData) => {
         PokeController.fetchData(speciesData["varieties"][0]["pokemon"].url)
         .then((pokeData) => {
            this.setState({
               currentSpeciesData: speciesData,
               currentPokeData: pokeData,
               loading: false,
               guess: '' // empty text field from previous game
            });
         })
      })
   }

   handleChange = (event) => {
      this.setState({
         guess: event.target.value,
         guessed: false
      });
   };

   giveHint = () => {
      var types = [];
      this.state.currentPokeData["types"].forEach((type) => {
         types.push(_.capitalize(type["type"].name));
      })
      this.setState({hint: types.toString()})
   }

   submitGuess = () => {
      this.setState({ 
         guessed: true
      })

      if (this.state.currentPokeData["species"]["name"].toUpperCase() === this.state.guess.toUpperCase()){
         this.result();
      }
   }

   // display the flavor text entry for the Pokemon after each round
   result = () => {
      var flavorText = [];
      this.state.currentSpeciesData["flavor_text_entries"].forEach((entry) => {
         if (entry["language"].name === "en")
            flavorText.push(entry.flavor_text);
      })
      this.setState({
         dialogOpen: true,
         flavorText: flavorText
      })
   }

   // clicking outside the dialog will continue with the current pokedex
   handleClose = () => {
      this.setState({hint: '', guessed: false, dialogOpen: false})
      this.chooseRandomPoke();
   }

   render() {
      // actions for the result dialog
      const dialogActions = [
         <Button onClick={this.handleClose}>
            Continue
         </Button>,
         <Button onClick={this.props.handleRestart}>
            Choose new Pokedex
         </Button>
      ];
      var wrong = (this.state.guessed) && (this.state.currentPokeData["species"]["name"].toUpperCase() !== this.state.guess.toUpperCase());
      return (
         <div>
         { 
            !_.isEmpty(this.state.currentPokeData) && // make sure Pokemon data is fetched before mounting
            <div>
               <Card>
                  <CardMedia
                     image={this.state.currentPokeData["sprites"]["front_default"]}
                     title="Front of Pokemon"
                     className={this.props.classes.media}
                  />
                  <CardContent>
                     <Typography type="headline">
                        {"Name: " + (this.state.hint.length > 0 ? ("_ ".repeat(this.state.currentPokeData["species"]["name"].length)) : "")}
                     </Typography>
                     <Typography type="subheading" color="secondary">
                        {"Type: " + this.state.hint}
                     </Typography>
                  </CardContent>
                  <CardActions>
                     <Button onClick={this.giveHint}>Hint</Button>
                     <Button color="primary" onClick={this.submitGuess}>Submit</Button>
                     <Button color="accent" onClick={this.result}>Give Up</Button>
                  </CardActions>
                  <CardContent>
                     {this.state.hint.length > 0 && <PokeTable currentPokeData={this.state.currentPokeData}/>}
                     <FormControl error={wrong}>
                        <InputLabel htmlFor="name-error">Who's that Pokemon?</InputLabel>
                        <Input id="name-error" value={this.state.guess} onChange={this.handleChange} />
                        <FormHelperText>
                           {wrong ? 'wrong' : 'enter your guess'}
                        </FormHelperText>
                     </FormControl>
                  </CardContent>
               </Card>
               <Dialog
                  title={"It's " + _.capitalize(this.state.currentPokeData["species"]["name"])+ "!"}
                  actions={dialogActions}
                  modal={false}
                  open={this.state.dialogOpen}
                  onRequestClose={this.handleClose}
                  autoScrollBodyContent={true}
               >
                  <img src={this.state.currentPokeData["sprites"]["front_default"]} alt="Front of Pokemon" /><br />
                  {this.state.flavorText[0]}
               </Dialog>
            </div>
         }
            {this.state.loading && <LinearProgress className={this.props.classes.load}/>}
         </div>
      );
   }
}

class PokeTable extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         infoOpen1: false,
         infoOpen2: false,
         infoOpen3: false
      };
   };

   handleClick1 = () => {
      this.setState({ infoOpen1: !this.state.infoOpen1 })
   };

   handleClick2 = () => {
      this.setState({ infoOpen2: !this.state.infoOpen2 })
   }

   handleClick3 = () => {
      this.setState({ infoOpen3: !this.state.infoOpen3 })
   }

   render() {
      // map pokemon data to list items
      var gameIndices = this.props.currentPokeData["game_indices"].map(function(index, i) {
         return <ListItem>
                  <ListItemText inset primary={_.startCase(index["version"].name) + ": " + index.game_index} />
               </ListItem>
      });
      
      var height = this.props.currentPokeData["height"] / 10;
      var weight = this.props.currentPokeData["weight"] / 10;

      var abilities = this.props.currentPokeData["abilities"].map(function(ability, index) {
         return <ListItem>
                  <ListItemText inset primary={_.startCase(ability["ability"].name)} />
               </ListItem>
      });

      var heldItems = this.props.currentPokeData["held_items"].map(function(item, index) {
         return <ListItem>
                  <ListItemText inset primary={_.startCase(item["item"].name)} />
               </ListItem>
      });

      return (
         <List subheader={<ListSubheader>Information</ListSubheader>}>
            <ListItem button onClick={this.handleClick1}>
               <ListItemText primary="Pokedex Entry Numbers: " />
               {this.state.infoOpen1 ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={this.state.infoOpen1} transitionDuration="auto" unmountOnExit>
               {gameIndices}
            </Collapse>

            <ListItem>
               <ListItemText primary={"Height: " + height + " m"} />
            </ListItem>

            <ListItem>
               <ListItemText primary={"Weight: " + weight + " kg"} />
            </ListItem>

            <ListItem button onClick={this.handleClick2}>
               <ListItemText primary={"Abilities: "}/>
               {this.state.infoOpen2 ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={this.state.infoOpen2} transitionDuration="auto" unmountOnExit>
               {abilities}
            </Collapse>

            <ListItem button onClick={this.handleClick3}>
               <ListItemText primary={"Held items in the wild: " + (heldItems.length === 0 ? "None" : "")}/>
               {this.state.infoOpen3 ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={this.state.infoOpen3} transitionDuration="auto" unmountOnExit>
               {heldItems}
            </Collapse>
         </List>
      );
   }
}

export default withStyles(styles)(App); //make this class available to other files (e.g., index.js)