import { LOADING, REGISTER, LOGIN, LOGOUT, ADD_VEHICLE, GET_VEHICLE, 
  DELETE_VEHICLE,
  DUPLICATE_USER, DUPLICATE_EMAIL, AUTH_ERROR, INVALID_CREDENTIALS, CLEAR_ERROR, CLOSE_SIDE_BAR} from '../actions';

import {
  SELECTED
} from "../actions/selectVehicle"

const initialState = {
  data: [],
  vehicles: {},
  error: null,
  selected_id: null,
  // sidebar_open: true,
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING:
      return {
        ...state,
        // error: null,
        loading: true
      };
    case REGISTER:
      return {
        ...state,
        // error: null,
        loading: false,
        data: [...state.data, { value: action.payload }]
      };
    case LOGIN:
      return {
        ...state,
        // error: null,
        loading: false,
        data: [...state.data, { value: action.payload }]
          };
    case LOGOUT:
        localStorage.removeItem("token");
        localStorage.removeItem("id");
        return initialState


    case ADD_VEHICLE:
      console.log("vehicles", state.vehicles.vehicles, action.payload)
      let vehicles = state.vehicles.vehicles.slice();
      vehicles.push(action.payload);
      console.log("vehicles push",vehicles)
            return {
          ...state,
          // error: null,
          loading: false,
          vehicles: {vehicles: vehicles}
        };
      case GET_VEHICLE:
        return {
          ...state,
          // error: null,
          loading: false,
          vehicles: {...state.vehicles, vehicles: action.payload}      
      };
      case DELETE_VEHICLE:
        let filteredVehicles = state.vehicles.vehicles.filter(vehicle => {
          console.log("vehicle info", vehicle.id, action.payload)
          return vehicle.id !== action.payload;
        });
        return {
          ...state,
          error: "error",
          loading: false,
          vehicles: {vehicles: filteredVehicles}
        };
    case AUTH_ERROR:
      return {
        ...state,
        error: "error",
        loading: false,
      }
    case DUPLICATE_USER:
      return {
        ...state,
        error: "Username already taken",
        loading: false,
      }
    case DUPLICATE_EMAIL:
      return {
        ...state,
        error: "Email already taken",
        loading: false,
      }
    case INVALID_CREDENTIALS:
      return {
        ...state,
        error: "Invalid username or password",
        loading: false,
      }
    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    case SELECTED:
        console.log("reducer time")
        return {
          ...state,
          selected_id: action.payload
        }
      // case CLOSE_SIDE_BAR:
      //   return {
      //     ...state,
      //     sidebar_open: !sidebar_open
      //   }  
    default:
      return state;
  }
};
