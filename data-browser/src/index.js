import React from 'react';
import ReactDOM from 'react-dom';

import App from './App'; // import our component

// can load other CSS files (e.g,. Bootstrap) here
import 'whatwg-fetch/fetch.js';
import 'normalize.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// load our CSS file
import './index.css';

// render the Application view
ReactDOM.render(
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>,
  document.getElementById('root')
);