import types from '../types';

const initial_state = {
  storeSelectedVendor: {},
  scannedQrValue: '',
};

export default function (state = initial_state, action) {
  switch (action.type) {
    case types.STORE_SELECTED_VENDOR: {
      const data = action.payload;
      console.log(data, 'thi sis api');
      return {
        ...state,
        storeSelectedVendor: data,
      };
    }

    case types.SCANNED_QR_VALUE: {
      return {
        ...state,
        scannedQrValue: action.payload,
      };
    }

    default: {
      return {...state};
    }
  }
}
