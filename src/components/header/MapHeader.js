import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Button from 'react-bootstrap/Button';

const MapHeader = () => {

    const [sidebar, setSidebar] = useState(true)

    const toggleSidebar = () => {
        //Google analytics tracking
        window.gtag("event", "sidebar toggle", {
          event_category: "sidebar",
          event_label: "sidebar toggle"
        });
        setSidebar(false)
      }

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
        </div>
    )
}

export default MapHeader