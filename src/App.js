import React from 'react';
import PokeController from './PokeController';

//a "root" component
class App extends React.Component {
  //how to display this component
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
      .then ( (data) => {
         data.results.forEach(function(region){ 
            regionArray.push(<Card className='small' title={region.name} key={region.name} />);
         })
         this.setState({regions: regionArray});
      });
   }

   render() {
      return (
         <div>
            <h1>Who's that Pokemon?</h1>
            <RegionCards regions={this.state.regions}/>
         </div>
      );
   }
}

import { Card, CardTitle, Col } from 'react-materialize';

class RegionCards extends React.Component {
   render() {
      return (
         <div>
            {this.props.regions}
         </div>
      );
   }
}

export default App; //make this class available to other files (e.g., index.js)