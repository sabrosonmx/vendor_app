import { AGENT_CHAT, ALL_ROOM_USER, ALL_ROOM_VENDOR, API_BASE_URL, GET_ALL_MESSAGES, SEND_MESSAGE, SEND_NOTIFCATION, START_CHAT, USER_CHAT, VENDOR_CHAT } from "../../config/urls";
import { apiGet, apiPost, getItem } from "../../utils/utils";

export function onStartChat(data = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    apiPost(START_CHAT, data, headers)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}



export function fetchUserChat(data = {}, headers = {}) {
  return new Promise(async(resolve, reject) => {
    const getAppData = await getItem('appData');
    console.log("getAppDatagetAppData",getAppData)
    const socketUrl = getAppData?.appData?.profile?.socket_url

    apiPost(socketUrl + USER_CHAT, data, headers)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function fetchVendorChat(data = {}, headers = {}) {
  return new Promise(async(resolve, reject) => {
    const getAppData = await getItem('appData');
    console.log("getAppDatagetAppData",getAppData)
    const socketUrl = getAppData?.appData?.profile?.socket_url

    apiPost(socketUrl + USER_CHAT, data, headers)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function fetchVendorChatRoom(data = {}, headers = {}) {
  return new Promise(async(resolve, reject) => {
    const getAppData = await getItem('appData');
    // const socketUrl = getAppData?.appData?.profile?.socket_url
    apiPost(API_BASE_URL + ALL_ROOM_VENDOR, data, headers)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function fetchAgentChat(data = {}, headers = {}) {
  return new Promise(async(resolve, reject) => {
    const getAppData = await getItem('appData');
    const socketUrl = getAppData?.appData?.profile?.socket_url
    console.log("getAppDatagetAppData",getAppData)
    
    apiPost(socketUrl + AGENT_CHAT, data, headers)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function sendMessage(data = {}, headers = {}) {
  return new Promise(async(resolve, reject) => {
    const getAppData = await getItem('appData');
    const socketUrl = getAppData?.appData?.profile?.socket_url

    apiPost(socketUrl + SEND_MESSAGE, data, headers)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}


export function getAllMessages(query = '', data = {}, headers = {}) {
  return new Promise(async (resolve, reject) => {
    const getAppData = await getItem('appData');
    const socketUrl = getAppData?.appData?.profile?.socket_url

    apiGet(socketUrl + GET_ALL_MESSAGES + query, data, headers)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function getAllRoomUser(query = '', data = {}, headers = {}) {
  return new Promise(async (resolve, reject) => {
    const getAppData = await getItem('appData');
    const socketUrl = getAppData?.appData?.profile?.socket_url

    apiGet(socketUrl + ALL_ROOM_USER + query, data, headers)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function sendNotification(data = {}, headers = {}) {
  return new Promise(async(resolve, reject) => {
    apiPost(SEND_NOTIFCATION, data, headers)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

