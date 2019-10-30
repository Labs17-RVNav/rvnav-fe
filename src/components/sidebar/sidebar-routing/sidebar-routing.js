import React from 'react'; 
import './sidebar-routing.scss'

const RoutingSidebar = (props) => {

    console.log('RoutingSidebar', props)

    const sidebarAnchor = () => {
        let sidebar = document.getElementById('overlayNav')
        sidebar.style.height = '100%'
        sidebar.style.margin = '0'
        sidebar.style.width = '23.4375rem'

        // let navBar = document.getElementsByTagName('div.navBar')
        // navBar.style.display = 'none'
    }

    return (
        <>
            {props.loading !== 'routing successful' ? <p className="route-loading">{props.loading}</p> :
                <div className='sidebarContainer'>
                    <div className='sidebarHeader'>
                        <h2>RV WAY</h2>
                    </div>
                    <div className='directionsContainer'>
                        <div className="directions">
                        <h3 id='directionsTitle'>Directions</h3>
                            {props.textDirections.map(e => {
                                return (
                                    <p className="instruction">{e}</p>
                                    )
                                })}
                            {sidebarAnchor()}
                        </div>
                    </div>
                    {/* <div className='sidebarFooterContainer'> */}
                        <p id='sidebarFooter'>These directions are for planning purposes only. You may find that construction projects, traffic, weather, or other events may cause conditions to differ from the map results, and you should plan your route accordingly. You must obey all signs or notices regarding your route.</p>
                    {/* </div> */}
                </div>
            }
        </>
    )
};

export default RoutingSidebar;