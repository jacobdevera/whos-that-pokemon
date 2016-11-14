import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import PokeController from './PokeController';
import { 
   AppBar, Card, CardActions, CardHeader, CardText, Dialog, DropDownMenu, 
   FlatButton, IconButton, IconMenu, LinearProgress, MenuItem, RaisedButton, 
   List, ListItem, TextField, Subheader 
} from 'material-ui';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import QuestionMark from 'material-ui/svg-icons/action/help';
import _ from 'lodash';

injectTapEventPlugin(); // attaches an onTouchTap() event to components

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
         dialogOpen: false
      };
   }

   handleOpen = () => {
      this.setState({dialogOpen: true});
   }

   handleClose = () => {
      this.setState({dialogOpen: false});
   }

   render() {
      // action for 'how to play' dialog
      const actions = [
         <FlatButton
            label="Okay"
            primary={true}
            onTouchTap={this.handleClose}
            keyboardFocused={true}
         />
      ];

      return (
         <div>
            <AppBar 
               title="Who's that Pokemon?" 
               iconElementLeft={<IconButton><QuestionMark /></IconButton>}
               iconElementRight={
                  <IconMenu
                     iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                     targetOrigin={{horizontal: 'right', vertical: 'top'}}
                     anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                  >
                     <MenuItem primaryText="Help" onTouchTap={this.handleOpen} />
                  </IconMenu>
               }
            />
            <Dialog
               title="How to play"
               actions={actions}
               modal={false}
               open={this.state.dialogOpen}
               onRequestClose={this.handleClose}
            >
               Choose a Pokedex from one of the various games. The national Pokedex 
               includes all 721 Pokemon up to generation VI. You will then be asked
               to guess the Pokemon based on the given sprite.
            </Dialog>
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
         started: false,
         loading: false
      };
   }

   componentDidMount() {
      // fetch list of pokedexes
      var pokedexArray = [];
      PokeController.fetchData('http://pokeapi.co/api/v2/pokedex/')
      .then ((data) => {
         data.results.forEach(function(pokedex) {
            pokedexArray.push(pokedex);
         })
         this.setState({pokedexes: pokedexArray});
      });
   }

   // update selected pokedex upon picking a dropdown item
   handleChange = (event, index, value) => {
      this.setState({
         value: value,
         started: false
      });
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
      // map list of pokedexes to menu items
      var pokedexList = this.state.pokedexes.map(function(pokedex, index) {
         return <MenuItem value={index} primaryText={_.startCase(pokedex.name)} key={index} />;
      });
      return (
         <div style={containerStyle}>
            <Subheader>Choose a Pokedex</Subheader>
            <DropDownMenu value={this.state.value} onChange={this.handleChange}>
               {pokedexList}
            </DropDownMenu>
            <RaisedButton label="Start" primary={true} onTouchTap={this.gameStart} />
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
         <FlatButton
            label="Continue"
            primary={true}
            onTouchTap={this.handleClose}
            keyboardFocused={true}
         />,
         <FlatButton
            label="Choose new Pokedex"
            primary={true}
            onTouchTap={this.props.handleRestart}
         />
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
                     <FlatButton label="Hint" onTouchTap={this.giveHint} />
                     <FlatButton label="Submit" onTouchTap={this.submitGuess} primary={true} />
                     <FlatButton label="Give up" onTouchTap={this.result} secondary={true} />
                  </CardActions>
                  <CardText>
                     {this.state.hint.length > 0 && <PokeTable currentPokeData={this.state.currentPokeData}/>}
                     <TextField
                        hintText="Enter your guess"
                        floatingLabelText="Who's that Pokemon?"
                        errorText={(this.state.guessed && (this.state.currentPokeData["species"]["name"].toUpperCase() !== this.state.guess.toUpperCase())) && 'wrong'}
                        value={this.state.guess}
                        onChange={this.handleChange}
                     />
                  </CardText>
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