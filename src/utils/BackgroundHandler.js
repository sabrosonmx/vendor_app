import notifee from '@notifee/react-native';

export async function onBackgroundNotification(remoteMessage) {
    // const { data, messageId, notification } = remoteMessage;

    // console.log(data, messageId, notification, "background notification payload >>>>");

    console.log('ondisplaynotification');
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'sound-channel-id',
        name: 'Default Channel',
        sound: 'notification',
        vibration: true,
        vibrationPattern: [300, 500],
      });
    
    console.log('sound playing');

    await notifee.displayNotification({
        title: 'Notification Title',
        body: 'Main body content of the notification',
        android: {
          sound: 'sound-channel-id',
          vibration: true,
          vibrationPattern: [300, 500],

          channelId,
          //   smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      });


    //    creating custom channels  below ********************

    // const channelId = await notifee.createChannel({
    //     id: notification?.android?.channelId || 'default',
    //     name: 'Default Channel',
    //     vibration: true,
    //     lightColor: AndroidColor.YELLOW,
    //     sound: notification?.android?.sound || 'customnotii',
    //     importance: AndroidImportance.HIGH,

    // });

    //  creating display notification 

    // let displayNotificationData = {};

    // if (!!data?.fcm_options?.image || !!notification?.android?.imageUrl) {
    //     if (Platform.OS == 'ios') {
    //         console.log('hello');
    //         displayNotificationData = {
    //             title: data?.title || notification?.title || '',
    //             body: data?.body || notification?.body || '',
    //             ios: {
    //                 attachments: [
    //                     {
    //                         // Remote image
    //                         url: data?.fcm_options?.image,
    //                     },
    //                 ],
    //             },
    //             data: { ...data },
    //         };
    //     } else {

    //         displayNotificationData = {
    //             title: data?.title || notification?.title || '',
    //             body: data?.body || notification?.body || '',
    //             android: {
    //                 sound: notification?.android?.sound || 'customnotii',
    //                 channelId,
    //                 pressAction: {
    //                     id: 'default',
    //                 },
    //                 importance: AndroidImportance.HIGH,
    //                 style: {
    //                     type: AndroidStyle.BIGPICTURE,
    //                     picture: notification?.android?.imageUrl,
    //                 },
    //             },
    //             ios: {
    //                 sound: 'notification.wav',
    //             },

    //             data: { ...data },
    //         };
    //     }
    // } else {

    //     displayNotificationData = {
    //         title: data?.title || notification?.title || '',
    //         body: data?.body || notification?.body || '',
    //         android: {
    //             sound: notification?.android?.sound || 'customnotii',
    //             channelId,
    //             pressAction: {
    //                 id: 'default',
    //             },
    //             importance: AndroidImportance.HIGH
    //         },
    //         ios: {
    //             sound: 'notification.wav',
    //         },
    //         data: { ...data },
    //     };
    // }
    // await notifee.displayNotification(displayNotificationData);    
}