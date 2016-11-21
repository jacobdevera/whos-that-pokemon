import React from 'react';
import { Link, hashHistory } from 'react-router';
import { Button, ControlLabel, Form, FormControl, FormGroup, Nav, NavItem } from 'react-bootstrap';
import firebase from 'firebase';
import { ChannelsList, MsgBox } from './Chat';

//a "root" component
class App extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         addChannel: ''
      };
   }

   componentDidMount() {
      // component added to the page
      firebase.auth().onAuthStateChanged(firebaseUser => {
         if (firebaseUser) {
            console.log('logged in');
            //assign firebaseUser.uid to `userId` using this.setState()
            this.setState({ userId: firebaseUser.uid })
            hashHistory.push('/channels');
         }
         else {
            console.log('logged out');
            //assign null to `userId` using this.setState()
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
         var channelData = {
            name: this.state.addChannel,
            messages: []
         }
         var newChannelRef = firebase.database().ref('channels/' + this.state.addChannel);
         newChannelRef.once("value")
            .then((snapshot) => {
               if (!snapshot.exists()) {
                  newChannelRef.set(channelData)
                     .then(() => {
                        console.log('channel successfully added');
                        hashHistory.push('channel/:' + this.state.addChannel);
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
      var channelRef = firebase.database().ref('channels/' + this.state.channels[selectedKey]);
      hashHistory.push('channel/' + this.state.channels[selectedKey].name);
   }

   render() {

      return (
         <div>
            <header className="container-fluid">
               <div className="logo">
                  <i className="fa fa-twitter fa-3x" aria-label="Accord logo"></i>
               </div>
               {this.state.userId &&
                  <div>
                     <Nav pullLeft={true} bsStyle="pills" stacked activeKey={1} onSelect={this.handleSelect}>
                        <NavItem eventKey={1}>NavItem 1 content</NavItem>
                        <NavItem eventKey={2}>NavItem 2 content</NavItem>
                     </Nav>

                     <Form>
                        <FormGroup controlId="formInlineName">
                           <FormControl type="text" placeholder="Add channel" onChange={this.handleChange} />
                        </FormGroup>
                        <Button type="submit" onClick={this.handleAddChannel}>
                           Add channel
                        </Button>
                     </Form>

                     <Button onClick={this.signOut}>
                        Sign out {firebase.auth().currentUser.displayName}
                     </Button>
                  </div>
               }
            </header>
            <main className="container">
               {this.props.children}
            </main>
         </div>
      );
   }
}



export default App; //make this class available to other files (e.g., index.js)

/*
<NavItem onClick={() => this.addChannel}>
   Add channel
</NavItem>
*/