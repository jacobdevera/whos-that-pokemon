import React from 'react';
import firebase from 'firebase';
import { ChannelsList, MsgBox } from './Chat';

//a "root" component
class App extends React.Component {
   constructor(props) {
      super(props);
      this.state = {};
   }

   componentDidMount() {
      // component added to the page
      firebase.auth().onAuthStateChanged(firebaseUser => {
         if (firebaseUser) {
            console.log('logged in');
            //assign firebaseUser.uid to `userId` using this.setState()
            this.setState({ userId: firebaseUser.uid })
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
   }

   render() {
      var content = null;

      if (!this.state.userId) { // if not logged in, show signup form
         
      }
      else { // if the user is logged in, show channels list
         content = <div><ChannelsList /></div>;
      }

      return (
         <div>
            <header className="container-fluid">
               <div className="logo">
                  <i className="fa fa-twitter fa-3x" aria-label="Accord logo"></i>
               </div>
            </header>

         </div>
      );
   }
}



export default App; //make this class available to other files (e.g., index.js)