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

   componentWillReceiveProps() {
      console.log(this.props.params.channelName);
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
      event.preventDefault(); // don't submit

      var msgData = {
         text: this.state.post,
         userId: firebase.auth().currentUser.uid,
         time: firebase.database.ServerValue.TIMESTAMP,
         edit: false
      }

      var msgsRef = firebase.database().ref('channels/' + this.props.channel + '/msgs');
      msgsRef.push(msgData);

      this.setState({ post: '' }); //vempty out post
   }

   render() {
      return (
         <div className="msg-box write-msg">
            <img className="image" src={firebase.auth().currentUser.photoURL} alt="user avatar" />

            <form className="msg-input" role="form">
               <textarea placeholder="Send a message..." name="text" value={this.state.post} className="form-control" 
                  onChange={(e) => this.updatePost(e)}></textarea>

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

export class MsgList extends React.Component {
   constructor(props) {
      super(props);
      this.state = { msgs: [] };
   }

   componentDidMount() {
      var usersRef = firebase.database().ref('users');
      usersRef.on('value', (snapshot) => { 
         var newVal = snapshot.val();
         this.setState({ users: newVal });
      });
      this.getChannelMsgs();
   }

   componentWillReceiveProps() {
      this.getChannelMsgs();
   }

   getChannelMsgs = () => {
      var msgsRef = firebase.database().ref('channels/' + this.props.channel + '/msgs');
      msgsRef.on('value', (snapshot) => {
         var msgsArray = [];
         snapshot.forEach(function (childSnapshot) {
            var msgObj = childSnapshot.val();
            msgObj.key = childSnapshot.key;
            msgsArray.push(msgObj);
         });
         this.setState({ msgs: msgsArray });
      });
   }

   render() {
      // don't show if don't have user data yet (to avoid partial loads)
      if (!this.state.users) {
         return null;
      }

      // map messages to <MsgItem /> components
      var msgItems = this.state.msgs.map((msgObj) => {
         return <MsgItem
            msg={msgObj}
            user={this.state.users[msgObj.userId]}
            key={msgObj.uid} />
      })

      return <div>{msgItems}</div>;
   }
}

class MsgItem extends React.Component {
   
   componentDidMount() {
      
   }

   // edit a post if the user is the author
   editPost(event) {
      
   }

   render() {
      return (
         <div className="msg-box">
            <div>
               <img className="image" src={this.props.user.photoURL} role="presentation" />

               <span className="handle">{this.props.user.displayName}</span>
               <span className="time"><Time value={this.props.msg.time} relative /></span>

               {this.props.user.userId == firebase.auth().currentUser.uid &&
                  <Button className="edit" onClick={this.editPost}> Edit </Button>
               }
            </div>
            <div className="msg">{this.props.msg.text} </div>
         </div>
      );
   }
}

export { ChannelsList, Channel };