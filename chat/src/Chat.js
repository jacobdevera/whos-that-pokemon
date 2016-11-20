import React from 'react';
import firebase from 'firebase';
import { Link, hashHistory } from 'react-router';
import noUserPic from './img/no-user-pic.png';

export class ChannelsList extends React.Component {
   constructor(props) {
      super(props);
      this.state = {};
   }
   
   componentDidMount() {
      var user = firebase.auth().currentUser;
      if (!user) {
         console.log('redirecting to login page');
         hashHistory.push('login');
      }
   }

   render() {
       return (
           <div>
           </div>
       );
   }
}

export class MsgBox extends React.Component {
   constructor(props) {
      super(props);
      this.state = { post: '' };
   }

   //when the text in the form changes
   updatePost(event) {
      this.setState({ post: event.target.value });
   }

   //post a new message to the database
   postMsg(event) {
      event.preventDefault(); //don't submit

      /* Add a new message to the database */
      var msgData = {
         text: this.state.post,
         userId: firebase.auth().currentUser.uid,
         time: firebase.database.ServerValue.TIMESTAMP
      }

      var msgsRef = firebase.database().ref('msgs');
      msgsRef.push(msgData);

      this.setState({ post: '' }); //empty out post (controlled input)
   }

   render() {
      return (
         <div className="msg-box write-msg">
            {/* Show image of current user, who must be logged in */}
            <img className="image" src={firebase.auth().currentUser.photoURL} alt="user avatar" />

            <form className="msg-input" role="form">
               <textarea placeholder="What's happening...?" name="text" value={this.state.post} className="form-control" onChange={(e) => this.updatePost(e)}></textarea>

               <div className="form-group send-msg">
                  <button className="btn btn-primary"
                     onClick={(e) => this.postMsg(e)} >
                     <i className="fa fa-pencil-square-o" aria-hidden="true"></i> Send
                  </button>
               </div>
            </form>
         </div>
      );
   }
}