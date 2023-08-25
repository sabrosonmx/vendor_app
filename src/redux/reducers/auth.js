import types from '../types';

const initial_state = {
  userData: {},
  profileAddress:{}
};

export default function (state = initial_state, action) {
  switch (action.type) {
    case types.LOGIN: {
      const data = action.payload;
      console.log(data,'this login data')
      return {userData: data};
    }
    case types.USER_LOGOUT: {
      const data = action.payload;
      return {userData: undefined};
    }
    // case types.PROFILE_ADDRESS: {
    //   const data = action.payload;
    //   console.log(data,'yaha')
    //   return {
    //     ...state,
    //     profileAddress: data
    //   };
    // }
    default: {
      return {...state};
    }
  }
}
