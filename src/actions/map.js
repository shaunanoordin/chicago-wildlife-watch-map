export function addMapFilterValue(key, val) {
  return (dispatch) => {
    dispatch({
      type: 'ADD_MAP_FILTER_VALUE',
      key, val
    });
  };
}

export function removeMapFilterValue(key, val) {
  return (dispatch) => {
    dispatch({
      type: 'REMOVE_MAP_FILTER_VALUE',
      key, val
    });
  };
}
