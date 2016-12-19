import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { addMapFilterValue, removeMapFilterValue } from '../actions/map';

class MapControls extends React.Component {
  constructor() {
    super();
  }
  
  render() {
    const SPECIES = ['ABC', 'DEF', 'GHI'];
    const htmlSpecies = SPECIES.map((item) => {
      return (
        <label key={item}>
          <input
            type="checkbox"
            data-value={item}
            onChange={this.selectionChanged.bind(this)}
            checked={this.props.species.indexOf(item) >= 0}
          />
          <span>{item}</span>
        </label>
      );
    });
    
    
    return (
      <div ref="mapControls" className="map-controls">
        {htmlSpecies}
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
