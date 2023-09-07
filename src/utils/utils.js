import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {resetStackAndNavigate} from '../navigation/NavigationService';
import navigationStrings from '../navigation/navigationStrings';
import {enums} from './enums';
import {sessionHandler} from './helperFunctions';

export async function getHeaders() {
  let userData = await AsyncStorage.getItem('userData');
  if (userData) {
    userData = JSON.parse(userData);
    return {
      authorization: `${userData.auth_token}`,
    };
  }
  return {};
}

export function setUserData(data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem('userData', data);
}

//Save wallet info

export function setWalletData(data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem('walletData', data);
}

export function setAppData(data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem('appData', data);
}

export function saveUserAddress(data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem('saveUserAddress', data);
}

export function saveSelectedAddress(data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem('saveSelectedAddress', data);
}

export function saveShortCodeData(data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem('saveShortCode', data);
}

export function setItem(key, data) {
  data = JSON.stringify(data);
  return AsyncStorage.setItem(key, data);
}

export function getItem(key) {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(key).then((data) => {
      resolve(JSON.parse(data));
    });
  });
}

export function removeItem(key) {
  return AsyncStorage.removeItem(key);
}

export function clearAsyncStorate(key) {
  return AsyncStorage.clear();
}

export async function getUserData() {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem('userData').then((data) => {
      resolve(JSON.parse(data));
    });
  });
}

export async function getAppData() {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem('appData').then((data) => {
      resolve(JSON.parse(data));
    });
  });
}

export async function clearUserData() {
  return AsyncStorage.removeItem('userData');
}

export async function apiReq(
  endPoint,
  data,
  method,
  headers,
  requestOptions = {},
) {
  console.log(endPoint, 'endPoint');
  console.log(data, 'data>>>>>>>>>>>');
  return new Promise(async (res, rej) => {
    const getTokenHeader = await getHeaders();

    headers = {
      ...getTokenHeader,
      ...headers,
    };

    if (method === 'get' || method === 'delete') {
      data = {
        ...requestOptions,
        ...data,
        headers,
      };
    }
    console.log('check data in api generator>>>', headers);
    //
    axios[method](endPoint, data, {headers})
      .then((result) => {
        console.log(result, 'result>result');
        const {data} = result;

        if (data.status === false) {
          return rej(data);
        }

        return res(data);
      })
      .catch((error) => {
        console.log(error, 'error>error');
        if (error && error.response && error.response.status === 401) {
          sessionHandler(error.response.data.message);
          return rej(error);
        }
        if (error && error.response && error.response.data) {
          if (!error.response.data.error) {
            return rej({
              ...error.response.data,
              error: error.response.data.error || 'Network Error',
            });
          }
          return rej(error.response.data);
        } else {
          return rej({error: 'Network Error', message: 'Network Error'});
        }
        return rej(error);
      });
  });
}

export function apiPost(endPoint, data, headers = {}) {
  return apiReq(endPoint, data, 'post', headers);
}

export function apiDelete(endPoint, data, headers = {}) {
  return apiReq(endPoint, data, 'delete', headers);
}

export function apiGet(endPoint, data, headers = {}, requestOptions) {
  return apiReq(endPoint, data, 'get', headers, requestOptions);
}

export function apiPut(endPoint, data, headers = {}) {
  return apiReq(endPoint, data, 'put', headers);
}

export function randomString(len = 5) {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export const verticalAnimation = {
  gestureDirection: 'vertical',
  headerShown: false,
  cardStyleInterpolator: ({current, layouts}) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    };
  },
};

export const checkIsAdmin = (navigation_, navigation, userData) => {
  // navigation.push(navigationStrings.TABROUTESVENDOR);
  if (userData.is_admin && enums.isVendorStandloneApp) {
    // resetStackAndNavigate(navigation_, navigationStrings.TABROUTESVENDORNEW);
    navigation.push(navigationStrings.TABROUTESVENDORNEW);
  } else {
    navigation.push(navigationStrings.TAB_ROUTES);
  }
};
