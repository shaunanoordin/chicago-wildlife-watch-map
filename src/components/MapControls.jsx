import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { addMapFilterValue, removeMapFilterValue } from '../actions/map';
import MapConfig from '../data/cww-config.json';
import MapSummary from './MapSummary';

class MapControls extends React.Component {
  constructor() {
    super();
  }
  
  render() {
    const htmlSpecies = MapConfig.filters.species.map((item) => {
      const id = item.id;
      const label = item.label;
      const selected = (this.props.species.indexOf(id) >= 0);
      
      return (
        <label key={id} className={(selected) ? 'selected' : ''}>
          <input
            type="checkbox"
            data-value={id}
            onChange={this.selectionChanged.bind(this)}
            checked={selected}
          />
          <span>{label}</span>
        </label>
      );
    });
        
    return (
      <div ref="mapControls" className="map-controls">
        <MapSummary />
        <div className="map-controls-section">
          {htmlSpecies}
        </div>
      </div>
    );
  }
  
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {}
  
  selectionChanged(e) {
    if (e.target.checked) {
      this.props.dispatch(addMapFilterValue('species', e.target.dataset.value));
    } else {
      this.props.dispatch(removeMapFilterValue('species', e.target.dataset.value));
    }    
  }
}

MapControls.propTypes = {
  species: React.PropTypes.array.isRequired,
};
MapControls.defaultProps = { 
  species: [],
};
function mapStateToProps(state, ownProps) {  //Listens for changes in the Redux Store
  return {
    species: state.map.species,
  };
}
export default connect(mapStateToProps)(MapControls);  //Connects the Component to the Redux Store
