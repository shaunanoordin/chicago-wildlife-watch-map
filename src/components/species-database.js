const data = require('../data/cww-species.json');

export default class SpeciesDatabase {
  static getGeoJSON() {
    const output = {
      type: 'FeatureCollection',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: data
        .filter((item) => {
          const valid = true;
          return valid;
        })
        .map((item) => {
          const coords = convertUTMtoLatLon(item.northing, item.easting);
          const lat = (coords.lat && !isNaN(coords.lat)) ? coords.lat : 0;
          const lon = (coords.lon && !isNaN(coords.lon)) ? coords.lon : 0;
          
          if (lat === 0 && lon === 0) {
            console.log('PROBLEM:', item);
          }
          
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lon, lat]  //I thought it was supposed to be lat-lon, but apparently lon-lat is correct here. Weird.
            },
            properties: {
              id: item.id,
            }
          }
        })
    };
    return output;
  }
}

const CHICAGO_UTM_ZONE = 16;  //We only need to worry about Chicago for the time being. https://en.wikipedia.org/wiki/Universal_Transverse_Mercator_coordinate_system
const UTM_SCALE_FACTOR = 0.9996;
const SM_A = 6378137.0;
const SM_B = 6356752.314;

function convertUTMtoLatLon(northing, easting) {
  const x = (easting - 500000) / UTM_SCALE_FACTOR;
  const y = northing / UTM_SCALE_FACTOR;  
  const centralMeridian = getUTMCentralMeridian(CHICAGO_UTM_ZONE);
  
  const phif = getFootpointLatitude(y);
  const ep2 = (Math.pow(SM_A, 2.0) - Math.pow(SM_B, 2.0)) / Math.pow(SM_B, 2.0);
  const cf = Math.cos(phif);
  const nuf2 = ep2 * Math.pow(cf, 2.0);
  const Nf = Math.pow(SM_A, 2.0) / (SM_B * Math.sqrt(1 + nuf2));
  let Nfpow = Nf;

  const tf = Math.tan(phif);
  const tf2 = tf * tf;
  const tf4 = tf2 * tf2;
  const x1frac = 1.0 / (Nfpow * cf);
  Nfpow *= Nf;
  const x2frac = tf / (2.0 * Nfpow);
  Nfpow *= Nf;
  const x3frac = 1.0 / (6.0 * Nfpow * cf);
  Nfpow *= Nf;
  const x4frac = tf / (24.0 * Nfpow);
  Nfpow *= Nf;
  const x5frac = 1.0 / (120.0 * Nfpow * cf);
  Nfpow *= Nf;
  const x6frac = tf / (720.0 * Nfpow);
  Nfpow *= Nf;
  const x7frac = 1.0 / (5040.0 * Nfpow * cf);
  Nfpow *= Nf;
  const x8frac = tf / (40320.0 * Nfpow);
  const x2poly = -1.0 - nuf2;
  const x3poly = -1.0 - 2 * tf2 - nuf2;
  const x4poly = 5.0 + 3.0 * tf2 + 6.0 * nuf2 - 6.0 * tf2 * nuf2 - 3.0 * (nuf2 *nuf2) - 9.0 * tf2 * (nuf2 * nuf2);
  const x5poly = 5.0 + 28.0 * tf2 + 24.0 * tf4 + 6.0 * nuf2 + 8.0 * tf2 * nuf2;
  const x6poly = -61.0 - 90.0 * tf2 - 45.0 * tf4 - 107.0 * nuf2 + 162.0 * tf2 * nuf2;
  const x7poly = -61.0 - 662.0 * tf2 - 1320.0 * tf4 - 720.0 * (tf4 * tf2);
  const x8poly = 1385.0 + 3633.0 * tf2 + 4095.0 * tf4 + 1575 * (tf4 * tf2);

  let coordinates = { lat: 0, lon: 0 };
  
  coordinates.lat = phif + x2frac * x2poly * (x * x) +
    x4frac * x4poly * Math.pow(x, 4.0) +
    x6frac * x6poly * Math.pow(x, 6.0) +
    x8frac * x8poly * Math.pow(x, 8.0);

  coordinates.lon = centralMeridian + x1frac * x +
    x3frac * x3poly * Math.pow(x, 3.0) +
    x5frac * x5poly * Math.pow(x, 5.0) +
    x7frac * x7poly * Math.pow(x, 7.0);
  
  //Rad to Degrees
  coordinates.lat = coordinates.lat * 180 / Math.PI;
  coordinates.lon = coordinates.lon * 180 / Math.PI;
  
  return coordinates;
}


function getUTMCentralMeridian(zone) {
  return (zone * 6 - 183) / 180 * Math.PI;  //Radians
}

function getFootpointLatitude(y) {
  const n = (SM_A - SM_B) / (SM_A + SM_B);
  const alpha_ = ((SM_A + SM_B) / 2.0) * (1 + (Math.pow(n, 2.0) / 4) + (Math.pow(n, 4.0) / 64));
  const y_ = y / alpha_;
  const beta_ = (3.0 * n / 2.0) + (-27.0 * Math.pow(n, 3.0) / 32.0) + (269.0 * Math.pow(n, 5.0) / 512.0);
  const gamma_ = (21.0 * Math.pow(n, 2.0) / 16.0) + (-55.0 * Math.pow(n, 4.0) / 32.0);
  const delta_ = (151.0 * Math.pow(n, 3.0) / 96.0) + (-417.0 * Math.pow(n, 5.0) / 128.0);
  const epsilon_ = (1097.0 * Math.pow(n, 4.0) / 512.0);

  return y_ +
    (beta_ * Math.sin(2.0 * y_)) +
    (gamma_ * Math.sin(4.0 * y_)) +
    (delta_ * Math.sin(6.0 * y_)) +
    (epsilon_ * Math.sin(8.0 * y_));
}
