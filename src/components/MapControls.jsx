import React from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import SpeciesDatabase from './SpeciesDatabase.js';

const IS_IE = 'ActiveXObject' in window;  //IE11 detection

export default class MapControls extends React.Component {
  constructor() {
    super();
  }
  
  componentDidMount() {}
  
  render() {
    return (
      <div ref="mapControls" className="map-controls">
        <label>
          <input
            type="checkbox" onChange={this.updateSelection.bind(this)}
            ref="camera_savanna"
            checked={false} />
          <span>added</span>
        </label>
      </div>
    );
  }
  
  updateSelection() {
  }
}
