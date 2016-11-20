import React from 'react';
import { hashHistory } from 'react-router';
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

      return (
         <div>
            <header className="container-fluid">
               <div className="logo">
                  <i className="fa fa-twitter fa-3x" aria-label="Accord logo"></i>
               </div>
               { this.state.userId && <div className="logout">
                  <button className="btn btn-warning" onClick={()=>this.signOut()}>
                     Sign out {firebase.auth().currentUser.displayName}
                  </button>
               </div> }
            </header>
            <main className="container">
                {this.props.children}
            </main>
         </div>
      );
   }
}



export default App; //make this class available to other files (e.g., index.js)