import React from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
const gorongosaGeoJSON = require('./gorongosa.json');
const vegetationGeoJSON = require('./vegetation.json');
import CameraDatabase from './camera-database.js';

//const data = require('../data/cww-species.csv');
//const dataFilepath = require('../data/sample.csv');
//import * as Papa from 'papaparse';
import {taffy} from 'taffydb';
const dataJson = require('../data/cww-species.json');

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
    console.log('-'.repeat(80));
    const xyz = taffy(dataJson);
    console.log('First Bird:\n', xyz({ 'species': 'BRD' }).first());
    console.log('Species:\n', xyz().distinct('species'));
    
    
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
      center: [-18.8, 34.5],
      zoom: 10,
      layers: [
        topographyLayer
      ],
      attributionControl: true,
    });
    
    //Data Layer: Vegetation/Biomes
    const vegetationOptions = {
      style: (feature) => {
        const baseStyle = {
          color: '#000',
          opacity: 0,
          fillOpacity: 0.5,
          clickable: true,
          pointer: 'cursor',
          weight: 0,
        };
        
        const featureName = feature.properties.NAME;
        const specificStyles = {
          'Miombo Woodland': { color: '#063' },
          'Mixed Savanna and Woodland': { color: '#693' },
          'Floodplain Grassland': { color: '#3c9' },
          'Limestone Gorges': { color: '#cc0' },
          'Montane Woodland': { color: '#c3c' },
          'Montane Forest': { color: '#606' },
          'Montane Grassland': { color: '#30c' },
          'Lake Urema': { color: '#0ff' },
          'Inselberg': { color: '#f30' },
        };
        
        return (specificStyles[featureName])
          ? Object.assign(baseStyle, specificStyles[featureName])
          : baseStyle;
      },
      
      onEachFeature: (feature, layer) => {
        layer.on('click', (e) => {
          alert('Vegetation/Biome: ' + feature.properties.NAME);
        });
      }
    };
    const vegetationLayer = L.geoJson(vegetationGeoJSON, vegetationOptions);
    vegetationLayer.addTo(myMap);
    
    //Data Layer: Gorongosa National Park Borders
    const gorongosaOptions = {
      style: {
        color: '#fc3',
        opacity: 1,
        fillOpacity: 0,
        clickable: false,
        weight: 2
      }
    };
    const gorongosaLayer = L.geoJson(gorongosaGeoJSON, gorongosaOptions);
    gorongosaLayer.addTo(myMap);
    
    //Data Layer: Cameras
    const cameraOptions = {
      pointToLayer: (feature, latlng) => {
        const vegetationColours = {
          'Limestone Gorge': '#903',
          'Floodplain Grassland': '#06c',
          'Miombo Woodland': '#f66',
          'Mixed Savanna and Woodland': '#c93',
        };
        const marker = L.circleMarker(latlng, {
          color: '#fff',
          weight: 2,
          fillColor: vegetationColours[feature.properties.veg_type],
          fillOpacity: 0.8,
          radius: 6,
        });
        marker.on('click', (e) => {
          alert(
            'Marker: ' + marker.feature.properties.id + '\n' +
            'Biome: ' + marker.feature.properties.veg_type + '\n' +
            'Humans: ' + marker.feature.properties.human_type + ' (' + marker.feature.properties.dist_humans_m + 'm away) \n' +
            'Water: ' + marker.feature.properties.water_type + ' (' + marker.feature.properties.dist_water_m + 'm away)'
          );
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
      'Satellite': satelliteLayer,
      'Topography': topographyLayer,
    };
    const dataLayers = {
      'Cameras': cameraLayer,
      'Gorongosa National Park': gorongosaLayer,
      'Vegetation/Biomes': vegetationLayer,
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
        myMap.setZoom(10);
        myMap.panTo([-18.8, 34.5]);
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
            <span>Limestone Gorge</span>
          </label>
          <label>
            <input
              type="checkbox" onChange={this.updateCameraLayer.bind(this)}
              ref="camera_floodplain"
              checked={this.state.camera_floodplain} />
            <span>Floodplain Grassland</span>
          </label>
          <label>
            <input
              type="checkbox" onChange={this.updateCameraLayer.bind(this)}
              ref="camera_miombo"
              checked={this.state.camera_miombo} />
            <span>Miombo Woodland</span>
          </label>
          <label>
            <input
              type="checkbox" onChange={this.updateCameraLayer.bind(this)}
              ref="camera_savanna"
              checked={this.state.camera_savanna} />
            <span>Mixed Savanna and Woodland</span>
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
    this.cameraLayer.addData(CameraDatabase.getGeoJSON(camera_limestone, camera_floodplain, camera_miombo, camera_savanna));
    
    //Update State and make the component re-render.
    this.setState({
      camera_limestone,
      camera_floodplain,
      camera_miombo,
      camera_savanna,
    });
  }
}
