import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
import Sidebar from '../sidebar/Sidebar'
import { NavLink } from 'react-router-dom'
import { getVehicles } from '../../store/actions'
import { withRouter } from 'react-router-dom'
import { connect } from "react-redux"
import Button from 'react-bootstrap/Button'

import MapHeader from '../header/MapHeader'

const WebMap = () => {
    const mapRef = useRef();

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

    return (
        <>
            <MapHeader />
            {/* <Sidebar
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
                toggleSidebar={toggleSidebar} 
                sidebarOpen={state.sidebarOpen} 
                /> */}
            <div className = "webmap" ref = { mapRef }/>
            
        </>
        
    )
};

const mapStateToProps = state => ({
    vehicles: state.vehicles,
    selected_id: state.selected_id
})

export default withRouter(connect(mapStateToProps, { getVehicles })(WebMap))