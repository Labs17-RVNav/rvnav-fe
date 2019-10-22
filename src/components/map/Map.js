import React, { Component } from 'react';
import Sidebar from '../sidebar/Sidebar';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { getVehicles } from "../../store/actions";
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import Button from 'react-bootstrap/Button';

import "./Map.css"
class MapPage extends Component {
  constructor() {
    super()
    //Shouldn't this be in the redux store?
    this.state = {
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
    }
  }
  
  componentDidMount() {
    this.renderMap()
    this.props.getVehicles()
  }

    //toggleSidebar has been moved into the component called MapHeader which is rendered as an import an WebMap
    //will need to refactor so it is part of the redux store
    toggleSidebar = () => {
    //Google analytics tracking
    window.gtag("event", "sidebar toggle", {
      event_category: "sidebar",
      event_label: "sidebar toggle"
    });
    this.setState({ sidebarOpen: !this.state.sidebarOpen })
  }

  //this function displays the map initially when the app is opened, is called when the component mounts
  //loads a script and calls initmap
  renderMap = () => {
    loadScript(`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_KEY}&callback=initMap`)
    window.initMap = this.initMap
  }
  //called by initmap to display the initial map when the app is open
  initMap = () => {
    var directionsService = new window.google.maps.DirectionsService();
    var directionsDisplay = new window.google.maps.DirectionsRenderer();
   
    var map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 34.0522, lng: -118.2437},
      zoom: 12
    });
    
    
    this.setState({
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
    // this.onChangeHandler(e);
    document.querySelector('form').addEventListener('submit', this.onChangeHandler)
   
  }

   //selects the map from google maps and puts it on the components state
   setMapToState = () => {
    var map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: parseFloat(this.state.startCoord && this.state.startCoord.geometry.y.toFixed(4)), lng: parseFloat(this.state.startCoord && this.state.startCoord.geometry.x.toFixed(4)) },
      zoom: 10
    });
    this.setState({
      map: map
    })
  }
  
  //stores the changes as someone types in the start and end boxes on the routing form
  //basic text change handler
  routeChangeHandler = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  //this function is triggered when the route button is clicked
  //calls the geocode() function for start and end, triggers a series of functions/api calls
  onChangeHandler = (e) => { 
    this.setState({loading: "searching addresses"})
    // e.preventDefault()
    //this.setState({polygonsArray: []})
    this.geocode(this.state.start, "startCoord");
    //this.geocode(this.state.end, "endCoord");
  }

  //calls ArcGIS geocode API, converts the address entered in the route form to gps coordinates
  //calls routeBeforeBarriers ()
  geocode = (address, coordinate) => {
    axios
    .get(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${address}&outFields=Match_addr,Addr_type`)
    .then(res => {
      if(res){
      this.setState({[coordinate]: {
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
  }, 
   () => {
     if(coordinate === "startCoord"){
      this.geocode(this.state.end, "endCoord");
     }
    else if(coordinate === "endCoord"){
        this.setState({loading: "checking initial route"});
        this.routeBeforeBarriers();
      }
   }
  )

  }
    })
    .catch(err => {
      console.log("gecode err", err)
      this.setState({loading: "problem geocoding, please try again"});
    })

  }

  //calls arcGIS route API, makes route without barriers, loops along said route to check for low clearance
  //calls clearanceAPI() to check for barriers if height is > 0
  routeBeforeBarriers= () => {
    var formData = new FormData();
    formData.append('f', 'json');
    formData.append('token', process.env.REACT_APP_ARC_KEY);
    formData.append('stops',
      JSON.stringify({
        "type": "features",
        "features": [
          this.state.startCoord,
          this.state.endCoord
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
        this.setState({loading: "checking clearance"}) //changes loading message displayed below routing form
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
          this.clearanceAPI(startCoordinate, endCoordinate, polyArrayLocal, i, lastStartPoint);
          
        }
      }
      })
      .catch(err => {
        console.log("arc route err:", err);
        this.setState({loading: "problem with initial route, please try again"});
      })

  }


  //startCoordinate and endCoordinate are sent to make the API call, polyArrayLocal stores the response from the api, i and last startPoint are used check when the loops is finished
  //calls api to check low clearances on route
  //call initRoute() to make new route with barriers/clearances included
  clearanceAPI = (start, end, polyArrayLocal, i, lastStartPoint) => {
    //sets height to zero intially
    let heightOfSelectedVehicle = 0;
    //if height has been set for a vehicle, checks the height and assigns it as the value to be sent to the api
    if(this.props.vehicles.vehicles){
      this.props.vehicles.vehicles.map( e => {
        //checks if a vehicla has been selected by the user
        if(e.id === this.props.selected_id){
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
            this.setState(
              {
                ...this.state.polygonsArray,
                polygonsArray: polyArrayLocal
              },
              //this callback insure the function is called after the state that it need is properly set
              () => this.initRoute()
            );
          }
        }
      })
      .catch(err => {
        this.setState({loading: "problem getting clearance info, please try again"})
        console.log("clearance error:", err);
      })
  }
  
  //makes call to the routing API with barriers included
  //displays route to google maps
  //calls pointsOfInterest()
  initRoute = () => {  
    this.setMapToState();
    this.setState({loading: "making final route"})
    console.log("length for markers loop", this.state.polygonsArray.length);


    console.log("start COORD", this.state.startCoord);
    console.log("end COORD", this.state.endCoord);
    var formData = new FormData();
    formData.append('f', 'json');
    formData.append('token', process.env.REACT_APP_ARC_KEY);
    formData.append('stops',
      JSON.stringify({
        "type": "features",
        "features": [
          this.state.startCoord,
          this.state.endCoord
        ]
      }));
    formData.append("polygonBarriers", JSON.stringify(
      {
        "features": [{
          "geometry": {
            "rings": this.state.polygonsArray
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
        this.setState({Coordinates: []})
       for (let i = 0; i < res.data.routes.features[0].geometry.paths[0].length; i++) {
          let lng = res.data.routes.features[0].geometry.paths[0][i][0];
          let lat = res.data.routes.features[0].geometry.paths[0][i][1];
          parseFloat(lat);
          parseFloat(lng);
          let Coordinate = { lat: null, lng: null }
          Coordinate.lat = lat;
          Coordinate.lng = lng;
          this.setState({
            Coordinates: [...this.state.Coordinates, Coordinate]
          }) 
        }
        console.log("coords array after loop (w/barriers)", this.state.Coordinates);
        let directionsResArr = res.data.directions[0].features;
        console.log("directions res arr", directionsResArr)
        let newDirectionsArray = [];
        for(let i = 0; i < directionsResArr.length; i++){
           newDirectionsArray.push (directionsResArr[i].attributes.text);
        }
        console.log('directions array', newDirectionsArray);
        this.setState({textDirections: newDirectionsArray})

        //NOTE: the following loop will display markes for all the low clearance trianges on the map
        //it is commented out as it makes the UI cluttered for the user
        //it probably SHOULD NOT BE DELETED unless another dev tool has been made to replace it, as it allows one to visually see what parts of the map we are blocking
        // for(let i = 0; i < this.state.polygonsArray.length; i++){
        //   console.log("markers i", i);
        //   let displayPoly = [];     
        //   for(let j = 0; j < 3; j++){
        //     displayPoly[0] = {lat: this.state.polygonsArray[i][j][1] , lng: this.state.polygonsArray[i][j][0]};
        //     displayPoly[1] = {lat: this.state.polygonsArray[i][j][1], lng:  this.state.polygonsArray[i][j][0]};
        //     displayPoly[2] = {lat: this.state.polygonsArray[i][j][1], lng: this.state.polygonsArray[i][j][0] };
        //     console.log(`markers poly ${j}`, displayPoly);
        //       new window.google.maps.Marker({
        //         map: this.state.map,
        //         label: `${j}`,
        //         position: displayPoly[j]      
        //     }) 
        //   }
        // }
    
        this.pointsOfInterest();

        var polyPath = new window.google.maps.Polyline({
          path: this.state.Coordinates,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 4
        });

        polyPath.setMap(this.state.map);

        this.setState({loading: "routing successful"})
      })
      .catch(err => {
        this.setState({loading: "problem making final route, please try again"})
        console.log("arc route err:", err);
      })

      
  }

  //checks if any points of interest have been checked off
  //if yes, calls pointOfInterest() and passes in the relevant information
  pointsOfInterest = () => {
    console.log("POI STATE ENDPOINT", this.state.endCoord);
    if(this.state.walmartSelected === true){
      this.pointOfInterestAPI("walmart", "lightblue");
    }
    if(this.state.campsiteSelected === true){
      this.pointOfInterestAPI("campsite", "tan");
    }
  }

  //makes a call to the point of interest api
  pointOfInterestAPI = (type, color) => {
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
      "latitude": this.state.endCoord.geometry.y,
      "longitude": this.state.endCoord.geometry.x,
      "distance": parseInt(this.state.pointOfInterestDistance)
    }
  
    axios.post(`https://dr7ajalnlvq7c.cloudfront.net/fetch_${type}`, post)
      .then(res => {
        if(res){
          res.data.map(e => {
            new window.google.maps.Marker({
              map: this.state.map,
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
  toggle = (stateKey) => {
    //Google analytics tracking
    window.gtag("event", "checking points of interest", {
      event_category: "points of interest",
      event_label: "checking points of interest"
    });
    console.log(stateKey)
    this.setState({
      [stateKey]: !this.state[stateKey]
    })
    console.log(this.state[stateKey])
  }

  //nav has been moved into it's own component called MapHeader and is rendered as an import an WebMap
  render() {
    return (
      <div>
        {/* <Nav /> */} 
        <div className="open-button-wrap">
          <i className="fas fa-arrow-circle-right" onClick={this.toggleSidebar}   ></i>
          
          <NavLink  to="/">
            <Button 
              className="logout-btn"
              variant="warning">{localStorage.token ? `Log Out` : `Login / Signup`}
            </Button>
          </NavLink>
          
        </div>
        <Sidebar
          textDirections={this.state.textDirections}
          toggle={this.toggle}
          walmartSelected={this.state.walmartSelected}
          campsiteSelected={this.state.campsiteSelected}
          pointOfInterestDistance={this.state.pointOfInterestDistance}
          loading={this.state.loading}
          routeChangeHandler={this.routeChangeHandler}
          onChangeHandler={this.onChangeHandler}
          start={this.state.start}
          end={this.state.end}
          toggleSidebar={this.toggleSidebar} sidebarOpen={this.state.sidebarOpen} />
        <div id="map" ></div>
      </div>
    );
  }
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
)(MapPage))
