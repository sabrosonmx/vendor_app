import types from '../types';

const initial_state = {
    pendingNotifications: [],
    isVendorNotification: false,
    newVendorOrder:null
};

export default function (state = initial_state, action) {
    switch (action.type) {
        case types.PENDING_NOTIFICATIONS: {
            const data = action.payload;
            return {
                ...state,
                pendingNotifications: data,
            };
        }
        case types.IS_VENDOR_NOTIFICATIONS: {
            const data = action.payload;
            return {
                ...state,
                isVendorNotification: data,
            };
        }
        case types.NEW_VENDOR_ODRER: {
            const data = action.payload;
            return {
                ...state,
                newVendorOrder: data,
            };
        }
        default: {
            return { ...state };
        }
    }
}
