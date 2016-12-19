import React from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import MapDatabase from './MapDatabase.js';
import MapConfig from '../data/cww-config.json';


const IS_IE = 'ActiveXObject' in window;  //IE11 detection

export default class Map extends React.Component {
  constructor() {
    super();
    this.state = {
      camera_limestone: true,
      camera_floodplain: true,
      camera_miombo: true,
      camera_savanna: true,
    };
  }
  
  componentDidMount() {
    console.log('componentDidMount(): creating map.');
    
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
          alert('Site: ' + marker.feature.properties.site + '\n' +
                'Count: ' + marker.feature.properties.count);
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
  
  render() {
    console.log('render()');
    return (
      <div className="map">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.css" />
        <div ref="mapVisuals" className="map-visuals"></div>
        <div ref="mapControls" className="map-controls">
          <label>
            <input
              type="checkbox" onChange={this.updateCameraLayer.bind(this)}
              ref="camera_limestone"
              checked={this.state.camera_limestone} />
            <span>Controls</span>
          </label>
          <label>
            <input
              type="checkbox" onChange={this.updateCameraLayer.bind(this)}
              ref="camera_floodplain"
              checked={this.state.camera_floodplain} />
            <span>to</span>
          </label>
          <label>
            <input
              type="checkbox" onChange={this.updateCameraLayer.bind(this)}
              ref="camera_miombo"
              checked={this.state.camera_miombo} />
            <span>be</span>
          </label>
          <label>
            <input
              type="checkbox" onChange={this.updateCameraLayer.bind(this)}
              ref="camera_savanna"
              checked={this.state.camera_savanna} />
            <span>added</span>
          </label>
        </div>
      </div>
    );
  }
  
  updateCameraLayer() {
    const camera_limestone = this.refs.camera_limestone.checked;
    const camera_floodplain = this.refs.camera_floodplain.checked;
    const camera_miombo = this.refs.camera_miombo.checked;
    const camera_savanna = this.refs.camera_savanna.checked;
    
    //Update the camera layer.
    this.cameraLayer.clearLayers();
    //this.cameraLayer.addData(CameraDatabase.getGeoJSON(camera_limestone, camera_floodplain, camera_miombo, camera_savanna));
    this.cameraLayer.addData(MapDatabase.getGeoJSON());
    
    //Update State and make the component re-render.
    this.setState({
      camera_limestone,
      camera_floodplain,
      camera_miombo,
      camera_savanna,
    });
  }
}
