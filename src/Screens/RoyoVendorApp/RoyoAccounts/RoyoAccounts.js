import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import Header from '../../../Components/Header';
import { loaderOne } from '../../../Components/Loaders/AnimatedLoaderFiles';
import WrapperContainer from '../../../Components/WrapperContainer';
import imagePath from '../../../constants/imagePath';
import strings from '../../../constants/lang';
import { resetStackAndNavigate } from '../../../navigation/NavigationService';
import navigationStrings from '../../../navigation/navigationStrings';
import actions from '../../../redux/actions';
import colors from '../../../styles/colors';
import fontFamily from '../../../styles/fontFamily';
import DeviceInfo from 'react-native-device-info';

import {
  moderateScale,
  moderateScaleVertical,
  textScale
} from '../../../styles/responsiveSize';
import { showError } from '../../../utils/helperFunctions';
import { API_BASE_URL } from '../../../config/urls';

const RoyoAccounts = (props) => {
  const { navigation } = props;

  const [state, setState] = useState({
    selectedVendor: null,
    vendor_list: [],
    isLoading: false,
    isRefreshing: false,
    vendorDetail: {},
  });

  const { selectedVendor, vendor_list, isLoading, isRefreshing, vendorDetail } =
    state;
  const { appData, currencies, languages } = useSelector(
    (state) => state?.initBoot,
  );
  let businessType = appData?.profile?.preferences?.business_type || null;

  const userData = useSelector((state) => state.auth.userData);
  const updateState = (data) => setState((state) => ({ ...state, ...data }));

  const { storeSelectedVendor } = useSelector((state) => state?.order);
  useEffect(() => {
    updateState({
      selectedVendor: storeSelectedVendor,
    });
  }, [storeSelectedVendor]);

  useEffect(() => {
    _getListOfVendor();
    // _getVendorProfile(selectedVendor);
  }, []);
  useEffect(() => {
    console.log('check selectedVendor', selectedVendor);
    updateState({ isLoading: false });
    _getVendorProfile(selectedVendor);
  }, [selectedVendor]);

  const _getVendorProfile = () => {
    let vendordId = !!storeSelectedVendor?.id
      ? storeSelectedVendor?.id
      : selectedVendor?.id
        ? selectedVendor?.id
        : '';
    console.log('res__getRevnueData>>>profile>>account', vendordId);
    let data = {};
    data['vendor_id'] = vendordId;
    if (!data.vendor_id) {
      return false;
    }
    console.log('res__getRevnueData>>>profile>>account', vendordId);
    actions
      .getVendorProfile(data, {
        code: appData?.profile?.code,
        currency: currencies?.primary_currency?.id,
        language: languages?.primary_language?.id,
      })
      .then((res) => {
        console.log(res, 'res__getRevnueData>>>profile>>account');

        updateState({
          isRefreshing: false,
          isLoading: false,
          vendorDetail: res?.data,
        });
      })
      .catch(errorMethod);
  };

  const _reDirectToVendorList = () => {
    navigation.navigate(navigationStrings.VENDORLIST, {
      selectedVendor: selectedVendor,
      allVendors: vendor_list,
      screenType: navigationStrings.ROYO_VENDOR_ACCOUNT,
    });
  };

  //delete functionality
  const onDeleteAccount = () => {
    if (!!userData?.auth_token) {
      Alert.alert(strings.ARE_YOU_SURE_YOU_WANT_TO_DELETE, '', [
        {
          text: strings.CANCEL,
          onPress: () => console.log('Cancel Pressed'),
          // style: 'destructive',
        },
        {
          text: strings.CONFIRM,
          onPress: deleleUserAccount,
        },
      ]);
    } else {
      actions.setAppSessionData('on_login');
    }
  };

  const deleleUserAccount = async () => {
    try {
      const res = await actions.deleteAccount(
        {},
        {
          code: appData?.profile?.code,
          currency: currencies?.primary_currency?.id,
          language: languages?.primary_language?.id,
        },
      );
      console.log('delete user account res', res);
      actions.userLogout();
      resetStackAndNavigate(navigation, navigationStrings.LOGIN)
      actions.cartItemQty('');
      actions.saveAddress('');
      actions.addSearchResults('clear');
      actions.setAppSessionData('on_login');
    } catch (error) {
      console.log('erro raised', error);
      showError(error?.message);
    }
  };

  const userlogout = () => {
    if (!!userData?.auth_token) {
      Alert.alert('', strings.LOGOUT_SURE_MSG, [
        {
          text: strings.CANCEL,
          onPress: () => console.log('Cancel Pressed'),
          style: 'destructive',
        },
        {
          text: strings.CONFIRM,
          onPress: async () => {
            await actions.userLogout();
            actions.cartItemQty('');
            // navigation.navigate(navigationStrings.LOGIN);
            resetStackAndNavigate(navigation, navigationStrings.LOGIN);
          },
        },
      ]);
    } else {
      // navigation.navigate(navigationStrings.LOGIN);
      resetStackAndNavigate(navigation, navigationStrings.LOGIN);
    }
  };
  const _getListOfVendor = () => {
    let vendordId = !!storeSelectedVendor?.id
      ? storeSelectedVendor?.id
      : selectedVendor?.id
        ? selectedVendor?.id
        : '';
    actions
      ._getListOfVendorOrders(
        `?limit=${1}&page=${1}&selected_vendor_id=${vendordId}`,
        {},
        {
          code: appData?.profile?.code,
          currency: currencies?.primary_currency?.id,
          language: languages?.primary_language?.id,
        },
      )
      .then((res) => {
        console.log('vendor orders res', res);
        updateState({
          vendor_list: res.data.vendor_list,
          selectedVendor: !!storeSelectedVendor?.id
            ? storeSelectedVendor
            : res.data.vendor_list.find((x) => x.is_selected),
          isLoading: false,
          isRefreshing: false,
        });
      })
      .catch(errorMethod);
  };
  const errorMethod = (error) => {
    updateState({ isLoading: false, isRefreshing: false });
    showError(error?.message || error?.error);
  };
  const data = [
    appData?.profile?.preferences?.off_scheduling_at_cart != 1 && {
      text: strings.VENDOR_SCHEDULING,
      image: imagePath.time,
      onPress: () =>
        navigation.navigate(navigationStrings.VENDOR_SCHEDULING),
    },
    {
      text: strings.TRANSACTIONS,
      image: imagePath.transactionsRoyo,
      onPress: () =>
        navigation.navigate(navigationStrings.ROYO_VENDOR_TRANSACTIONS),
    },
    {
      text: strings.LANGUAGES,
      image: imagePath.settings,
      onPress: () =>
        navigation.navigate(navigationStrings.SETTIGS),
    },
    businessType == 'laundry' && {
      text: strings.SCAN_QR,
      image: imagePath.paymentSettinRoyo,
      onPress: () => {
        actions.saveScannedQrValue('');
        navigation.navigate(navigationStrings.QR_ORDERS);
      },
    },

    {
      text: strings.SIGN_OUT,
      image: imagePath.signoutRoyo,
      onPress: userlogout,
    },
  ];


  const updateVendorProfile = () => {
    console.log(vendorDetail?.show_slot,'vendorDetail?.show_slot');
    updateState({
      isLoading: true,
    });
    let data ={
      vendor_id: vendorDetail?.id,
      is_available: !!vendorDetail?.is_available ? 0 : 1
    } 
    actions
      .updateVendorProfile(
        data,
        {
          code: appData?.profile?.code,
          currency: currencies?.primary_currency?.id,
          language: languages?.primary_language?.id,
        },
      )
      .then(res => {
        console.log('updateVendorProfile', res, 'res',vendorDetail?.show_slot,data);
        updateState({
          isRefreshing: false,
          isLoading: false,
          vendorDetail: res?.data,
        });
      })
      .catch(error => {
        console.log('updateVendorProfile', error, 'res');
      });
  };

  return (
    <WrapperContainer
      bgColor="white"
      isLoadingB={isLoading}
      source={loaderOne}
      statusBarColor="white"
      barStyle="dark-content">
      <Header
        headerStyle={{ marginVertical: moderateScaleVertical(16) }}
        // centerTitle="Accounts | Foodies hub  "
        centerTitle={`${strings.ACCOUNT}| ${selectedVendor?.name} `}
        noLeftIcon
        imageAlongwithTitle={imagePath.dropdownTriangle}
        showImageAlongwithTitle
        onPressCenterTitle={() => _reDirectToVendorList()}
        onPressImageAlongwithTitle={() => _reDirectToVendorList()}
      />
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: !!vendorDetail?.is_available
                ? colors.lightGreen
                : colors.greyA,
            },
          ]}>
          {vendorDetail?.logo?.proxy_url ? (
            <Image
              source={{
                uri: `${vendorDetail?.logo?.proxy_url}100/100${vendorDetail?.logo?.image_path}`,
              }}
              style={{
                width: moderateScale(50),
                height: moderateScale(50),
                marginRight: moderateScale(10),
              }}
            />
          ) : (
            <View style={styles.cameraBox}>
              <Image source={imagePath.cameraRoyo} />
              <Text style={styles.addLogo}>{strings.ADD_LOGO}</Text>
            </View>
          )}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.font16Semibold}>{selectedVendor?.name}</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={updateVendorProfile}>
                <FastImage
                  source={
                    !!vendorDetail?.is_available
                      ? imagePath.icToggleon
                      : imagePath.icToggleoff
                  }
                  resizeMode='contain'
                  style={{ height: moderateScale(30), width: moderateScale(30) }}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontFamily: fontFamily.regular,
                color: colors.blackOpacity66,
              }}>
              {vendorDetail?.address}
            </Text>
          </View>
          {/* <Image style={{alignSelf: 'center'}} source={imagePath.edit1Royo} /> */}
        </View>
        <View style={{ marginTop: moderateScaleVertical(22) }}>
          {data.map((val, index) => {
            return (
              <TouchableOpacity
                onPress={val.onPress}
                key={index}
                style={{
                  flexDirection: 'row',
                  marginTop: moderateScaleVertical(10),
                  alignItems: 'center',
                }}>
                <Image
                  source={val.image}
                  style={{
                    height: moderateScale(18),
                    width: moderateScale(18),
                    resizeMode: 'contain',
                  }}
                />
                <Text style={styles.font15Semibold}>{val.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View
          style={{
            zIndex: -1,
            alignSelf: 'center',
            marginBottom: moderateScaleVertical(90),
            marginTop: moderateScaleVertical(24),
            alignItems: 'center',
          }}>
          <Text
            style={{
            //  ...commonStyles.regularFont11,
              color: colors.textGrey,
            }}>
            App Version {`${DeviceInfo.getVersion()}`}{' '}
            {`(${DeviceInfo.getBuildNumber()})`}{' '}
            {API_BASE_URL == 'https://api.rostaging.com/api/v1' ? 'S' : ''}
          </Text>

          {!!userData?.auth_token ? (
            <Text
              onPress={onDeleteAccount}
              style={{
              //  ...commonStyles.regularFont11,
                color: colors.redB,
                marginTop: moderateScaleVertical(4),
              }}>
              {strings.DELETE_ACCOUNT}
            </Text>
          ) : null}
        </View>
      </View>
    </WrapperContainer>
  );
};

export default RoyoAccounts;

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScaleVertical(24),
    marginHorizontal: moderateScale(16),
  },
  header: {
    flexDirection: 'row',
    padding: moderateScale(12),
    backgroundColor: '#24C3A323',
    borderRadius: moderateScale(5),
    // marginTop: moderateScaleVertical(16),
  },
  cameraBox: {
    marginRight: moderateScale(8),
    backgroundColor: colors.white,
    padding: moderateScale(12),
    alignItems: 'center',
    borderRadius: moderateScale(5),
  },
  addLogo: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10),
    color: colors.blackOpacity43,
  },
  font16Semibold: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    marginBottom: moderateScaleVertical(8),
    color: colors.black,
  },
  font15Semibold: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(15),
    color: colors.blackOpacity66,
    marginLeft: moderateScale(16),
  },
});
