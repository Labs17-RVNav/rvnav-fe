import React, { useState, useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
import Sidebar from '../sidebar/Sidebar';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { getVehicles } from "../../store/actions";
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import Button from 'react-bootstrap/Button';

import "./Map.css"
const DoNotUseMap = (props) => {
    const firstUpdate = useRef(true)
    const mapRef = useRef();
    const [state, setState] = useState({
      start: '',
      end: '',
      sidebarOpen: true,
      directionsService: {},
      directionsDisplay: {},
      Coordinates: [],
      polygonsArray: [],
      startCoord: "",
      endCoord: "",
      map: null,
      loading: "", 
      walmartSelected: false,
      campsiteSelected: false, 
      pointOfInterestDistance: 5, 
      textDirections: []
    })
  console.log('state.campsiteSelected', state.campsiteSelected)
  
  
  useEffect(() => {
    
    renderMap()
    props.getVehicles()
  }, [])

  
  useEffect(() => {
    if(firstUpdate.current){
      firstUpdate.current = false
      console.log('********* firstUpdate ref')
      return
    } 
    console.log('*******start coordinate effect is running', state.end)
    geocode(state.end, "endCoord");
  }, [state.startCoord])

  useEffect(() => {
    if(firstUpdate.current){
      firstUpdate.current = false
      console.log('*********updating firstUpdate ref')
      return
    } 
    console.log('*******end coordinate effect is running')
    setState({...state, loading: "checking initial route"});
    routeBeforeBarriers();
  }, [state.endCoord])

  useEffect(
    () => {
        // lazy load the required ArcGIS API for JavaScript modules and CSS
        loadModules(['esri/Map', 'esri/views/MapView', 'esri/widgets/Search'], { css: true })
            .then(([ArcGISMap, MapView, Search]) => {
                const map = new ArcGISMap({
                    basemap: 'streets-navigation-vector'
                });

                // load the map view at the ref's DOM node
                const view = new MapView({
                    container: mapRef.current,
                    map: map,
                    center: [-118, 34],
                    zoom: 8
                });

                const search = new Search({ view })
                view.ui.add(search, 'top-right')

                return () => {
                    if (view) {
                        // destroy the map view
                        view.container = null;
                    }
                };
            });
    }
);
  
  // useEffect(() => {
  //   // if(firstUpdate.current){
  //   //   firstUpdate.current = false
  //   //   return
  //   // } 
  //   initRoute()
  // }, [state.polygonsArray])
    
  

    //toggleSidebar has been moved into the component called MapHeader which is rendered as an import an WebMap
    //will need to refactor so it is part of the redux store
    const toggleSidebar = () => {
    //Google analytics tracking
    window.gtag("event", "sidebar toggle", {
      event_category: "sidebar",
      event_label: "sidebar toggle"
    });
    setState({...state, sidebarOpen: !state.sidebarOpen })
  }

  //this function displays the map initially when the app is opened, is called when the component mounts
  //loads a script and calls initmap
  const renderMap = () => {
    loadScript(`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_KEY}&callback=initMap`)
    window.initMap = initMap
  }
  //called by initmap to display the initial map when the app is open
  const initMap = () => {
    var directionsService = new window.google.maps.DirectionsService();
    var directionsDisplay = new window.google.maps.DirectionsRenderer();
   
    var map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 34.0522, lng: -118.2437},
      zoom: 12
    });
    
    
    setState({...state,
      directionsService,
      directionsDisplay
    })
    directionsDisplay.setMap(map)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        //marker for users location
        new window.google.maps.Marker({ map: map, position: pos });
        //new window.google.maps.Marker({map:map, position: mart});
        map.setCenter(pos);
      });
    } else {
      // Browser doesn't support Geolocation
      console.log("Error finding location")
    }
    // onChangeHandler(e);
    document.querySelector('form').addEventListener('submit', onChangeHandler)
   
  }

   //selects the map from google maps and puts it on the components state
   const setMapToState = () => {
    var map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: parseFloat(state.startCoord && state.startCoord.geometry.y.toFixed(4)), lng: parseFloat(state.startCoord && state.startCoord.geometry.x.toFixed(4)) },
      zoom: 10
    });
    setState({
      ...state, 
      map: map
    })
  }
  
  //stores the changes as someone types in the start and end boxes on the routing form
  //basic text change handler
  const routeChangeHandler = (e) => {
    setState({...state,
      [e.target.name]: e.target.value
    })
  }

  //this function is triggered when the route button is clicked
  //calls the geocode() function for start and end, triggers a series of functions/api calls
  const onChangeHandler = (e) => { 
    setState({...state, loading: "searching addresses"})
    // e.preventDefault()
    //setState({...state, polygonsArray: []})
    geocode(state.start, "startCoord");
    //geocode(state.end, "endCoord");
  }

  //calls ArcGIS geocode API, converts the address entered in the route form to gps coordinates
  //calls routeBeforeBarriers ()
  const geocode = (address, coordinate) => {
    axios
    .get(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${address}&outFields=Match_addr,Addr_type`)
    .then(res => {
      console.log('res from arcgis', res)
      if(res){
      setState({...state, [coordinate]: {
        "geometry": {
        "x": res.data.candidates[0].location.x, //xcorresponds to longitude
        "y": res.data.candidates[0].location.y, //y corresponds to latitude
        "spatialReference": {
          "wkid": res.data.spatialReference.wkid
        }
      },
      "attributes": {
        "Name": res.data.candidates[0].address
      }
    }
  }

  )

  }
    })
    .catch(err => {
      console.log("gecode err", err)
      setState({...state, loading: "problem geocoding, please try again"});
    })

  }

  //calls arcGIS route API, makes route without barriers, loops along said route to check for low clearance
  //calls clearanceAPI() to check for barriers if height is > 0
  const routeBeforeBarriers= () => {
    var formData = new FormData();
    formData.append('f', 'json');
    formData.append('token', process.env.REACT_APP_ARC_KEY);
    formData.append('stops',
      JSON.stringify({
        "type": "features",
        "features": [
          state.startCoord,
          state.endCoord
        ]
      }));
    formData.append('findBestSequence', false);
    const config = {
      headers: { 'content-type': 'multipart/form-data' }
    }
    axios.post("https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve", formData, config)
      .then(res => {
        if(res){
        let resLength = res.data.routes.features[0].geometry.paths[0].length;
        let startCoordinate = { lat: null, lng: null }; //the first coordinate sent to the clearance api
        let endCoordinate = {lat: null, lng: null}; //the second coordinate sent to the clearance api
        let increment = 500; //variable for breaking the route into chunks for the clearance api, call will be made every nth coordinate returned from ArcGIS
        let polyArrayLocal = []; //stores barriers beofre they are set to state
        let lastStartPoint = resLength - (resLength % increment); //the value of i when the loop is on it's last run (ex. i = 1000 for an array of length 1200 with increments of 500)
        setState({...state, loading: "checking clearance"}) //changes loading message displayed below routing form
        for (let i = 0; i < resLength; i=i+increment) {
          startCoordinate = { lat: res.data.routes.features[0].geometry.paths[0][i][1], lng: res.data.routes.features[0].geometry.paths[0][i][0]}
         
          //checks if we are at the last value of i in the loop and, if so, runs a special case checking the last part of the route 
          if(i === lastStartPoint){
            //when at the last value of i, checks from that value to the final index
            endCoordinate = {lat: res.data.routes.features[0].geometry.paths[0][resLength-1][1], lng:  res.data.routes.features[0].geometry.paths[0][resLength-1][0]}
          } else {
            //when not at the last value of i in the loop, that value to another value based on the increment
            endCoordinate = {lat: res.data.routes.features[0].geometry.paths[0][i + increment][1], lng:  res.data.routes.features[0].geometry.paths[0][i + increment][0]}
          }
          //function that call the clearance api
          //startCoordinate and endCoordinate are sent to make the API call, polyArrayLocal stores the response from the api, i and last startPoint are used check when the loops is finished
          clearanceAPI(startCoordinate, endCoordinate, polyArrayLocal, i, lastStartPoint);
          
        }
      }
      })
      .catch(err => {
        console.log("arc route err:", err);
        setState({...state, loading: "problem with initial route, please try again"});
      })

  }


  //startCoordinate and endCoordinate are sent to make the API call, polyArrayLocal stores the response from the api, i and last startPoint are used check when the loops is finished
  //calls api to check low clearances on route
  //call initRoute() to make new route with barriers/clearances included
  const clearanceAPI = (start, end, polyArrayLocal, i, lastStartPoint) => {
    //sets height to zero intially
    let heightOfSelectedVehicle = 0;
    //if height has been set for a vehicle, checks the height and assigns it as the value to be sent to the api
    if(props.vehicles.vehicles){
      props.vehicles.vehicles.map( e => {
        //checks if a vehicla has been selected by the user
        if(e.id === props.selected_id){
            heightOfSelectedVehicle = e.height;
        }
        return heightOfSelectedVehicle;
      })
    }
    let bridgePost = { //sends low bridges a long a route
      "height": heightOfSelectedVehicle,
      "start_lon": parseFloat(start.lng.toFixed(4)),
      "start_lat": parseFloat(start.lat.toFixed(4)),
      "end_lon": parseFloat(end.lng.toFixed(4)),
      "end_lat": parseFloat(end.lat.toFixed(4))
    }
    //creates a triangle based on the points of low clearance sent from the low clearance api
    //this is done because the routing api uses polygons to block the route from passing through certain areas, and the clearance api returns only one point so a traingle is created around that point
    //any polygon shape can be sent to the routing api, triangles were chosen to avoid problems creating the points out of order (eg a square as an hourglass), and to reduce the number of points sent to the api, hopefully speeding it up
    let makePolygon = (latitude, longitude) => {
      let polygon = [];
      polygon[0] = [longitude, latitude + .00007]
      polygon[1] = [longitude - .0001 ,latitude - .0002];
      polygon[2] = [longitude + .0001, latitude - .0001];
      return polygon;
    }

    axios.post("https://dr7ajalnlvq7c.cloudfront.net/fetch_low_clearance", bridgePost)
      .then(res => {
          if(res){
          
          for(let j = 0; j < res.data.length; j++){
             polyArrayLocal.push(makePolygon(res.data[j].latitude, res.data[j].longitude));
          }
          //if we have made the final call to this api, as checked using values from the previous function, then we call the init route function
          if(i === lastStartPoint){
            console.log("init conditional")
            setState(
              {
                ...state.polygonsArray,
                polygonsArray: polyArrayLocal
              }
              //this callback insure the function is called after the state that it need is properly set
            );
          }
        }
      })
      .catch(err => {
        setState({...state, loading: "problem getting clearance info, please try again"})
        console.log("clearance error:", err);
      })
  }
  
  //makes call to the routing API with barriers included
  //displays route to google maps
  //calls pointsOfInterest()
  const initRoute = () => {  
    setMapToState();
    setState({...state, loading: "making final route"})
    console.log("length for markers loop", state.polygonsArray.length);


    console.log("start COORD", state.startCoord);
    console.log("end COORD", state.endCoord);
    var formData = new FormData();
    formData.append('f', 'json');
    formData.append('token', process.env.REACT_APP_ARC_KEY);
    formData.append('stops',
      JSON.stringify({
        "type": "features",
        "features": [
          state.startCoord,
          state.endCoord
        ]
      }));
    formData.append("polygonBarriers", JSON.stringify(
      {
        "features": [{
          "geometry": {
            "rings": state.polygonsArray
          },
          "attributes": {
            "Name": "Bridge",
            "BarrierType": 0
          }
        }
        ]
      }
    ))
    formData.append('findBestSequence', false);
    const config = {
      headers: { 'content-type': 'multipart/form-data' }
    }
    axios.post("https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve", formData, config)
      .then(res => {
        console.log('res from arcgis post', res)
        setState({...state, Coordinates: []})
       for (let i = 0; i < res.data.routes.features[0].geometry.paths[0].length; i++) {
          let lng = res.data.routes.features[0].geometry.paths[0][i][0];
          let lat = res.data.routes.features[0].geometry.paths[0][i][1];
          parseFloat(lat);
          parseFloat(lng);
          let Coordinate = { lat: null, lng: null }
          Coordinate.lat = lat;
          Coordinate.lng = lng;
          setState({
            Coordinates: [...state.Coordinates, Coordinate]
          }) 
        }
        console.log("coords array after loop (w/barriers)", state.Coordinates);
        let directionsResArr = res.data.directions[0].features;
        console.log("directions res arr", directionsResArr)
        let newDirectionsArray = [];
        for(let i = 0; i < directionsResArr.length; i++){
           newDirectionsArray.push (directionsResArr[i].attributes.text);
        }
        console.log('directions array', newDirectionsArray);
        setState({...state, textDirections: newDirectionsArray})

        //NOTE: the following loop will display markes for all the low clearance trianges on the map
        //it is commented out as it makes the UI cluttered for the user
        //it probably SHOULD NOT BE DELETED unless another dev tool has been made to replace it, as it allows one to visually see what parts of the map we are blocking
        // for(let i = 0; i < state.polygonsArray.length; i++){
        //   console.log("markers i", i);
        //   let displayPoly = [];     
        //   for(let j = 0; j < 3; j++){
        //     displayPoly[0] = {lat: state.polygonsArray[i][j][1] , lng: state.polygonsArray[i][j][0]};
        //     displayPoly[1] = {lat: state.polygonsArray[i][j][1], lng:  state.polygonsArray[i][j][0]};
        //     displayPoly[2] = {lat: state.polygonsArray[i][j][1], lng: state.polygonsArray[i][j][0] };
        //     console.log(`markers poly ${j}`, displayPoly);
        //       new window.google.maps.Marker({
        //         map: state.map,
        //         label: `${j}`,
        //         position: displayPoly[j]      
        //     }) 
        //   }
        // }
    
        pointsOfInterest();

        var polyPath = new window.google.maps.Polyline({
          path: state.Coordinates,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 4
        });

        polyPath.setMap(state.map);

        setState({...state, loading: "routing successful"})
      })
      .catch(err => {
        setState({loading: "problem making final route, please try again"})
        console.log("arc route err:", err);
      })

      
  }

  //checks if any points of interest have been checked off
  //if yes, calls pointOfInterest() and passes in the relevant information
  const pointsOfInterest = () => {
    console.log("POI STATE ENDPOINT", state.endCoord);
    if(state.walmartSelected === true){
      pointOfInterestAPI("walmart", "lightblue");
    }
    if(state.campsiteSelected === true){
      pointOfInterestAPI("campsite", "tan");
    }
  }

  //makes a call to the point of interest api
  const pointOfInterestAPI = (type, color) => {
    var bar = {
//      path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
      path: 'M -30 -10, 30 -10, 30 10, 5 10, 0 20, -5 10, -30 10 z',
      fillColor: `${color}`,
      fillOpacity: 1,
      scale: 1,
      strokeColor: `${color}`,
      strokeWeight:1
    };

    let post = {
      "latitude": state.endCoord.geometry.y,
      "longitude": state.endCoord.geometry.x,
      "distance": parseInt(state.pointOfInterestDistance)
    }
  
    axios.post(`https://dr7ajalnlvq7c.cloudfront.net/fetch_${type}`, post)
      .then(res => {
        if(res){
          res.data.map(e => {
            new window.google.maps.Marker({
              map: state.map,
              icon: bar,
              label: `${type}`,
              position: {lat: e.latitude, lng: e.longitude}      
            })
          })
        }
      })
      .catch(err => {
        console.log("POI walmart error:", err);
      })
  }

  //toggles a value when point of interest button is clicked
  const toggle = (stateKey) => {
    //Google analytics tracking
    window.gtag("event", "checking points of interest", {
      event_category: "points of interest",
      event_label: "checking points of interest"
    });
    console.log(stateKey)
    setState({...state,
      [stateKey]: !state[stateKey]
    })
    console.log(state[stateKey])
  }

  //nav has been moved into it's own component called MapHeader and is rendered as an import an WebMap

    return (
      <div>
        {/* <Nav /> */} 
        <div className="open-button-wrap">
          <i className="fas fa-arrow-circle-right" onClick={toggleSidebar}   ></i>
          
          <NavLink  to="/">
            <Button 
              className="logout-btn"
              variant="warning">{localStorage.token ? `Log Out` : `Login / Signup`}
            </Button>
          </NavLink>
          
        </div>
        <Sidebar
          textDirections={state.textDirections}
          toggle={toggle}
          walmartSelected={state.walmartSelected}
          campsiteSelected={state.campsiteSelected}
          pointOfInterestDistance={state.pointOfInterestDistance}
          loading={state.loading}
          routeChangeHandler={routeChangeHandler}
          onChangeHandler={onChangeHandler}
          start={state.start}
          end={state.end}
          toggleSidebar={toggleSidebar} sidebarOpen={state.sidebarOpen} />
        {/* <div id="map" ></div> */}
        <div className = "webmap" ref = { mapRef }/>
      </div>
    );
 }


//google maps script
function loadScript(url) {
  var index = window.document.getElementsByTagName("script")[0]
  var script = window.document.createElement("script")
  script.src = url
  script.async = true
  script.defer = true
  index.parentNode.insertBefore(script, index)
}

const mapStateToProps = state => ({
  vehicles: state.vehicles,
  selected_id: state.selected_id
})

export default withRouter(connect(
  mapStateToProps, { getVehicles }
)(DoNotUseMap))
