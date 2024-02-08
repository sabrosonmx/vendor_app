import 'react-native-gesture-handler';
import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
console.disableYellowBox = true;
import messaging from '@react-native-firebase/messaging';
import {StartPrinting} from './src/Screens/PrinterConnection/PrinteFunc';
import actions from './src/redux/actions';
import { navigate } from './src/navigation/NavigationService';

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const {data, notification} = remoteMessage;
  console.log("received in background messages",remoteMessage)

  if (!!data?.room_id) {
    navigate(navigationStrings.CHAT_SCREEN, {
      data: {_id: data?.room_id, room_id: data?.room_id_text},
    });
  }
  if (
    Platform.OS == 'android' &&
    notification.android.sound == 'notification'
  ) {
    let _data = JSON.parse(data.data);
    if (_data.vendors[0].vendor.auto_accept_order == 1) {
      StartPrinting(_data);
    } else {
      actions.isVendorNotification(true);
    }
  }
});
messaging().getInitialNotification(async (remoteMessage) => {
  const {data, notification} = remoteMessage;
  console.log(data,"data in quit modee")
  if (
    Platform.OS == 'android' &&
    notification.android.sound == 'notification'
  ) {
    let _data = JSON.parse(data.data);
    if (_data.vendors[0].vendor.auto_accept_order == 1) {
      StartPrinting(_data);
    } else {
      actions.isVendorNotification(true);
    }
  }
});
AppRegistry.registerComponent(appName, () => App);
