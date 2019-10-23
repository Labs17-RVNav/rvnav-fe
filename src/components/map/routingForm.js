import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { connect } from "react-redux";

const RoutingForm = (props) => {
    //changes "you are routing with" message at the top of the routing form
    let name = "no vehicle";
    props.vehicles.vehicles && props.vehicles.vehicles.map( e => {
      if(e.id === props.selected_id){
         name = e.name;
      }
      return name;
    })
    console.log('props on RoutingForm', props)

    return (
      <div>
        <>
        <div className="routing-with">
        <p>You are routing with</p>
        <span>{`${name}`}</span>
        </div>
        <form className="route-form" onSubmit={(event) => {
          event.preventDefault()
          props.onChangeHandler()      
          }}>
        <Form.Control autoFocus={true} className="route-input" id="start" required type="text"  placeholder="Start" name="start" value={props.start} onChange={props.routeChangeHandler}/> 
        <Form.Control className="route-input" id="end" required type="text"  placeholder="end" name="end" value={props.end} onChange={props.routeChangeHandler}/>
        <Accordion className="POI-accordion">
          <Accordion.Toggle className="POI-dropdown" as={Card.Header} eventKey="2">
            <p>Search destination points of interest</p>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="2">
            <div className="point-of-interest-options">
            <Form.Group className="search-distance-input">
              <Form.Label className="search-distance-label">distance, miles</Form.Label>
              <Form.Control 
              className="point-interest-input"       
              type="number"
              name='pointOfInterestDistance'
              placeholder="0"
              value={props.pointOfInterestDistance}
              onChange={props.routeChangeHandler}>
              </Form.Control>
            </Form.Group>
              <Button variant="secondary" 
                className={props.walmartSelected === true ? "highlight point-interest-btn" : "point-interest-btn"}
                  onClick={(e) => {
                    e.preventDefault()
                    props.toggle("walmartSelected")
                  }}>Walmarts
              </Button>
              <Button variant="secondary" 
                className={props.campsiteSelected === true ? "highlight point-interest-btn" : "point-interest-btn"}
                  onClick={(e) => {
                    e.preventDefault()
                    props.toggle("campsiteSelected")
                }}>Campsites
              </Button>
            </div>
          </Accordion.Collapse>
      </Accordion>
      <Button variant="warning" id="route-button" type="submit"> Plot Course</Button>
      </form>
      </>
      <p className="route-loading">{props.loading}</p>
      <div className="directions">
        <p>Directions</p>
        {props.textDirections.map(e => {
            return(
            <p className="instruction">- {e}</p>
            )
          })
        }
      </div>
      </div>
    )
}

const mapStateToProps = state => {
  console.log("state in route form", state)
  return{selected_id: state.selected_id,
  vehicles: state.vehicles}
}

export default connect(
  mapStateToProps
)(RoutingForm)
