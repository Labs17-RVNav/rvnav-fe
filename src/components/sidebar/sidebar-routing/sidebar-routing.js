import React from 'react'; 


const RoutingSidebar = (props) => {

//     const directions = [
//         "Start at 901 Gascony Ct, Kissimmee, Florida, 34759",
//         "Go west on Gascony Ct toward Bordeaux Rd",     
//         "Turn right on Bordeaux Rd",
//         "Turn left on Walnut St",
//         "Turn right on Country Club Rd",
//         "Turn right on Doverplum Ave",
//         "Turn left",
//         "Turn right",
//         "Turn right",
//         "Finish at 904 Cypress Pkwy, Kissimmee, Florida, 34759, on the right"
// ];

    console.log('RoutingSidebar', props)

    return (
        <div className='directionsContainer'>
        <h3 id='directionsTitle'>Directions</h3>
            <p className="route-loading">{props.loading}</p>
            <div className="directions">
                {props.textDirections.map(e => {
                    return (
                    <p className="instruction">- {e}</p>
                    )
                })}
            </div>
        </div>
    )
};

export default RoutingSidebar;