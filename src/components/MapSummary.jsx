import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import MapConfig from '../data/cww-config.json';

class MapSummary extends React.Component {
  constructor() {
    super();
  }
  
  render() {
    return (
      <div className="map-controls-summary">
        {this.props.summary}
      </div>
    );
  }
  
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {}
}

MapSummary.propTypes = {
  summary: React.PropTypes.string.isRequired,
};
MapSummary.defaultProps = { 
  summary: '',
};
function mapStateToProps(state, ownProps) {  //Listens for changes in the Redux Store
  return {
    summary: state.map.summary,
  };
}
export default connect(mapStateToProps)(MapSummary);  //Connects the Component to the Redux Store
