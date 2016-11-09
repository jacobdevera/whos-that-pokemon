import React from 'react';
import injectTapEventplugin from 'react-tap-event-plugin';
import PokeController from './PokeController';

import { AppBar, DropDownMenu, MenuItem } from 'material-ui';
import { Navbar, NavItem, Button, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import _ from 'lodash';

injectTapEventplugin();

class App extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         regions: [],
         selectedRegion: null
      };
   }

   componentDidMount() {
      /* fetch region data */
      var regionArray = [];
      PokeController.fetchData('/region/')
      .then ((data) => {
         data.results.forEach(function(region, index){ 
            regionArray.push(<RegionItem value={index} name={_.capitalize(region.name)} key={(region.name)}> </RegionItem>);
         })
         this.setState({regions: regionArray});
      });    
   }

   render() {
      return (
         <div>
            <AppBar title="Who's that Pokemon?" />
            <RegionCollection regions={this.state.regions} />
         </div>
      );
   }
}

class RegionCollection extends React.Component {
   render() {
      return (
         <div>
            <DropDownMenu>
               {this.props.regions}
            </DropDownMenu>
         </div>
      );
   }
}

class RegionItem extends React.Component {
   setRegion() {
      console.log('click');
   }

   render() {
      return (
         <MenuItem value={this.props.index} primaryText={this.props.name} />
      );
   }
}

export default App; //make this class available to other files (e.g., index.js)