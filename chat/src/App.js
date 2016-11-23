import React from 'react';
import { hashHistory } from 'react-router';
import { Alert, Button, FormControl, FormGroup, Nav, Navbar, NavItem } from 'react-bootstrap';
import firebase from 'firebase';

class App extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         addChannel: '',
         channels: [],
         currentChannel: '',
         addChannelFail: false
      };
   }

   componentDidMount() {
      firebase.auth().onAuthStateChanged(firebaseUser => {
         if (firebaseUser) {
            this.setState({
               userId: firebaseUser.uid,
            })

            // check if a general channel exists; if not, add it
            var generalRef = firebase.database().ref('channels/general')
            generalRef.once("value")
            .then((snapshot) => {
               if (!snapshot.exists()) {
                  generalRef.set({ name: 'general' })
                     .then(() => {
                        hashHistory.push('channel/general');
                     })
                     .catch(function (response) {
                        this.setState({ addChannelFail: true });
                     })
               }
            });

            // get channels and put them into the state for use in the nav
            var channelsRef = firebase.database().ref('channels/').orderByKey();
            channelsRef.on('value', (snapshot) => {
               var channelsArray = [];
               snapshot.forEach(function (childSnapshot) {
                  var channelObj = childSnapshot.val();
                  channelObj.key = childSnapshot.key;
                  channelsArray.push(channelObj);
               });
               this.setState({ channels: channelsArray });
            });
            hashHistory.push('/channels');
         } else {
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
                        hashHistory.push('channel/' + this.state.addChannel);
                        this.setState({ currentChannel: this.state.addChannel });
                     })
               }
            });
      }
   }

   handleSelect = (selectedKey) => {
      hashHistory.push('channel/' + this.state.channels[selectedKey].name);
      this.setState({currentChannel: this.state.channels[selectedKey].name});
   }

   handleAlertDismiss = () => this.setState({ addChannelFail: false })

   render() {
      // map channel names to nav items
      var channelItems = this.state.channels.map((channelObj, i) => {
         return <NavItem eventKey={i} key={channelObj.name}>{"#" + channelObj.name}</NavItem>;
      })
      return (
         <div>
         {  this.state.userId &&
            <div>
               <Navbar fixedTop collapseOnSelect>
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
            </div>
         }
            <div className="container">
               {this.props.children}
            </div>
            { this.state.addChannelFail && 
               <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
                  <h4>Error</h4>
                  <p>Please try adding the channel again.
                     <Button onClick={this.handleAlertDismiss}>Close</Button>
                  </p>
               </Alert>
            }
         </div>
      );
   }
}

export default App; //make this class available to other files (e.g., index.js)