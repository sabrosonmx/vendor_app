import { Keyboard } from 'react-native';
import { openCamera, openPicker } from './imagePicker';
import { isEmpty } from 'lodash';
const cameraHandler = async (data, option) => {
  Keyboard.dismiss();
  //this condition use for open camera
  if (data == 0) {
    let options = {
      ...option,
    };
    try {
      const res = await openCamera(options);
      if (res) {
        return res;
      }
    } catch (err) {
      console.log(err, 'err');
    }
  }
  //this condition use for open gallery
  else if (data == 1) {
    let options = {
      width: 300,
      height: 400,
      cropping: true,
      compressImageQuality: 0.5,
      cropperCircleOverlay: true,
      ...option,
    };
    console.log(options, 'odfsdfsdfsdfsdfsf');
    try {
      const res = await openPicker(options);
      // if (res && (res.sourceURL || res.path)) {
      //   // return Platform.OS == 'ios' ? res.data : res.path;
      //   return res
      // }
      if (res) {
        return res;
      }
    } catch (err) {
      console.log(err, 'err');
    }
  } else {
    return null;
  }
};

const currencyNumberFormatter = (item) => {
  let unformateAmount = item;
  return parseFloat(unformateAmount)
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

export function getImageUrl(url1, url2, dimentions) {
  // console.log(`${url1}${dimentions}${url2}`, "Url")
  return `${url1}${dimentions}${url2}`;
}

export const ifDataExist = (data) => {
  if(data && data !== null){
    return true
  }
  return false
}

export const getValuebyKeyInArray = (key = '', data) => {
  if (!isEmpty(data)) {
    let obj = data?.find((o) => o?.key_name === key);
    if (obj?.key_value != 0) {
      return obj?.key_value;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};

export const tokenConverterPlusCurrencyNumberFormater = (
  price = 0,
  digitAfterDecimal = 0,
  additionalPreferences = {},
  currencySymbol = '',
) => {
  if (getValuebyKeyInArray('is_token_currency_enable', additionalPreferences)) {
    let tokenCurrency = getValuebyKeyInArray(
      'token_currency',
      additionalPreferences,
    );

    // let tokenCurrency = 2;
    return currencyNumberFormatter(
      Number(price) * tokenCurrency,
      digitAfterDecimal,
    );
  } else {
    return `${currencySymbol} ${currencyNumberFormatter(
      Number(price),
      digitAfterDecimal,
    )}`;
  }
};


export {cameraHandler, currencyNumberFormatter};
