import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import {Router, Route, hashHistory, IndexRoute} from 'react-router';
import App from './App'; // import our component
import ChannelsList from './Chat';
import { JoinPage, LoginPage } from './SignUp';

// Initialize Firebase
var config = {
   apiKey: "AIzaSyBBoIDLmycBKJ6qMq-zpG_Lfv-6Rv9g0x4",
   authDomain: "accord-c1091.firebaseapp.com",
   databaseURL: "https://accord-c1091.firebaseio.com",
   storageBucket: "accord-c1091.appspot.com",
   messagingSenderId: "451507435384"
};
firebase.initializeApp(config);

// load our CSS file
import './index.css';

// render the Application view
ReactDOM.render(
   <Router history={hashHistory}>
      <Route path="/" component={App}>
         <IndexRoute component={ChannelsList} />
         <Route path="join" component={JoinPage} />
         <Route path="login" component={LoginPage} />
         <Route path="channels" component={ChannelsList} />
         <Route path="channel/:channelName" component={ChannelPage} />
      </Route>
   </Router>,
   document.getElementById('root')
);
