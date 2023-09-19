import {
  ACCEPT_REJECT_ORDER,
  GET_ALL_ORDERS,
  GET_ALL_VENDOR_ORDERS,
  GET_ORDER_DETAIL,
  GET_RATING_DETAIL,
  GIVE_RATING_REVIEWS,
  GET_VENDOR_REVENUE,
  GET_RETURN_ORDER_DETAIL,
  GET_RETURN_PRODUCT_DETAIL,
  UPLOAD_PRODUCT_IMAGE,
  SUBMIT_RETURN_ORDER,
  MY_PENDING_ORDERS,
  GET_ORDER_DETAIL_FOR_BILLING,
  DISPATCHER_URL,
  CANCEL_ORDER,
  REPEAT_ORDER,
  ACCEPTREJECTDRIVERUPDATE,
  GET_VENDOR_REVENUE_DASHBOARD_DATA,
  GET_VENDOR_PROFILE,
  GET_VENDOR_TRANSACTIONS,
  SOTRE_VENDORS,
  STORE_VENDOR_COUNT,
  ALL_VENDOR_ORDERS,
  GET_ORDER_QRCODE,
  CLEAR_ORDER_FROM_BAG,
  UPDATE_VENDOR_PROFILE,
  ADD_VENDOR_SLOTS,
  DELETE_VENDOR_SLOTS,
  GET_VENDOR_SLOTS,
  UPDATE_VENDOR_SLOTS,
} from '../../config/urls';
import {apiGet, apiPost} from '../../utils/utils';
import store from '../store';
import types from '../types';
const {dispatch} = store;

//Get Order Detail For Billing
export function getOrderDetailForBilling(data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiGet(GET_ORDER_DETAIL_FOR_BILLING + data.order_id, {}, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//Get Cart Detail
export function getOrderDetail(data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiPost(GET_ORDER_DETAIL, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//add delete product from cart
export const getOrderListing = (query = '', data, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiGet(GET_ALL_ORDERS + query, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

///VENDOR ORDERS ACTIONS

//SAVE USER'S LAST SELECTED VENDOR

export const savedSelectedVendor = (data) => {
  dispatch({
    type: types.STORE_SELECTED_VENDOR,
    payload: data,
  });
};

//get all orders of specific vendor
export const _getListOfVendorOrders = (query = '', data, headers = {}) => {
  console.log('query++++ query', query);
  console.log('query++++ data', data);
  console.log('query++++ headers', headers);
  return new Promise((resolve, reject) => {
    apiGet(GET_ALL_VENDOR_ORDERS + query, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//Get Vendor Transactions
export const getVendorTransactions = (query , data, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiPost(GET_VENDOR_TRANSACTIONS + query, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//give order rating
export const giveRating = (data, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiPost(GIVE_RATING_REVIEWS, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//accept Reject order

export const updateOrderStatus = (data, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiPost(ACCEPT_REJECT_ORDER, data, headers)
      .then((res) => {
        console.log('checking update status response>>>', res);
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// get order ratings

export const getRating = (query = '', data = {}, headers = {}) => {
  console.log(query, data, headers, 'IN ORDER>JS');
  return new Promise((resolve, reject) => {
    apiGet(GET_RATING_DETAIL + query, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Get revenue data
export const getRevenueData = (data = {}, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiPost(GET_VENDOR_REVENUE, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Get revenue dashboard data
export const getRevenueDashboardData = (data = {}, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiPost(GET_VENDOR_REVENUE_DASHBOARD_DATA, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Get Vendor Profile
export const getVendorProfile = (data = {}, headers = {}) => {
  return new Promise((resolve, reject) => {
    apiPost(GET_VENDOR_PROFILE, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//Get Cart Detail
export function getOrderDetailPickUp(data = {}, headers = {}) {
  return apiPost(DISPATCHER_URL, data, headers);
}

//Get RETUREN ORDER Detail
export function getReturnOrderDetailData(url = '', data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiGet(GET_RETURN_ORDER_DETAIL + url, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Repeat ORDER
export function repeatOrder(url = '', data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiPost(REPEAT_ORDER, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//Get RETURN PRODUCT Detail
export function getReturnProductrDetailData(url = '', data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiGet(GET_RETURN_PRODUCT_DETAIL + url, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//Upload return order image
export function uploadReturnOrderImage(data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiPost(UPLOAD_PRODUCT_IMAGE, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//Submit return order
export function submitReturnOrder(data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiPost(SUBMIT_RETURN_ORDER, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//Submit return order
export function cancelOrder(data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiPost(CANCEL_ORDER, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function allPendingOrders(query, data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiGet(MY_PENDING_ORDERS + query, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function acceptRejectDriveUpdate(data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiPost(ACCEPTREJECTDRIVERUPDATE, data, headers)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function storeVendors(query, headers = {}) {
  return apiGet(SOTRE_VENDORS + query, {}, headers);
}

export function vendorOrderCount(query, headers = {}) {
  return apiGet(STORE_VENDOR_COUNT + query, {}, headers);
}

export function allVendorOrders(query, headers = {}) {
  return apiGet(ALL_VENDOR_ORDERS + query, {}, headers);
}

export function getOrderByQrScan(query, headers = {}) {
  console.log(query, 'query>>>>query');
  return apiGet(GET_ORDER_QRCODE + query, {}, headers);
}

export function clearBagOrders(query, headers = {}) {
  return apiGet(CLEAR_ORDER_FROM_BAG + query, {}, headers);
}
export function updateVendorProfile(data, headers = {}) {
  return apiPost(UPDATE_VENDOR_PROFILE ,data, headers);
}
export function addVendorSlot(data, headers = {}) {
  return apiPost(ADD_VENDOR_SLOTS ,data, headers);
}
export function deleteVendorSlot(data, headers = {}) {
  return apiPost(DELETE_VENDOR_SLOTS ,data, headers);
}
export function getVendorSlot(query ='',data, headers = {}) {
  return apiGet(GET_VENDOR_SLOTS + query ,data, headers);
}
export function updateVendorSlot(data, headers = {}) {
  return apiPost(UPDATE_VENDOR_SLOTS  ,data, headers);
}
export function saveScannedQrValue(data) {
  dispatch({
    type: types.SCANNED_QR_VALUE,
    payload: data,
  });
}
