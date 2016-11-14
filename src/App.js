import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import PokeController from './PokeController';
import { 
   AppBar, Card, CardActions, CardHeader, CardTitle, CardText,
   Dialog, DropDownMenu, FlatButton, IconButton, IconMenu, LinearProgress,
   MenuItem, RaisedButton, TextField, Subheader 
} from 'material-ui';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
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
   render() {
      return (
         <div>
            <AppBar 
               title="Who's that Pokemon?" 
               iconElementRight={
                  <IconMenu
                     iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                     targetOrigin={{horizontal: 'right', vertical: 'top'}}
                     anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                  >
                     <MenuItem primaryText="Restart" />
                  </IconMenu>
               }
            />
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
                  <GuessBox pokedex={this.state.value} pokedexData={this.state.pokedexData} handleRestart={this.handleRestart} />}
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
         flavorText: []
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

   // clicking outside the dialog will continue with the current pokedex
   handleClose = () => {
      this.setState({hint: '', guessed: false, dialogOpen: false})
      this.chooseRandomPoke();
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
         />,
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

export default App; //make this class available to other files (e.g., index.js)