import React from 'react';
import noUserPic from './img/no-user-pic.png';
import firebase from 'firebase';
import { hashHistory } from 'react-router';
import { PageHeader } from 'react-bootstrap';
import validate, { ValidatedInput } from './validate';
import md5 from 'js-md5';

class LoginPage extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         'email': undefined,
         'password': undefined,
         'handle': undefined,
         'avatar': ''
      };
   }

   // update state for specific field
   handleChange = (event) => {
      var field = event.target.name;
      var value = event.target.value;

      var changes = {};
      changes[field] = value;
      this.setState(changes);
   }

   // go to sign up page
   signUp = (event) => {
      event.preventDefault();
      hashHistory.push('/join');
   }

   // handle signIn button
   signIn = (event) => {
      event.preventDefault();
      this.signInCallback(this.state.email, this.state.password);
   }

   // log in existing users
   signInCallback(email, password) {
      firebase.auth().signInWithEmailAndPassword(email, password)
         .then((response) => {
            hashHistory.push('/channels');
         })
         .catch(err => console.log(err));
   }

   render() {
      return (
         <AuthFields newUser={false} email={this.state.email} password={this.state.password} 
                     handle={this.state.handle} handleChange={this.handleChange} 
                     signUp={this.signUp} signIn={this.signIn}/>
      );
   }
}

class JoinPage extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         'email': undefined,
         'password': undefined,
         'confirm': undefined,
         'handle': undefined,
         'avatar': ''
      };
   }

   // update state for specific field
   handleChange = (event) => {
      var field = event.target.name;
      var value = event.target.value;

      var changes = {};
      changes[field] = value;
      this.setState(changes);
   }

   // handle signUp button
   signUp = (event) => {
      event.preventDefault();
      this.setState({ avatar: 'https://www.gravatar.com/avatar/' + md5(this.state.email)});
      this.signUpCallback(this.state.email, this.state.password, this.state.handle, this.state.avatar);
   }

   // back to login screen
   signIn = (event) => {
      event.preventDefault();
      hashHistory.push('/login');
   }

   // register new users
   signUpCallback = (email, password, handle, avatar) => {
      firebase.auth().createUserWithEmailAndPassword(email, password)
         .then((firebaseUser) => {
            console.log('user created: ' + firebaseUser.uid);

            var userData = {
               userId: firebaseUser.uid,
               displayName: handle,
               photoURL: avatar
            }

            var profilePromise = firebaseUser.updateProfile(userData);
            var newUserRef = firebase.database().ref('users/' + firebaseUser.uid)
            newUserRef.set(userData);

            return profilePromise;
         })
         .catch(err => console.log(err));

      firebase.auth().onAuthStateChanged(function(user) {
         user.sendEmailVerification()
         .then((promise) => {
            hashHistory.push('/channels');
         })
      })
   }

   render() {
      return (
         <AuthFields newUser={true} email={this.state.email} password={this.state.password} 
                     confirm={this.state.confirm} handle={this.state.handle} 
                     handleChange={this.handleChange} signUp={this.signUp} signIn={this.signIn} />
      );
   }
}

class AuthFields extends React.Component {
   render() {
      // field validation
      var emailErrors = validate(this.props.email, { required: true, email: true });
      var passwordErrors = validate(this.props.password, { required: true, minLength: 6 });

      if (this.props.newUser)
         var confirmErrors = validate(this.props.confirm, { required: true, password: this.props.password });

      var handleErrors = validate(this.props.handle, { required: true, minLength: 3 });

      // button validation
      var signUpEnabled = ((!this.props.newUser) || (emailErrors.isValid && passwordErrors.isValid && confirmErrors.isValid && handleErrors.isValid));

      var signInEnabled = (emailErrors.isValid && passwordErrors.isValid);

      return (
         <div>
            <PageHeader>Accord</PageHeader>
            <form className="login-form" role="form">

               <ValidatedInput field="email" type="email" label="Email" changeCallback={this.props.handleChange} errors={emailErrors} />

               <ValidatedInput field="password" type="password" label="Password" changeCallback={this.props.handleChange} errors={passwordErrors} />

               { this.props.newUser && 
                  <ValidatedInput field="confirm" type="password" label="Confirm Password" changeCallback={this.props.handleChange} errors={confirmErrors} />
               }

               { this.props.newUser &&
                  <ValidatedInput field="handle" type="text" label="Handle" changeCallback={this.props.handleChange} errors={handleErrors} />
               }

               <div className="form-group">
                  <button className="btn btn-primary" disabled={!signUpEnabled} onClick={(e) => this.props.signUp(e)}>
                     {this.props.newUser ? "Sign up" : "Need an account?"}
                  </button>
                  <button className="btn btn-primary" disabled={!this.props.newUser && !signInEnabled} onClick={(e) => this.props.signIn(e)}>
                     {this.props.newUser ? "Back to login" : "Sign in"}
                  </button>
               </div>
            </form>
         </div>
      );
   }
}

export { LoginPage, JoinPage };
export default LoginPage;
