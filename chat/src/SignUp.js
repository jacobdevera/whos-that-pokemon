import React from 'react';
import firebase from 'firebase';
import { hashHistory } from 'react-router';
import { Alert, Button, PageHeader } from 'react-bootstrap';
import validate, { ValidatedInput } from './validate';
import md5 from 'js-md5';

class LoginPage extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         'email': undefined,
         'password': undefined,
         'handle': undefined,
         'avatar': '',
         error: false,
         errorMsg: '',
         loading: false
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
      this.setState({ loading: true });
      firebase.auth().signInWithEmailAndPassword(email, password)
         .then((response) => {
            this.setState({ loading: false });
            hashHistory.push('/channels');
         })
         .catch((err) => {
            this.setState({ 
               loading: false,
               error: true,
               errorMsg: err.message
            })
         });
   }

   handleAlertDismiss = () => {
      this.setState({ error: false })
   }

   render() {
      return (
         <div>
            <AuthFields newUser={false} email={this.state.email} password={this.state.password} 
                     handle={this.state.handle} handleChange={this.handleChange} 
                     signUp={this.signUp} signIn={this.signIn} loading={this.state.loading}/>

            { this.state.error &&
               <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
               <h4>Error</h4>
               <p>{this.state.errorMsg}</p>
               <p>
                  <Button onClick={this.handleAlertDismiss}>Close</Button>
               </p>
            </Alert>
            }
         </div>
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
         'avatar': '',
         loading: false
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
      this.signUpCallback(this.state.email, this.state.password, this.state.handle, 
         'https://www.gravatar.com/avatar/' + md5(this.state.email));
   }

   // back to login screen
   signIn = (event) => {
      event.preventDefault();
      hashHistory.push('/login');
   }

   // register new users
   signUpCallback = (email, password, handle, avatar) => {
      this.setState({ loading: true })
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
            firebaseUser.sendEmailVerification();

            return profilePromise;
         })
         .then((promise) => {
            this.setState({ loading: false });
            hashHistory.push('/channels');
         })
         .catch(err => console.log(err));
   }

   componentWillUnmount() {
      if (this.unregister) {
         this.unregister();
      }
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
                  <Button bsStyle="primary" disabled={!signUpEnabled} onClick={(e) => this.props.signUp(e)}>
                     {
                        this.props.loading ? "Please wait..." :
                        this.props.newUser ? "Sign up" : "Need an account?"
                     }
                  </Button>
                  <Button bsStyle="primary" disabled={!this.props.newUser && !signInEnabled} onClick={(e) => this.props.signIn(e)}>
                     {
                        this.props.loading ? "Please wait..." :
                        this.props.newUser ? "Back to login" : "Sign in"
                     }
                  </Button>
               </div>
            </form>
         </div>
      );
   }
}

export { LoginPage, JoinPage };
export default LoginPage;
