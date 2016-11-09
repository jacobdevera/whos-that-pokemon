import React from 'react';
import PokeController from './PokeController';
import { Navbar, NavItem, Button, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import _ from 'lodash';

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
         data.results.forEach(function(region){ 
            regionArray.push(<RegionItem name={_.capitalize(region.name)} key={(region.name)}> </RegionItem>);
         })
         this.setState({regions: regionArray});
      });    
   }

   render() {
      return (
         <div>
            <Navbar brand="Pokemon?" right>
               <NavItem href='index.html#'><Icon>search</Icon></NavItem>
               <NavItem href='index.html#'><Icon>view_module</Icon></NavItem>
               <NavItem href='index.html#'><Icon>refresh</Icon></NavItem>
               <NavItem href='index.html#'><Icon>more_vert</Icon></NavItem>
            </Navbar>
            <RegionCollection regions={this.state.regions}/>
         </div>
      );
   }
}

class RegionCollection extends React.Component {
   render() {
      return (
         <div>
            <h2>Select a Region</h2>
            <Collapsible popout accordion>
               {this.props.regions}
            </Collapsible>
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
         <CollapsibleItem header={this.props.name} onSelect={this.setRegion.bind(this)}>Let's play</CollapsibleItem>
      );
   }
}

export default App; //make this class available to other files (e.g., index.js)