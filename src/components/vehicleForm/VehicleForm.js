import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import { addVehicle, updateVehicle } from "../../store/actions";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "./VehicleForm.css"

class VehicleForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      //these specifications are in their own object so that specifications can be sent direvtly to the BE
      //this is the object that will be sent to the BE
      specifications: {
        name: '',
      // height: 0, // value that gets sent to the backend, after combinining heightFeet and heightInches into one unit
       heightFeet: '', // value that stores the user entry of height in feet
       heightInches: '', // value that stores the user entry of height in inches
     //  width: 0, // these 3 width values follow the same structure as height
       widthFeet: '',
       widthInches: '',
    //   length: 0, // these 3 length values follow the same structure as height
       lengthFeet: '', 
       lengthInches: '',
       weight: '',  //this will be sent in pounds? check BE docs
       axel_count: '', //integer, unit implied
       class_name: '', //controlled input of one letter
       //created_at: '', //check BE for format, generate date with js
       dual_tires: false, //Bool, checkbox
       trailer: false,  //Bool, checkbox
      }
    }
  }
  
  componentDidMount(){
    //checks if we are coming from the vehicles tab and therefore if we are editing
    if(this.props.editing){
      //assigns prefill values of previous entry for the form if we are editing
      this.setState({
        specifications: {
          name: this.props.currentVehicle.name,
          heightFeet: Math.floor(this.props.currentVehicle.height),
          heightInches: Math.round((this.props.currentVehicle.height % 1) * 12),
          widthFeet: Math.floor(this.props.currentVehicle.width),
          widthInches: Math.round((this.props.currentVehicle.width % 1) * 12),
          lengthFeet: Math.floor(this.props.currentVehicle.length),
          lengthInches: Math.round((this.props.currentVehicle.length % 1) * 12),
          weight: this.props.currentVehicle.weight,
          vehicle_class: this.props.currentVehicle.vehicle_class,
          axel_count: this.props.currentVehicle.axel_count,         
          dual_tires: this.props.currentVehicle.dual_tires          
        } 
      })
    }
  }

  //handles input of numbers and converts into the right data type of int
  handleChange = (event) => {
    this.setState({
        specifications: {
          ...this.state.specifications,
          [event.target.name]: parseInt(event.target.value)         
        }
    })
  }

  //handles text only input
  handleText = (event) => {
    this.setState({
        specifications: {
          ...this.state.specifications,
          [event.target.name]: event.target.value      
        }
    })
  }

  //assigns state to a value based on whether a box is checked
  handleCheck = (event) => {
    //const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState({
     specifications: {
      ...this.state.specifications,       
      [event.target.name]: event.target.checked
     }
    }) 
  }

  //assigns state to a value based on which radio button has been clicked
  handleRadio = (event) => {
    //const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState({
     specifications: {
      ...this.state.specifications,       
      class_name: event.target.value
     }
    }) 
  }

  //occurs when the submit button is clicked
  //converts inputs from user to correct values to send to the backend, then send them
  vehicleSubmit = (event) => {
    
    event.preventDefault();
    //Google analytics tracking
    window.gtag("event", "create vehicle", {
      event_category: "submit",
      event_label: "create vehicle"
    });
    
    let height = this.combineDistanceUnits(this.state.specifications.heightInches, this.state.specifications.heightFeet);
    let width = this.combineDistanceUnits(this.state.specifications.widthInches, this.state.specifications.widthFeet);
    let length = this.combineDistanceUnits(this.state.specifications.lengthInches, this.state.specifications.lengthFeet);
    let weight =  this.state.specifications.weight;
    let axel_count = this.state.specifications.axel_count;
    let vehicle_class = this.state.specifications.class_name;
    let trailer = this.state.specifications.trailer;
    if(vehicle_class === "Trailer"){
      vehicle_class = "";
      trailer = true;
    }
    if(weight === ""){
      weight = 0;
    } 
    if(axel_count === ""){
      axel_count = 0;
    } 
    //make sure all values entered are sent as the correct data type to the back end
    parseFloat(height);
    parseFloat(length);
    parseFloat(width);
    parseFloat(weight);
    parseInt(axel_count);
    
    //send is the object that is sent to the web backend to be stored
    //it is made using values from the form, some of which are processed and converted before being assigned to the keys here
    let send = {
      name: this.state.specifications.name,
      height: height,
      width: width,
      length: length,
      weight: weight,
      axel_count: axel_count,
      vehicle_class: vehicle_class,
      trailer: trailer,
      dual_tires: this.state.specifications.dual_tires
    }
    console.log("sent", send);
    console.log("id", this.props.id);
    if(this.props.editing){
      this.props.updateVehicle(send, this.props.id);
      this.props.editVehicleToggle(this.props.id);
    } else {
      this.props.addVehicle(send);
      this.props.closeVehicleForm();
    }
    this.setState({
      specifications: {
        name: '',
        heightFeet: '',
        heightInches: '',
        widthFeet: '',
        widthInches: '',
        lengthFeet: '',
        lengthInches: '',
        weight: '',
        axel_count: '',
        class_name: '',
        dual_tires: false,
        trailer: false,
      }
    })
  }


  //combines feet and inch units into feet only, to be sent to the backend
  combineDistanceUnits = (inchesIn, feetIn) => {
    let inches = inchesIn;
    let feet = feetIn;
    if(feet === ""){
      feet = 0;
    } if (inches === ""){
      inches = 0;
    }
    const inchesCombined = feet + (inches / 12);
    return inchesCombined;
  }

  render(){
    // console.log("form props", this.props)
    return(
      <div className='WidgetWrapper'> 
        <div className='vehicle-form-wrap'>
        <div className="vehicle-form" onSubmit={this.vehicleSubmit}>
          <h2>RV WAY</h2>
          <div className='FormContainer'>
            <h6>Back</h6>
            <p id='vehicleAddTitle'>Add a Vehicle</p>
            <h4 className="vehicle-spec">Name (required)</h4>
            <div className='measurements'>
              <input 
                className="vehicle-name"       
                type="string"
                required
                name='name'
                placeholder="The Mystery Machine"
                value={this.state.specifications.name}
                onChange={this.handleText}
              >
              </input>
          </div>
          <div className='measurementsParent'>
            <div className='inputsFieldsContainer'>
              <h4 className="vehicle-spec">Height</h4>
              <div className="form-section">  
                <div className='measurements'>
                  <p>Feet</p>
                  <input        
                    type="number"
                    min="0"
                    max="100"
                    name='heightFeet'
                    placeholder="0"
                    value={this.state.specifications.heightFeet}
                    onChange={this.handleChange}
                  >
                  </input>
                </div>
                <p className="plus">+</p>
                <div className="measurements">
                  <p>Inches</p>
                  <input        
                    type="number"
                    min="0"
                    max="11"
                    name='heightInches'
                    placeholder="0"
                    // this.state.specifications.heighInches === 0 ? undefined :
                    value={ this.state.specifications.heightInches}
                    onChange={this.handleChange}
                  >
                </input>
                </div>
              </div>
            </div>
            <div className='inputsFieldsContainer'>
              <h4 className="vehicle-spec">Width</h4>
              <div className="form-section">
              <div className="measurements">
                <p>Feet</p>
                <input        
                  type="number"
                  min="0"
                  max="100"
                  name='widthFeet'
                  placeholder="0"
                  value={this.state.specifications.widthFeet}
                  onChange={this.handleChange}
                >
              </input>
              </div>
              <p className="plus">+</p>
              <div className="measurements">
              <p>Inches</p>
                <input        
                  type="number"
                  min="0"
                  max="11"
                  name='widthInches'
                  placeholder="0"
                  value={this.state.specifications.widthInches}
                  onChange={this.handleChange}
                >
              </input>
              </div>
              </div>
            </div>
          </div>
          <div className='measurementsParent'>
            <div className='inputsFieldsContainer'>
              <h4 className="vehicle-spec">Length</h4>
               <div className="form-section">
                 <div className='measurements'>
                   <div>
                   <p>Feet</p>
                   <input        
                    type="number"
                    min="0"
                    max="100"
                    name='lengthFeet'
                    placeholder="0"
                    value={this.state.specifications.lengthFeet}
                    onChange={this.handleChange}
                     >
                    </input>
                   </div>
                 </div>
               <p className="plus">+</p>
              
             <div>
                 <p>Inches</p>
                  <input        
                    type="number"
                    min="0"
                    max="11"
                    name='lengthInches'
                    placeholder="0"
                    value={this.state.specifications.lengthInches}
                    onChange={this.handleChange}
                   >
                 </input>
                 </div>
               </div>
            </div>
             <div className='inputsFieldsContainer'>
            <h4 className="vehicle-spec">Weight</h4>
             <div className="form-section">
              <div className='measurements'>
              
                <p>Pounds</p>
                <input        
                  type="number"
                  min="0"
                  max="99000"
                  name='weight'
                  placeholder="0"
                  value={this.state.specifications.weight}
                  onChange={this.handleChange}
                >
                </input>
              </div>
            
            </div>
            </div>
          </div>
          <div className="radio">
          <h4 className="vehicle-spec">Axel Count</h4>
            <div className='thirdRow'>
           
            <div className="form-section">
            <div className='measurements'>
              <div>
                <p>Axels</p>
                <input        
                  type="number"
                  min="0"
                  max="10"
                  name='axel_count'
                  placeholder="0"
                  value={this.state.specifications.axel_count}
                  onChange={this.handleChange}
                >
                </input>
              </div>
            </div>
            </div>
           
            <div className="class-radios">
       <h4 className="vehicle-spec">Class</h4>
         
            <Form.Check name="class"inline label="A" type="radio" id={`inline-text-1`} 
            value="A"
            checked={this.state.specifications.class_name === "A"} onChange={this.handleRadio}
            />
            <Form.Check name="class" inline label="B" type="radio" id={`inline-text-2`} 
            value="B"
            checked={this.state.specifications.class_name === "B"} onChange={this.handleRadio}
            />
            <Form.Check name="class" inline label="C" type="radio" id={`inline-text-2`} 
            value="C"
            checked={this.state.specifications.class_name === "C"} onChange={this.handleRadio}
            />
          </div>
           </div>
          <a target="_blank" rel="noopener noreferrer" href="https://rvs.autotrader.com/articles/buying-a-recreational-vehicle-rv-classes-explained">What class of vehicle do I have?</a>
          </div>
      </div>
      <div className = "tires">
          <p className="vehicle-spec">Tires</p>
          <Form.Check 
          name="dual_tires" 
          type="checkbox"
          checked={this.state.specifications.dual_tires}
          onChange={this.handleCheck}
          label="I have a dual wheel vehicle" 
          id={`inline-text-2`} 
          />
      </div>
          <Button type="submit" variant="warning" onClick={this.vehicleSubmit}>Submit</Button>
          </div>
          </div>
        {/* </div> */}
      </div>
    )
  }

}

const mapStateToProps = state => ({})

export default withRouter(connect(
  mapStateToProps, { addVehicle, updateVehicle }
)(VehicleForm))