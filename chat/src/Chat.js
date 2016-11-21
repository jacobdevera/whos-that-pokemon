import React from 'react';
import firebase from 'firebase';
import { hashHistory } from 'react-router';
import Time from 'react-time';
import { Button, ControlLabel, Form, FormControl, FormGroup, Nav, NavItem } from 'react-bootstrap';
import noUserPic from './img/no-user-pic.png';

class ChannelsList extends React.Component {
   constructor(props) {
      super(props);
      this.state = {};
   }

   componentDidMount() {
      var user = firebase.auth().currentUser;
      if (!user) {
         console.log('redirecting to login page');
         hashHistory.push('/login');
      } else {
         console.log('showing channels list');
      }
   }

   render() {
      return (
         <div>
         </div>
      );
   }
}

class Channel extends React.Component {
   componentDidMount() {
      console.log('welcome to ' + this.props.params.channelName);
   }
   render() {
      return (
         <div>
            <MsgList channel={this.props.params.channelName} /><MsgBox channel={this.props.params.channelName} />
         </div>
      );
   }
}

class MsgBox extends React.Component {
   constructor(props) {
      super(props);
      this.state = { post: '' };
   }

   // when the text in the form changes
   updatePost(event) {
      this.setState({ post: event.target.value });
   }

   // post a new message to the database
   postMsg(event) {
      event.preventDefault(); //don't submit

      var msgData = {
         text: this.state.post,
         userId: firebase.auth().currentUser.uid,
         time: firebase.database.ServerValue.TIMESTAMP,
         edit: false
      }

      var msgsRef = firebase.database().ref('channels/' + this.props.channel + '/msgs');
      msgsRef.push(msgData);

      this.setState({ post: '' }); //empty out post (controlled input)
   }

   render() {
      return (
         <div className="msg-box write-msg">
            {/* Show image of current user, who must be logged in */}
            <img className="image" src={firebase.auth().currentUser.photoURL} alt="user avatar" />

            <form className="msg-input" role="form">
               <textarea placeholder="Send a message..." name="text" value={this.state.post} className="form-control" onChange={(e) => this.updatePost(e)}></textarea>

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


//A list of messages that have been posted
export class MsgList extends React.Component {
   constructor(props) {
      super(props);
      this.state = { msgs: [] };
   }

   //Lifecycle callback executed when the component appears on the screen.
   //It is cleaner to use this than the constructor for fetching data
   componentDidMount() {
      /* Add a listener for changes to the user details object, and save in the state */
      var usersRef = firebase.database().ref('users');
      usersRef.on('value', (snapshot) => { //arrow function for callback
         var newVal = snapshot.val();
         this.setState({ users: newVal });
      });

      /* Add a listener for changes to the msgs object, and save in the state */
      var msgsRef = firebase.database().ref('channels/' + this.props.channel + '/msgs');
      msgsRef.on('value', (snapshot) => {
         var msgsArray = []; //an array to put in the state
         snapshot.forEach(function (childSnapshot) { //go through each item like an array
            var msgObj = childSnapshot.val(); //convert this snapshot into an object
            msgObj.key = childSnapshot.key; //save the child's unique id for later
            msgsArray.push(msgObj); //put into our new array
         });
         this.setState({ msgs: msgsArray }); //add to state
         console.log(this.state);
      });
   }

   render() {
      //don't show if don't have user data yet (to avoid partial loads)
      if (!this.state.users) {
         return null;
      }

      /* Create a list of <MsgItem /> objects */
      var msgItems = this.state.msgs.map((msgObj) => {
         return <MsgItem
            msg={msgObj}
            user={this.state.users[msgObj.userId]}
            key={msgObj.uid} />
      })

      return <div>{msgItems}</div>; //should return element containing the <MsgItems/> instead!
   }
}


//A single Msg
class MsgItem extends React.Component { // eslint-disable-line no-alert 
   
   componentDidMount() {
      console.log('message appeared');
   }

   // edit a post if the user is the author
   editPost(event) {

   }

   render() {
      return (
         <div className="msg-box">
            <div>
               {/* This image's src should be the user's avatar */}
               <img className="image" src={this.props.user.avatar} role="presentation" />

               {/* Show the user's handle */}
               <span className="handle">{this.props.user.handle} {/*space*/}</span>

               {/* Show the time of the msg (use a Time component!) */}
               <span className="time"><Time value={this.props.msg.time} relative /></span>
               
               {this.props.user.userId == firebase.auth().currentUser.uid &&
                  <Button onClick={this.editPost}> Edit post </Button>
               }
            </div>
            {/* Show the text of the msg */}
            <div className="msg">{this.props.msg.text}</div>
         </div>
      );
   }
}

export { ChannelsList, Channel };