import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { reducer } from './store/reducers/index';
import { BrowserRouter as Router } from 'react-router-dom';

//Sentry.io
import * as Sentry from '@sentry/browser';
Sentry.init({
  dsn: 'https://760fe88e7d52460ab26a32f284a54343@sentry.io/1538830'
});

require('dotenv').config()

export const store = createStore(reducer, applyMiddleware(thunk));


ReactDOM.render(
  <Router>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>,
  document.getElementById('root')
);

