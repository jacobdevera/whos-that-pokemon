import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import PokeController from './PokeController';
import { 
   AppBar, Button, Card, CardActions, CardHeader, CardContent, Dialog, 
   DialogActions, DialogContent, DialogContentText, DialogTitle, 
   IconButton, LinearProgress, Menu, MenuItem, 
   List, ListItem, ListSubheader, TextField, Toolbar, Typography 
} from 'material-ui';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import _ from 'lodash';

injectTapEventPlugin(); // attaches an onClick() event to components

const loadStyle = {
   position: 'absolute',
   top: '64px',
   left: '0',
   right: '0'
};

const containerStyle = {
   maxWidth: '768px',
   marginLeft: 'auto',
   marginRight: 'auto',
};

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
            <PlayArea />
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
         menuOpen: false,
         started: false,
         anchorEl: null,
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

   handleMenuOpen = event => {
      this.setState({ 
         started: false, 
         menuOpen: true, 
         anchorEl: event.currentTarget 
      });
   };

   handleMenuItemClick = (event, index) => {
      this.setState({ 
         value: index, 
         menuOpen: false 
      });
   };

   handleRequestClose = () => {
      this.setState({menuOpen: false});
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
         <div style={containerStyle}>
            <ListSubheader>Choose a Pokedex</ListSubheader>
            <Menu
               id="pokedex-menu"
               anchorEl={this.state.anchorEl}
               open={this.state.menuOpen}
               onRequestClose={this.handleRequestClose}
            >
               {this.state.pokedexes.map((pokedex, index) => (
                  <MenuItem value={index} selected={index === this.state.value} key={pokedex}>
                     {_.startCase(pokedex.name)}
                  </MenuItem>
               ))}
            </Menu>

            <Button raised label="Start" onClick={this.gameStart}>
               Start
            </Button>
            {this.state.loading && <LinearProgress style={loadStyle}/>}
            {this.state.started && 
                  <GuessBox pokedex={this.state.value} pokedexData={this.state.pokedexData} 
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

   // display the flavor text entry for the Pokmeon after each round
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
      ]

      return (
         <div>
         { 
            !_.isEmpty(this.state.currentPokeData) && // make sure Pokemon data is fetched before mounting
            <div>
               <Card>
                  <CardHeader
                     title={"Name: " + (this.state.hint.length > 0 ? ("_ ".repeat(this.state.currentPokeData["species"]["name"].length)) : "")}
                     subtitle={"Type: " + this.state.hint}
                  />
                  <img src={this.state.currentPokeData["sprites"]["front_default"]} alt="Front of Pokemon" />
                  <CardActions>
                     <Button onClick={this.giveHint}>Hint</Button>
                     <Button color="primary" onClick={this.submitGuess}>Submit</Button>
                     <Button color="accent" onClick={this.result}>Give Up</Button>
                  </CardActions>
                  <CardContent>
                     {this.state.hint.length > 0 && <PokeTable currentPokeData={this.state.currentPokeData}/>}
                     <TextField
                        hintText="Enter your guess"
                        floatingLabelText="Who's that Pokemon?"
                        errorText={(this.state.guessed && (this.state.currentPokeData["species"]["name"].toUpperCase() !== this.state.guess.toUpperCase())) && 'wrong'}
                        value={this.state.guess}
                        onChange={this.handleChange}
                     />
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
            {this.state.loading && <LinearProgress style={loadStyle}/>}
         </div>
      );
   }
}

class PokeTable extends React.Component {
   render() {
      // map pokemon data to list items
      var gameIndices = this.props.currentPokeData["game_indices"].map(function(index, i) {
         return <ListItem key={i} primaryText={_.startCase(index["version"].name) + ": " + index.game_index} />;
      });
      
      var height = this.props.currentPokeData["height"] / 10;
      var weight = this.props.currentPokeData["weight"] / 10;

      var abilities = this.props.currentPokeData["abilities"].map(function(ability, index) {
         return <ListItem key={index} primaryText={_.startCase(ability["ability"].name)} />;
      });

      var heldItems = this.props.currentPokeData["held_items"].map(function(item, index) {
         return <ListItem key={index} primaryText={_.startCase(item["item"].name)} />;
      });

      return (
         <List>
            <ListItem primaryText={"Pokedex Entry Numbers: "} nestedItems={gameIndices}/>
            <ListItem primaryText={"Height: " + height + " m"}/>
            <ListItem primaryText={"Weight: " + weight + " kg"}/>
            <ListItem primaryText={"Abilities: "} nestedItems={abilities}/>
            <ListItem primaryText={"Held items in the wild: " + (heldItems.length === 0 ? "None" : "")} nestedItems={heldItems}/>
         </List>
      );
   }
}

export default App; //make this class available to other files (e.g., index.js)