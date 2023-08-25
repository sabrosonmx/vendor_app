import {useNavigation} from '@react-navigation/native';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import strings from '../constants/lang';
import {showError} from './helperFunctions';
import {openAppSetting} from './openNativeApp';

export const androidCameraPermission = () =>
  new Promise(async (resolve, reject) => {
    try {
      if (Platform.OS === 'android' && Platform.Version > 22) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        console.log(granted, 'the granted value');

        if (
          granted['android.permission.CAMERA'] !== 'granted' ||
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] !== 'granted' ||
          granted['android.permission.READ_EXTERNAL_STORAGE'] !== 'granted'
        ) {
          Alert.alert(
            strings.ALERT,
            strings.CAMERA_PERMISSION_DENIED_MSG,
            [{text: strings.OK}],
            {cancelable: true},
          );
          return resolve(false);
          // alert(strings.DO_NOT_HAVE_PERMISSIONS_TO_SELECT_IMAGE);
        }
        return resolve(true);
      }

      return resolve(true);
    } catch (error) {
      return resolve(false);
    }
  });

// export const locationPermission = () => {
//   if (Platform.OS === 'android' && Platform.Version > 22) {
//     return PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//     );
//   }

//   return Promise.resolve('granted');
// };

export const locationPermission = () =>
  new Promise(async (resolve, reject) => {
    if (Platform.OS === 'ios') {
      try {
        const permissionStatus = await Geolocation.requestAuthorization(
          'whenInUse',
        );
        if (permissionStatus === 'granted') {
          return resolve('granted');
        }
        reject('Permission not granted');
      } catch (error) {
        return reject(error);
      }
    } else {
      return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      )
        .then((granted) => {
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //console.log('You can use the location');
            return resolve('granted');
          }
          //console.log('Location permission denied');
          else {
            return reject('Location permission denied');
          }
        })
        .catch((error) => {
          console.log('Ask Location permission error: ', error);
          return reject(error);
        });
    }
  });

export const chekLocationPermission = (showAlert = true) =>
  new Promise(async (resolve, reject) => {
    try {
      check(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      )
        .then((result) => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              showError(strings.LOCATION_UNAVAILABLE);
              break;
            case RESULTS.DENIED:
              request(
                Platform.OS === 'ios'
                  ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                  : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
              )
                .then((result) => {
                  return resolve(result);
                })
                .catch((error) => {
                  return reject(error);
                });

              break;
            case RESULTS.LIMITED:
              showError(strings.LOCATION_LIMITED);
              break;
            case RESULTS.GRANTED:
              return resolve(result);
            case RESULTS.BLOCKED:
              if (showAlert) {
                Alert.alert('', strings.LOCATION_DISABLED_MSG, [
                  {
                    text: strings.CANCEL,
                    onPress: () => resolve('goback'),
                  },
                  {
                    text: strings.CONFIRM,
                    onPress: () => {
                      const locationPath = 'LOCATION_SERVICES';
                      openAppSetting(locationPath);
                    },
                  },
                ]);
              }
              return resolve(result);
          }
        })
        .catch((error) => {
          return reject(error);
        });
    } catch (error) {
      return reject(error);
    }
  });

export const checkContactPermission = () => {
  return new Promise(async (resolve, reject) => {
    try {
      check(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CONTACTS
          : PERMISSIONS.ANDROID.READ_CONTACTS,
      )
        .then((result) => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              showError(strings.LOCATION_UNAVAILABLE);
              break;
            case RESULTS.DENIED:
              request(
                Platform.OS === 'ios'
                  ? PERMISSIONS.IOS.CONTACTS
                  : PERMISSIONS.ANDROID.READ_CONTACTS,
              )
                .then((result) => {
                  return reject(result);
                })
                .catch((error) => {
                  return reject(error);
                });

              break;
            case RESULTS.LIMITED:
              showError('The permission is limited: some actions are possible');
              break;
            case RESULTS.GRANTED:
              return resolve(result);
            case RESULTS.BLOCKED:
              Alert.alert('', 'Contact permission permanantly disabled!!', [
                {
                  text: strings.CANCEL,
                  onPress: () => console.log('Cancle pressed'),
                },
                {
                  text: strings.CONFIRM,
                  onPress: () => {
                    // const locationPath = 'LOCATION_SERVICES';
                    // openAppSetting(locationPath);
                    console.log('Confirm pressed');
                  },
                },
              ]);

              return reject(result);
          }
        })
        .catch((error) => {
          return reject(error);
        });
    } catch (error) {
      return reject(error);
    }
  });
};
