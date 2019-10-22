import axios from 'axios';

export const LOADING = 'LOADING';
export const ERROR_MESSAGE = 'ERROR_MESSAGE';
export const REGISTER = 'REGISTER';
export const LOGIN = 'LOGIN';
export const ADD_VEHICLE = 'ADD_VEHICLE';
export const GET_VEHICLE = 'GET_VEHICLE';
export const GET_WALMARTS = 'GET_WALMARTS';
export const DELETE_VEHICLE = "DELETE_VEHICLE";
export const AUTH_ERROR = "AUTH_ERROR";
export const INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
export const CLEAR_ERROR = "CLEAR_ERROR";
export const DUPLICATE_USER = "DUPLICATE_USER";
export const DUPLICATE_EMAIL = "DUPLICATE_EMAIL";
export const LOGOUT = " LOGOUT";
export const CLOSE_SIDE_BAR = "CLOSE_SIDE_BAR ";

export function authError(error) {
 return { type: "AUTH_ERROR", payload: error };
}

export function clearError() {
 return { type: CLEAR_ERROR };
}

export function closeSideBar() {
  return { type: CLOSE_SIDE_BAR};
}

export const register = creds => {
  
  return dispatch => {
    dispatch({ type: LOADING });
    return axios
      .post(
        "https://labs-rv-life-staging-1.herokuapp.com/users/register",
        creds
      )
      .then(response => {
        dispatch({ type: REGISTER, payload: response.data });
        console.log("response", response.data);
        return true;
      })
      .catch(err => {
        if (
          authError(err).payload.response.data.constraint ===
          "users_username_unique"
        ) {
          dispatch({ type: DUPLICATE_USER });
          setTimeout(() => {
            dispatch({ type: CLEAR_ERROR });
          }, 5000);
        }
        if (
          authError(err).payload.response.data.constraint ===
          "users_email_unique"
        ) {
          dispatch({ type: DUPLICATE_EMAIL });
          setTimeout(() => {
            dispatch({ type: CLEAR_ERROR });
          }, 5000);
        }
      });
  };
 };
 export const login = values => {
  return dispatch => {
    dispatch({ type: LOADING });
    return axios
      .post("https://labs-rv-life-staging-1.herokuapp.com/users/login", values)
      .then(res => {
        console.log(res); // data was created successfully and logs to console
        localStorage.setItem("token", res.data.token);
        dispatch({ type: LOGIN, payload: res.data });
        return true;
      })
      .catch(err => {
        if (authError(err).payload.response.status === 401) {
          dispatch({ type: INVALID_CREDENTIALS });
          setTimeout(() => {
            dispatch({ type: CLEAR_ERROR });
          }, 5000);
        }
        // dispatch({ type: ERROR_MESSAGE, errorMessage: "request failed" });
      });
  };
 };

export const logout = () => {
  //Google analytics tracking
  window.gtag("event", "logout", {
    event_category: "access",
    event_label: "logout"
  });
  return {type: LOGOUT}
}

export const addVehicle = value => {
  return dispatch => {
    dispatch({ type: LOADING });
    return axios
      .post('https://labs-rv-life-staging-1.herokuapp.com/vehicle', value,
      {headers: { Authorization: localStorage.getItem("token") }, 'Content-Type': 'application/json'})
      .then(res => {
        console.log("add vehicle res", res); // data was created successfully and logs to console
        
        dispatch({ type: ADD_VEHICLE, payload: res.data });
        return true;
      })
      .catch(err => {
        console.log("add vehicle err", err); // there was an error creating the data and logs to console
        dispatch({ type: ERROR_MESSAGE, errorMessage: 'request failed' });
      });
  };
};

export const getVehicles = () => {
  return dispatch => {
    dispatch({ type: LOADING });
    return axios
      .get('https://labs-rv-life-staging-1.herokuapp.com/vehicle',
      {headers: { Authorization: localStorage.getItem("token") }, 'Content-Type': 'application/json'})
      .then(res => {
        console.log("get vehicle res", res); // data was created successfully and logs to console
        
        dispatch({ type: GET_VEHICLE, payload: res.data });
        return true;
      })
      .catch(err => {
        console.log("get vehicle err",err); // there was an error creating the data and logs to console
        dispatch({ type: ERROR_MESSAGE, errorMessage: 'request failed' });
      });
  };
};

export const updateVehicle = (value, id) => {
  //Google analytics tracking
  window.gtag("event", "update vehicle", {
    event_category: "update",
    event_label: "update vehicle"
  });
  return dispatch => {
    dispatch({ type: LOADING });
    return axios
      .put(`https://labs-rv-life-staging-1.herokuapp.com/vehicle/${id}`, value,
      {headers: { Authorization: localStorage.getItem("token") }, 'Content-Type': 'application/json'})
      .then(res => {
        console.log("update res", res); // data was created successfully and logs to console
        
        // dispatch({ type: UPDATE_VEHICLE, payload: {value, id} });
        dispatch({ type: LOADING });
        return axios
          .get('https://labs-rv-life-staging-1.herokuapp.com/vehicle',
            { headers: { Authorization: localStorage.getItem("token") }, 'Content-Type': 'application/json' })
          .then(res => {
            console.log("get vehicle res", res); // data was created successfully and logs to console

            dispatch({ type: GET_VEHICLE, payload: res.data });
            return true;
          })
          .catch(err => {
            console.log("get vehicle err", err); // there was an error creating the data and logs to console
            dispatch({ type: ERROR_MESSAGE, errorMessage: 'request failed' });
          });
        // return true;
      })
      .catch(err => {
        console.log("update vehicle err:", err); // there was an error creating the data and logs to console
        dispatch({ type: ERROR_MESSAGE, errorMessage: 'request failed' });
      });
  };
};
export const deleteVehicles = (id) => {
  //Google analytics tracking
  window.gtag("event", "delete vehicle", {
    event_category: "delete",
    event_label: "delete vehicle"
  });
  return dispatch => {
    dispatch({ type: LOADING });
    return axios
      .delete(`https://labs-rv-life-staging-1.herokuapp.com/vehicle/${id}`,
      {headers: { Authorization: localStorage.getItem("token") }, 'Content-Type': 'application/json'})
      .then(res => {
        console.log("de;lete res", res); // data was created successfully and logs to console
        
        dispatch({ type: DELETE_VEHICLE, payload: id });
        return true;
      })
      .catch(err => {
        console.log("delete vehicle err:", err); // there was an error creating the data and logs to console
        dispatch({ type: ERROR_MESSAGE, errorMessage: 'request failed' });
      });
  };
};
