import React from 'react';
import firebase from 'firebase';
import { hashHistory } from 'react-router';
import Time from 'react-time';
import { Button, ButtonToolbar, FormGroup, FormControl, Modal } from 'react-bootstrap';
import noUserPic from './img/no-user-pic.png';

class ChannelsList extends React.Component {
   constructor(props) {
      super(props);
      this.state = { channels: [] };
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
         <div className="welcome">
            <p>Welcome! Please select a channel above to enter.</p>
         </div>
      );
   }
}

class Channel extends React.Component {
   componentDidMount() {
      console.log('(first load) welcome to ' + this.props.params.channelName);
   }

   componentWillReceiveProps() {
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
      this.state = { 
         post: '',
         loading: false
      };
   }

   // when the text in the form changes
   updatePost = (event) => this.setState({ post: event.target.value });

   // post a new message to the database
   postMsg = (event) => {
      event.preventDefault(); // don't submit

      this.unregister = firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            if (user.emailVerified) {
               this.setState({ loading: true });
               console.log('Email is verified');
               var msgData = {
                  text: this.state.post,
                  userId: firebase.auth().currentUser.uid,
                  time: firebase.database.ServerValue.TIMESTAMP,
                  edit: false
               }

               var msgsRef = firebase.database().ref('channels/' + this.props.channel + '/msgs');
               msgsRef.push(msgData)
                  .then((response) => {
                     this.setState({ loading: false });
                  })

               this.setState({ post: '' }); // empty out post
            }
            else {
               console.log('Email is not verified');
            }
         }
      });
   }

   // unregister Firebase authentication listener
   componentWillUnmount() {
      if (this.unregister) {
         this.unregister();
      }
   }

   render() {
      return (
         <div className="msg-input">
            <FormGroup>
               <FormControl placeholder="Send a message..." value={this.state.post} componentClass="textarea"
                  onChange={(e) => this.updatePost(e)} />

               <span className="form-group send-msg">
                  <Button block disabled={this.state.loading} bsStyle="primary" 
                        onClick={!this.state.loading ? (e) => this.postMsg(e) : null} >
                     <i className="fa fa-pencil-square-o" aria-hidden="true"></i> 
                     {this.state.loading ? 'Sending...' : 'Send'}
                  </Button>
               </span>
            </FormGroup>
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
      var msgsRef = firebase.database().ref('channels/' + this.props.channel + '/msgs')
         .orderByChild('time').limitToLast(100);
      msgsRef.on('value', (snapshot) => {
         var msgsArray = [];
         snapshot.forEach(function (childSnapshot) {
            var msgObj = childSnapshot.val();
            msgObj.uid = childSnapshot.key;
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
            channel={this.props.channel}
            msg={msgObj}
            user={this.state.users[msgObj.userId]}
            key={msgObj.uid}
            uid={msgObj.uid} />;
      });

      return <div className="msg-list">{msgItems}</div>;
   }
}

class MsgItem extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         showEdit: false,
         showDelete: false,
         edit: this.props.msg.text,
         loading: false
      }
   }

   showEdit = () => this.setState({ showEdit: true });
   closeEdit = () => this.setState({ showEdit: false });

   showDelete = () => this.setState({ showDelete: true });
   closeDelete = () => this.setState({ showDelete: false });

   updateEdit = (event) => this.setState({ edit: event.target.value });

   editMsg = (event) => {
      event.preventDefault();
      this.setState({ loading: true });
      var msgData = {
         text: this.state.edit,
         userId: this.props.user.userId,
         time: this.props.msg.time,
         edit: true
      }
      var msgRef = firebase.database().ref('channels/' + this.props.channel + '/msgs/' + this.props.uid);
      msgRef.set(msgData)
         .then((response) => {
            this.setState({ loading: false });
         })
      this.setState({ showEdit: false });
   }

   // delete a message if the user is the author
   deleteMsg = () => {
      var msgRef = firebase.database().ref('channels/' + this.props.channel + '/msgs/' + this.props.uid);
      msgRef.remove();
   }

   render() {
      return (
         <div className="msg-item">
            <div>
               <img className="avatar" src={this.props.user.photoURL} alt="avatar" />

               <span className="handle">{this.props.user.displayName}</span>
               <span className="time"><Time value={this.props.msg.time} relative /></span>

               {this.props.user.userId === firebase.auth().currentUser.uid &&
                  <Button href="#" className="action" onClick={this.showEdit}>
                     <i className="fa fa-pencil" aria-hidden="true"></i>
                  </Button>
               }

               {this.props.user.userId === firebase.auth().currentUser.uid &&
                  <Button href="#" className="action" onClick={this.showDelete}>
                     <i className="fa fa-trash-o" aria-hidden="true"></i>
                  </Button>
               }

            </div>
            <div className="msg">{this.props.msg.text} </div>
            {/* edit modal */}
            <Modal show={this.state.showEdit} onHide={this.closeEdit}>
               <Modal.Header closeButton>
                  <Modal.Title>Edit message</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                  <textarea placeholder="edit your message..." name="text" value={this.state.edit} className="form-control"
                     onChange={(e) => this.updateEdit(e)}></textarea>
               </Modal.Body>
               <Modal.Footer>
                  <Button onClick={this.closeEdit}>Close</Button>
                  <Button bsStyle="primary" onClick={this.editMsg}>Submit</Button>
               </Modal.Footer>
            </Modal>

            {/* delete modal */}
            <Modal show={this.state.showDelete} onHide={this.closeDelete}>
               <Modal.Header closeButton>
                  <Modal.Title>Delete confirmation</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                  Are you sure you want to permanently delete this message?
               </Modal.Body>
               <Modal.Footer>
                  <Button onClick={this.closeDelete}>No</Button>
                  <Button bsStyle="primary" onClick={this.deleteMsg}>Yes</Button>
               </Modal.Footer>
            </Modal>
         </div>
      );
   }
}

export { ChannelsList, Channel };