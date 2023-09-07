import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
  QrOrderDetail,
  QrOrders,
  RoyoAccounts,
  RoyoPaymentSetting,
  RoyoTransactions,
  Settings,
  VendorList,
  VendorScheduling,
} from '../../Screens';
import navigationStrings from '../navigationStrings';
import OrderStackVendor from './OrderStackVendor';

const Stack = createNativeStackNavigator();
export default function () {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={navigationStrings.ROYO_VENDOR_ACCOUNT}
        component={RoyoAccounts}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={navigationStrings.VENDORLIST}
        component={VendorList}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name={navigationStrings.ROYO_VENDOR_TRANSACTIONS}
        component={RoyoTransactions}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={navigationStrings.ROYO_VENDOR_PAYMENT_SETTINGS}
        component={RoyoPaymentSetting}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={navigationStrings.ROYO_VENDOR_ORDER}
        component={OrderStackVendor}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={navigationStrings.QR_ORDERS}
        component={QrOrders}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={navigationStrings.QR_ORDER_DETAIL}
        component={QrOrderDetail}
        options={{headerShown: false}}
      />
       <Stack.Screen
        name={navigationStrings.SETTIGS}
        component={Settings}
        options={{headerShown: false}}
      />
        <Stack.Screen
        name={navigationStrings.VENDOR_SCHEDULING}
        component={VendorScheduling}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
