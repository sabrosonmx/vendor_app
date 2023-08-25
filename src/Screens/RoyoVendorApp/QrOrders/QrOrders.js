import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import WrapperContainer from '../../../Components/WrapperContainer';
import QRCodeScanner from 'react-native-qrcode-scanner';
import colors from '../../../styles/colors';
import {RNCamera} from 'react-native-camera';
import {
  moderateScale,
  moderateScaleVertical,
  width,
} from '../../../styles/responsiveSize';
import strings from '../../../constants/lang';
import imagePath from '../../../constants/imagePath';
import actions from '../../../redux/actions';
import {useSelector} from 'react-redux';
import Header from '../../../Components/Header';
import ButtonComponent from '../../../Components/ButtonComponent';
import OrderCard from '../../../Components/OrderCard';
import navigationStrings from '../../../navigation/navigationStrings';
import {useFocusEffect} from '@react-navigation/native';
import {showError} from '../../../utils/helperFunctions';

export default function QrOrders({navigation}) {
  const {appData, currencies, languages, themeColors} = useSelector(
    (state) => state?.initBoot,
  );
  const {scannedQrValue} = useSelector((state) => state?.order);

  const [state, setState] = useState({
    isLoading: false,
    isScanner: true,
    allOrders: [],
    isRefreshing: false,
    fetchedQrValue: '',
  });

  const {isLoading, isScanner, isRefreshing, allOrders, fetchedQrValue} = state;
  useEffect(() => {}, []);
  const updateState = (data) => setState((state) => ({...state, ...data}));
  useFocusEffect(
    useCallback(() => {
      if (scannedQrValue != '') {
        console.log('hjghfsdjhfjsdhfh');
        getOrdersByQrValue(scannedQrValue);
      }
    }, [scannedQrValue]),
  );

  const topContent = () => {
    return (
      <View
        style={{
          width: width,
          position: 'absolute',
          top: 0,
        }}>
        <Header
          headerStyle={{backgroundColor: colors.white}}
          leftIconStyle={{tintColor: colors.themeColor}}
          leftIcon={imagePath.backArrow}
          centerTitle={'QR Code'}
          onPressLeft={() => updateState({isScanner: false})}
        />
      </View>
    );
  };

  const barcodeReceived = (event) => {
    updateState({
      isScanner: false,
      isLoading: true,
    });
    getOrdersByQrValue(event?.data);
  };

  const getOrdersByQrValue = (qrData) => {
    let query = `/${qrData}?limit=30&page=1&type=completed`;
    actions
      .getOrderByQrScan(query, {
        code: appData?.profile?.code,
        currency: currencies?.primary_currency?.id,
        language: languages?.primary_language?.id,
      })
      .then((res) => {
        console.log(res, 'res>>>>>res');
        updateState({
          allOrders: res?.data?.data,
          isLoading: false,
          fetchedQrValue: qrData,
        });
      })
      .catch(errorMethod);
  };

  const errorMethod = (error) => {
    console.log(error, 'error>>>??');
    updateState({
      isRefreshing: false,
      isLoading: false,
    });
    showError(error?.message || error?.error);
  };

  if (isScanner) {
    return (
      <WrapperContainer>
        <QRCodeScanner
          reactivate={true}
          showMarker={true}
          markerStyle={{
            borderColor: colors.themeColor,
          }}
          onRead={barcodeReceived}
          flashMode={RNCamera.Constants.FlashMode.off}
          topContent={topContent()}
          containerStyle={{
            flex: 1,
            backgroundColor: colors.black,
          }}
          bottomContent={
            <View
              style={{
                width: width,
                height: moderateScaleVertical(80),
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}>
              <ButtonComponent
                btnText={strings.DONE}
                btnStyle={{
                  backgroundColor: colors.themeColor,
                  width: width,
                }}
                onPress={() =>
                  updateState({
                    isScanner: false,
                  })
                }
              />
            </View>
          }
        />
      </WrapperContainer>
    );
  }

  const handleRefresh = () => {};

  const onEndReachedDelayed = () => {};

  const orderDetail = (item) => {
    navigation.navigate(navigationStrings.QR_ORDER_DETAIL, {
      data: item,
      selectedVendor: item?.vendors[0]?.id,
      fetchedQrValue: fetchedQrValue,
    });
  };

  const renderOrders = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => orderDetail(item)}
        activeOpacity={0.8}
        style={{
          // marginLeft: customMarginLeftForBox(index),
          flex: 1,
          paddingHorizontal: moderateScale(20),
        }}>
        <OrderCard
          // updateOrderStatus={updateOrderStatus}
          onPress={() => orderDetail(item)}
          item={item}
        />
      </TouchableOpacity>
    );
  };

  return (
    <WrapperContainer isLoading={isLoading}>
      <Header
        leftIcon={imagePath.icBackb}
        onPressLeft={() => navigation.goBack()}
        centerTitle={'Orders'}
      />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={allOrders}
        extraData={allOrders}
        refreshing={isRefreshing}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary_color}
          />
        }
        onEndReached={onEndReachedDelayed}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => {
          return (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                height: 400,
                alignItems: 'center',
              }}>
              <Image source={imagePath.emptyCartRoyo} />
            </View>
          );
        }}
        renderItem={renderOrders}
        keyExtractor={(item, key) => key}
      />
    </WrapperContainer>
  );
}

const styles = StyleSheet.create({});
