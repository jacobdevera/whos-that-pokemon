import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // import our component

// can load other CSS files (e.g,. Bootstrap) here
import 'whatwg-fetch';

// load our CSS file
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

// render the Application view
root.render(
  <App />
);