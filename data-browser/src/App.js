import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import PokeController from './PokeController';
import { 
   AppBar, DropDownMenu, IconButton, IconMenu, MenuItem, RaisedButton, Subheader 
} from 'material-ui';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import _ from 'lodash';

injectTapEventPlugin();

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
         loading: 'hide'
      };
   }

   componentDidMount() {
      // fetch list of pokedexes
      var pokedexArray = [];
      PokeController.fetchData('http://pokeapi.co/api/v2/pokedex/')
      .then ((data) => {
         /* data.results.forEach(function(pokedex) {
            PokeController.fetchData(pokedex.url)
            .then ((pokedexData) => {
               if (pokedexData.is_main_series) {
                  pokedexArray.push(pokedexData);
               }
            })
         }) */
         data.results.forEach(function(pokedex) {
            pokedexArray.push(pokedex);
         })
         this.setState({pokedexes: pokedexArray});
      });
   }

   handleChange = (event, index, value) => {
      this.setState({
         value: value,
         started: false
      });
   }

   gameStart() {
      // get pokedex data from selected pokedex
      this.setState({loading: 'loading'})
      PokeController.fetchData(this.state.pokedexes[this.state.value].url)
      .then ((data) => {
         this.setState({
            pokedexData: data,
            started: true,
            loading: 'hide'
         });
      })
   }

   render() {
      // map list of pokedexes to menu items
      var pokedexList = this.state.pokedexes.map(function(pokedex, index) {
         return <MenuItem value={index} primaryText={_.startCase(pokedex.name)} key={index} />;
      });
      return (
         <div>
            <Subheader>Choose a Pokedex</Subheader>
            <DropDownMenu value={this.state.value} onChange={this.handleChange}>
               {pokedexList}
            </DropDownMenu>
            <RaisedButton label="Start" primary={true} onTouchTap={this.gameStart.bind(this)}/>
            {this.state.started && 
                  <GuessBox pokedex={this.state.value} pokedexData={this.state.pokedexData} />}
         </div>
      );
   }
}

class GuessBox extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         currentPokemon: {}
      };
   }

   componentDidMount() {
      // select a random Pokemon for the player to guess
      console.log(this.props.pokedexData);
      var entryNumber = Math.floor(Math.random() * (this.props.pokedexData["pokemon_entries"].length + 1));
      this.setState({currentPokemon: this.props.pokedexData["pokemon_entries"][entryNumber]});
      console.log(this.state.currentPokemon);
   }
   render() {
      return (
         <div>
         </div>
      );
   }
}

export default App; //make this class available to other files (e.g., index.js)