import React from 'react';
import PokeController from './PokeController';
import { Card, CardTitle, Col, Collapsible, CollapsibleItem } from 'react-materialize';
import _ from 'lodash';

class App extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         regions: []
      };
   }

   componentDidMount() {
      /* fetch region data */
      var regionArray = [];
      PokeController.fetchData('/region/')
      .then ((data) => {
         data.results.forEach(function(region){ 
            regionArray.push(<RegionItem header={_.capitalize(region.name)} key={(region.name)}> </RegionItem>);
         })
         this.setState({regions: regionArray});
      });
      $(document).ready(function(){
         $('.collapsible').collapsible();
      });
        
   }

   render() {
      return (
         <div>
            <h1>Who's that Pokemon?</h1>
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
   render() {
      return (
         <CollapsibleItem header={this.props.header}>Let's play</CollapsibleItem>
      );
   }
}

export default App; //make this class available to other files (e.g., index.js)