import React from 'react';
import { Link, hashHistory } from 'react-router';
import { Button, FormControl, FormGroup, Nav, Navbar, NavItem } from 'react-bootstrap';
import firebase from 'firebase';

class App extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         addChannel: '',
         channels: [],
         currentChannel: ''
      };
   }

   componentDidMount() {
      firebase.auth().onAuthStateChanged(firebaseUser => {
         if (firebaseUser) {
            console.log('logged in');
            this.setState({
               userId: firebaseUser.uid,
            })

            // check if a general channel exists; if not, add it
            var generalRef = firebase.database().ref('channels/general')
            generalRef.once("value")
            .then((snapshot) => {
               if (!snapshot.exists()) {
                  this.setState({addChannel: 'general'})
                  this.handleAddChannel();
               }
            });

            // get channels and put them into the state for use in the nav
            var channelsRef = firebase.database().ref('channels/');
            channelsRef.on('value', (snapshot) => {
               var channelsArray = []; //an array to put in the state
               snapshot.forEach(function (childSnapshot) { //go through each item like an array
                  var channelObj = childSnapshot.val(); //convert this snapshot into an object
                  channelObj.key = childSnapshot.key; //save the child's unique id for later
                  channelsArray.push(channelObj); //put into our new array
               });
               this.setState({ channels: channelsArray }); //add to state
            });
            hashHistory.push('/channels');
         }
         else {
            console.log('logged out');
            this.setState({ userId: null });
         }
      });
   }

   // log out current user
   signOut() {
      firebase.auth().signOut()
      hashHistory.push('/login');
   }

   handleChange = (event) => this.setState({ addChannel: event.target.value });

   handleAddChannel = (event) => {
      event.preventDefault();
      if (this.state.addChannel.length > 0) {
         var channelData = { name: this.state.addChannel }
         var newChannelRef = firebase.database().ref('channels/' + this.state.addChannel);
         newChannelRef.once("value")
            .then((snapshot) => {
               if (!snapshot.exists()) {
                  newChannelRef.set(channelData)
                     .then(() => {
                        console.log('channel successfully added');
                        hashHistory.push('channel/' + this.state.addChannel);
                     })
                     .catch(function (response) {
                        console.log(response);
                     })
               } else {
                  console.log('channel already exists');
               }
            });
      } else {
         console.log('channel name required')
      }
   }

   handleSelect = (selectedKey) => {
      hashHistory.push('channel/' + this.state.channels[selectedKey].name);
      this.setState({currentChannel: this.state.channels[selectedKey].name});
   }

   render() {
      // map channel names to nav items
      var channelItems = this.state.channels.map((channelObj, i) => {
         return <NavItem eventKey={i} key={channelObj.name}>{"#" + channelObj.name}</NavItem>;
      })
      return (
         <div>
         {  this.state.userId &&
            <div>
               <Navbar defaultExpanded collapseOnSelect>
                     <Navbar.Header>
                        <Navbar.Brand>
                           {"Accord #" + this.state.currentChannel}
                        </Navbar.Brand>
                        <Navbar.Toggle />
                     </Navbar.Header>
                     <Navbar.Collapse>
                        <Nav onSelect={this.handleSelect}>
                           {channelItems}
                        </Nav>
                        <Navbar.Form pullRight>
                           <FormGroup controlId="formInlineName">
                              <FormControl type="text" placeholder="add a channel..." onChange={this.handleChange} />
                           </FormGroup>
                           <Button type="submit" onClick={this.handleAddChannel}>
                              Add
                           </Button>
                           <Button onClick={this.signOut}> Sign out {firebase.auth().currentUser.displayName}
                           </Button>
                        </Navbar.Form>
                     </Navbar.Collapse>
               </Navbar>
               <div className="container-fluid">
                  {this.props.children}
               </div>
            </div>
         }
         </div>
      );
   }
}



export default App; //make this class available to other files (e.g., index.js)