import store from '../store';
import types from '../types';
const { dispatch } = store;

export function pendingNotifications(data = []) {
    console.log(data, 'data');
    dispatch({
        type: types.PENDING_NOTIFICATIONS,
        payload: data,
    });
}

export function isVendorNotification(data = false) {
    console.log(data, 'data');
    dispatch({
        type: types.IS_VENDOR_NOTIFICATIONS,
        payload: data,
    });
}

export function newVendorOrder (data) {
    dispatch({
        type: types.NEW_VENDOR_ODRER,
        payload: data,
    });
}