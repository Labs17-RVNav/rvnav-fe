import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import VehicleForm from '../vehicleForm/VehicleForm';
import Vehicles from '../vehicleForm/Vehicles';
import RoutingForm from '../map/routingForm';
import './sidebar.css';

const Sidebar = (props) => {
    const [state, setState] = useState({
        vehicleForm: "off",
        routing: "on",
        vehicles: "off"
    })
    // console.log('props on Sidebar', props)


    const closeVehicleForm = () => setState({ ...state, vehicleForm: "off", vehicles: "on" })

    //selects the tab when it is clicked on, deselects all others
    const buttonSelect = (event) => {
        console.log("event", event.target);
        setState({
            ...state,
            vehicleForm: "off",
            routing: "off",
            vehicles: "off",
            [event.target.id]: "on"
        })

    }

    //console.log("sidebar props", props);
    return (
        <div id='overlayNav' className={`overlay ${props.sidebarOpen ? 'open' : 'close'}`}>
            {/* <div >
                <i className="fas fa-arrow-circle-left" onClick={props.toggleSidebar}></i>
            </div> */}
            <div class="navbar" >
                <a class="rv-way-text">RV WAY</a>
                <a><i class="menu-icon"></i></a>
            </div>


            <div className='overlay-content'>

                <div >
                    {/* <div className="sidebar-tabs">
                        <p className={` route-tab ${state.routing === `on` ? `selected` : `sidebar-tab`} `}
                            id="routing"
                            onClick={buttonSelect}>Route</p>

                        <p className={`${state.vehicles === `on` ? `selected` : `sidebar-tab`}   `}
                            id="vehicles"
                            onClick={buttonSelect}>Vehicles</p>

                        <p className={`${state.vehicleForm === `on` ? `selected` : `sidebar-tab`}   `}
                            id="vehicleForm"
                            onClick={buttonSelect}>Add a Vehicle</p>
                    </div> */}

                    <div className={`${state.routing}`}>
                        <RoutingForm
                            textDirections={props.textDirections}
                            toggle={props.toggle}
                            walmartSelected={props.walmartSelected}
                            campsiteSelected={props.campsiteSelected}
                            pointOfInterestDistance={props.pointOfInterestDistance}
                            loading={props.loading}
                            arcRoute={props.arcRoute}
                            onChangeHandler={props.onChangeHandler}
                            routeChangeHandler={props.routeChangeHandler}
                            start={props.start}
                            end={props.end}
                        />
                    </div>

                    {localStorage.token ? <div className={`${state.vehicles}`}>
                        <Vehicles />
                    </div> :
                        <div className={`login-to-add ${state.vehicles}`}>
                            <NavLink to="/auth" style={{ marginRight: 10 }}>
                                Login or create an account to add and view vehicle information.
                            </NavLink>
                        </div>}

                    {localStorage.token ? <div className={`${state.vehicleForm}`}>
                        <VehicleForm closeVehicleForm={closeVehicleForm} />
                    </div> :
                        <div className={`login-to-add ${state.vehicleForm}`}>
                            <NavLink to="/auth" style={{ marginRight: 10 }}>
                                Login or create an account to add information about your vehicle.
                            </NavLink>
                        </div>}

                </div>
            </div>
            <div id='mainsidebar'>
                {/* <button className = 'openbtn' onClick = {props.toggleSidebar}>Options</button> */}
                {/* // button to bring out sidebar */}
            </div>
        </div>
    )
}



export default Sidebar;