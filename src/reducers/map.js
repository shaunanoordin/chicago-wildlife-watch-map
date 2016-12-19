import * as types from '../constants/actionTypes';
export const initialState = {
  species: [],
};

export function map(state = initialState, action) {
  switch (action.type) {
    case 'ADD_MAP_FILTER_VALUE':
      const addedData = {};
      if (Array.isArray(state[action.key])) {
        let newVal = state[action.key].slice();
        if (!newVal.includes(action.val)) {
          newVal.push(action.val);
        }
        addedData[action.key] = newVal;
      } else {
        addedData[action.key] = action.val;
      }
      return Object.assign({}, state, addedData);
    
    case 'REMOVE_MAP_FILTER_VALUE':
      const removedData = {};
      if (Array.isArray(state[action.key])) {
        removedData[action.key] = state[action.key].filter(ele => {
            return ele !== action.val
          });
      } else {
        removedData[action.key] = '';
      }
      return Object.assign({}, state, removedData);
    
    default:
      return state;
  }
}
