import { combineReducers } from 'redux';

import * as login from './login';
import * as map from './map';

const reducers = Object.assign({}, login, map);
export default combineReducers(reducers);
