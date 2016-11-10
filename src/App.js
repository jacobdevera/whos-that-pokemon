import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import PokeController from './PokeController';
import { AppBar, DropDownMenu, MenuItem, Subheader } from 'material-ui';
import _ from 'lodash';

injectTapEventPlugin();

class App extends React.Component {
   render() {
      return (
         <div>
            <AppBar title="Who's that Pokemon?" />
            <RegionCollection />
         </div>
      );
   }
}

class RegionCollection extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         value: 0,
         regions: []
      };
   }

   componentDidMount() {
      // fetch region data
      var regionArray = [];
      PokeController.fetchData('/region/')
      .then ((data) => {
         data.results.forEach(function(region, index){ 
            regionArray.push(<MenuItem value={index} primaryText={_.capitalize(region.name)} key={index} />);
         })
         this.setState({regions: regionArray});
      });  
   }

   handleChange = (event, index, value) => {
      this.setState({value: value});
   }

   render() {
      return (
         <div>
            <Subheader>Region</Subheader>
            <DropDownMenu value={this.state.value} onChange={this.handleChange}>
               {this.state.regions}
            </DropDownMenu>
         </div>
      );
   }
}

export default App; //make this class available to other files (e.g., index.js)