import {GET_ALL_CAR_AND_PRICE, PLACE_DELIVERY_ORDER} from '../../config/urls';
import {apiGet, apiPost} from '../../utils/utils';
import store from '../store';
import types from '../types';
const {dispatch} = store;

// save vendor listing and category data

//Get vendor info and Category data
export function getAllCarAndPrices(query = '', data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiPost(GET_ALL_CAR_AND_PRICE + query, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//Get vendor info and Category data
export function placeDelievryOrder(data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiPost(PLACE_DELIVERY_ORDER, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
