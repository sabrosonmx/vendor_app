import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
// import { AppearanceProvider } from 'react-native-appearance';
import {
  ShortCode,
  Login,
  OtpVerification,
  WebLinks,
  ForgotPassword,
  AppIntro,
  Location,
  ChatScreen,
  ChatScreenForVendor,
  ChatRoom,
  ChatRoomForVendor
} from '../Screens';

import { navigationRef } from './NavigationService';
import navigationStrings from './navigationStrings';
import TabRoutesVendor from './VendorApp/TabRoutesVendor';

const Stack = createNativeStackNavigator();

export default function Routes() {

  return (
    // <AppearanceProvider>
    <NavigationContainer
      ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen
          name={navigationStrings.SHORT_CODE}
          component={ShortCode}
          // component={LoginLayoutFour}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={navigationStrings.LOGIN}
          component={Login}
          // component={LoginLayoutFour}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name={navigationStrings.TABROUTESVENDORNEW}
          component={TabRoutesVendor}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name={navigationStrings.APP_INTRO}
          component={AppIntro}
          options={{ headerShown: false, gestureEnabled: false }}
        />


        <Stack.Screen
          name={navigationStrings.OTP_VERIFICATION}
          component={OtpVerification}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name={navigationStrings.FORGOT_PASSWORD}
          component={ForgotPassword}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name={navigationStrings.WEBLINKS}
          component={WebLinks}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name={navigationStrings.LOCATION}
          component={Location}
          options={{ headerShown: false }}
        />
        {/*  screens for chat ********* */}
        <Stack.Screen
          name={navigationStrings.CHAT_SCREEN}
          component={ChatScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name={navigationStrings.CHAT_SCREEN_FOR_VENDOR}
          component={ChatScreenForVendor}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={navigationStrings.CHAT_ROOM}
          component={ChatRoom}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={navigationStrings.CHAT_ROOM_FOR_VENDOR}
          component={ChatRoomForVendor}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    // </AppearanceProvider>
  );
}
