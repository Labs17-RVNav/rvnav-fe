import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
import Sidebar from '../sidebar/Sidebar'
import { NavLink } from 'react-router-dom'
import { getVehicles } from '../../store/actions'
import { connect } from "react-redux"
import Button from 'react-bootstrap/Button'

import MapHeader from '../header/MapHeader'

const WebMapView = () => {
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
            <div className = "webmap" ref = { mapRef }/>
        </>
        
    )
};

export default WebMapView