import React from 'react';
import noUserPic from './img/no-user-pic.png';
import firebase from 'firebase';
import hashHistory from 'react-router';
import validate, { ValidatedInput } from 'validate';

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

      var changes = {}; //object to hold changes
      changes[field] = value; //change this field
      this.setState(changes); //update state
   }

   // handle signUp button
   signUp(event) {
      event.preventDefault(); //don't submit
      this.signUpCallback(this.state.email, this.state.password, this.state.handle, this.state.avatar);
   }

   // register new users
   signUpCallback = (email, password, handle, avatar) => {
      firebase.auth().createUserWithEmailAndPassword(email, password)
         .then((firebaseUser) => {
            console.log('user created: ' + firebaseUser.uid);

            var userData = {
               displayName: handle,
               photoURL: avatar
            }

            var profilePromise = firebaseUser.updateProfile(userData);

            // add to the JOITC
            var newUserRef = firebase.database().ref('users/' + firebaseUser.uid)
            newUserRef.set(userData);
            return profilePromise;
         })
         .catch(err => console.log(err));
   }

   // handle signIn button
   signIn(event) {
      event.preventDefault(); //don't submit
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
      //field validation
      var emailErrors = validate.validate(this.state.email, { required: true, email: true });
      var passwordErrors = validate.validate(this.state.password, { required: true, minLength: 6 });
      var handleErrors = validate.validate(this.state.handle, { required: true, minLength: 3 });

      //button validation
      var signUpEnabled = (emailErrors.isValid && passwordErrors.isValid && handleErrors.isValid);
      var signInEnabled = (emailErrors.isValid && passwordErrors.isValid);

      return (
         <form role="form" className="sign-up-form">

            <ValidatedInput field="email" type="email" label="Email" changeCallback={this.handleChange} errors={emailErrors} />

            <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />

            <ValidatedInput field="handle" type="text" label="Handle" changeCallback={this.handleChange} errors={handleErrors} />

            {/* full html for the URL (because image) */}
            <div className="form-group">
               <img className="avatar" src={this.state.avatar || noUserPic} alt="avatar preview" />
               <label htmlFor="avatar" className="control-label">Avatar Image URL</label>
               <input id="avatar" name="avatar" className="form-control" onChange={this.handleChange} />
            </div>

            <div className="form-group sign-up-buttons">
               <button className="btn btn-primary" disabled={!signUpEnabled} onClick={(e) => this.signUp(e)}>Sign-up</button>
               <button className="btn btn-primary" disabled={!signInEnabled} onClick={(e) => this.signIn(e)}>Sign-in</button>
            </div>
         </form>
      );
   }
}

//simple wrapper for displaying the form
class SignUpApp extends React.Component {

   signUp(email, password, handle, avatar) {
      window.alert("Signing up:", email, 'with handle', handle);
   }

   signIn(email, password) {
      window.alert("Signing in:", email);
   }

   render() {
      return (
         <div className="container">
            <header>
               <h1>Sign Up!</h1>
            </header>
            <SignUpForm signUpCallback={this.signUp} signInCallback={this.signIn} />
         </div>
      );
   }
}

export { SignUpApp };
export default LoginPage;
