import {Platform} from 'react-native';
import {getBundleId} from 'react-native-device-info';

const shortCodes = {
  sabroson:'af268c',
};

const appIds = {
  sabroson: Platform.select({
    ios: 'com.sabroson.vendor',
    android: 'com.sabroson.vendorApp',
  }), 
};

// const socialKeys = {
//   TWITTER_COMSUMER_KEY: 'R66DHARfuoYAPowApUxNxwbPi',
//   TWITTER_CONSUMER_SECRET: 'itcicJ7fUV3b73B8V05GEDBo4tzxGox2Si2q0BCk5pue327k15',
// };

export {appIds, shortCodes};
