import React from 'react';
import './App.css';
import { Route } from 'react-router-dom';
import Auth from './components/auth/Auth';
import Map from './components/map/Map';
import LandingPage from './components/landingPage/LandingPage';


import WebMap from './components/arcgismap/WebMap'
import DoNotUseMap from './components/map/DoNotUseMap'

const App = () => {
  return (
    <div className="App">
      <Route path="/" exact component={LandingPage} />
      <Route path="/auth" component={Auth} />
      <Route path="/map" component={Map} />     
      {/* <Route path="/map" component={DoNotUseMap} />   */}
      {/* <Route path="/map" component={WebMap} />   */}
    </div>
  );
};

export default App;
