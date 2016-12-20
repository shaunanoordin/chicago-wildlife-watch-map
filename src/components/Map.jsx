import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import L from 'leaflet';
import MapDatabase from './MapDatabase.js';
import MapControls from './MapControls';
import MapConfig from '../data/cww-config.json';

const IS_IE = 'ActiveXObject' in window;  //IE11 detection

class Map extends React.Component {
  constructor() {
    super();
  }
  
  render() {
    return (
      <div className="map">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.css" />
        <div ref="mapVisuals" className="map-visuals"></div>
        <MapControls />
      </div>
    );
  }
  
  componentDidMount() {
    //Base Layers
    const topographyLayer = L.tileLayer(
      '//{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
      { attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }
    );
    const satelliteLayer = L.tileLayer(
      '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    );
    
    //Leaflet Map
    const myMap = L.map(ReactDOM.findDOMNode(this.refs.mapVisuals), {
      center: [MapConfig.centre.lat, MapConfig.centre.lon],
      zoom: MapConfig.centre.zoom,
      layers: [
        satelliteLayer
      ],
      attributionControl: true,
    });
    
    //Data Layer: Cameras
    const cameraOptions = {
      pointToLayer: (feature, latlng) => {
        const radius = 5 + Math.sqrt(feature.properties.count * 2 / Math.PI);
        const marker = L.circleMarker(latlng, {
          color: '#fff',
          weight: 2,
          fillColor: '#c33',
          fillOpacity: 0.8,
          radius: radius,
        });
        marker.on('click', (e) => {
          console.log(marker.feature.properties);
          let summary = '';
          for (let prop in marker.feature.properties.summary) {
            summary += prop + ' x' + marker.feature.properties.summary[prop] + '\n';
          }
          
          alert('Site: ' + marker.feature.properties.site + '\n' +
                'Count: ' + marker.feature.properties.count + '\n' +
                '--------\n' +
                summary);
        });
        return marker;
      }
    };
    const cameraLayer = L.geoJson(null, cameraOptions);
    cameraLayer.addTo(myMap);
    this.cameraLayer = cameraLayer;
    this.updateCameraLayer();
    
    //Layer Controls
    const baseLayers = {
      'Topography': topographyLayer,
      'Satellite': satelliteLayer,
    };
    const dataLayers = {
      'Cameras': cameraLayer,
    };
    const layerControlsOptions = {
      position: 'topright',
      collapsed: false,
    };
    const layerControls = L.control.layers(baseLayers, dataLayers, layerControlsOptions);
    layerControls.addTo(myMap);
    
    //'Recentre Map' Controls
    const recentreButton = L.control({position: 'topleft'});
    recentreButton.onAdd = (map) => {
      const button = L.DomUtil.create('button', 'btn fa fa-crosshairs');
      button.onclick = () => {
        myMap.setZoom(MapConfig.centre.zoom);
        myMap.panTo([MapConfig.centre.lat, MapConfig.centre.lon]);
      };
      return button;
    };
    recentreButton.addTo(myMap);
  }
  
  componentWillReceiveProps(nextProps) {
    this.updateCameraLayer(nextProps);
  }
  
  updateCameraLayer(props = this.props) {
    console.log('--->', props.species);
    
    //Update the camera layer.
    this.cameraLayer.clearLayers();
    this.cameraLayer.addData(MapDatabase.getGeoJSON(props.species));
  }
}

Map.propTypes = {
  species: React.PropTypes.array.isRequired,
};
Map.defaultProps = { 
  species: [],
};
function mapStateToProps(state, ownProps) {  //Listens for changes in the Redux Store
  return {
    species: state.map.species,
  };
}
export default connect(mapStateToProps)(Map);  //Connects the Component to the Redux Store
