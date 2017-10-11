import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import App from './App'; // import our component

// can load other CSS files (e.g,. Bootstrap) here
import 'whatwg-fetch/fetch.js';

// load our CSS file
import './index.css';

const theme = createMuiTheme();

// render the Application view
ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>,
  document.getElementById('root')
);