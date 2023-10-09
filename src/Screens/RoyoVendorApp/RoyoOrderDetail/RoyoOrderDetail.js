import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import * as MyShare from 'react-native-share';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  FlatList,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import ButtonWithLoader from '../../../Components/ButtonWithLoader';
import Header from '../../../Components/Header';
import WrapperContainer from '../../../Components/WrapperContainer';
import imagePath from '../../../constants/imagePath';
import actions from '../../../redux/actions';
import colors from '../../../styles/colors';
import fontFamily from '../../../styles/fontFamily';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
  width,
} from '../../../styles/responsiveSize';
import { customMarginBottom } from '../../../utils/constants/constants';
import { getImageUrl, showError } from '../../../utils/helperFunctions';
import { dialCall } from '../../../utils/openNativeApp';
import { loaderOne } from '../../../Components/Loaders/AnimatedLoaderFiles';
import { isEmpty } from 'lodash';
import FastImage from 'react-native-fast-image';
import strings from '../../../constants/lang';
import navigationStrings from '../../../navigation/navigationStrings';
import RejectResonModal from '../../../Components/RejectResonModal';
import { tokenConverterPlusCurrencyNumberFormater } from '../../../utils/commonFunction';

const RoyoOrderDetail = (props) => {
  const { navigation } = props;
  const { data, selectedVendor, index } = props.route.params;
  const { appData, appStyle, currencies, languages } = useSelector(
    (state) => state?.initBoot,

  );
  const userData = useSelector((state) => state?.auth?.userData);
  const {additional_preferences, digit_after_decimal} =
  appData?.profile?.preferences || {};
const {preferences} = appData?.profile;
  const [state, setState] = useState({
    address: '',
    isLoadingB: false,
    showUpcomingStatus: false,
    current_status: data?.order_status?.current_status,
    upcoming_status: data?.order_status?.upcoming_status,
    orderInfo: {},
    userDocumentList: [],
    isRejectResonModal: false,
    reason: '',
  });
  const {
    showUpcomingStatus,
    current_status,
    upcoming_status,
    isLoadingB,
    address,
    orderInfo,
    userDocumentList,
    isRejectResonModal,
    reason,
  } = state;
  const shareOptions = {
    title: 'Share via',
    message: 'some message',
    url: 'some share url',
    social: 'WHATSAPP',
    whatsAppNumber: '917543875613',
  };

  const fun = async () => {
    MyShare.Share.shareSingle(shareOptions)
      .then((res) => {
        console.log(res, 'share response');
        alert('successfully shared');
      })
      .catch((err) => {
        err && console.log(err, 'share response');
        alert('sorry for inconvenience , we are unable to share');
      });
  };

  const onWhatsapp = async () => {
    const vendorPhoneNumber = orderInfo?.user?.phone_number.replace(/\s/g, "")
    let url = `whatsapp://send?phone=${orderInfo?.user?.dial_code}${vendorPhoneNumber}`;
 
    Linking.openURL(url)
      .then((data) => {
        console.log("WhatsApp Opened successfully " + data); //<---Success
      })
      .catch(() => {
        alert("Make sure WhatsApp installed on your device"); //<---Error
      });
    if (link) {
      Linking.canOpenURL(link)
        .then((supported) => {
          if (!supported) {
            Alert.alert("Please install Whatsapp to send direct message.");
          } else {
            return Linking.openURL(link);
          }
        })
        .catch((err) => console.error("An error occurred", err));
    } else {
      console.log("sendWhatsAppMessage -----> ", "message link is undefined");
    }
  };

  useEffect(() => {
    _getOrderDetailScreen();
  }, []);
  const _getOrderDetailScreen = () => {
    let collectedData = {};
    collectedData['order_id'] = data?.id;
    if (selectedVendor) {
      collectedData['vendor_id'] = selectedVendor?.id;
    }
    console.log(data, '=====res');
    updateState({ isLoadingB: true });
    actions
      .getOrderDetail(collectedData, {
        code: appData?.profile?.code,
        currency: currencies?.primary_currency?.id,
        language: languages?.primary_language?.id,
      })
      .then((res) => {
        console.log(res.data, '=====res');
        updateState({ isLoadingB: false });
        if (res?.data) {
          updateState({
            address: res.data.address,
            isLoadingB: false,
            orderInfo: res.data,
            userDocumentList: res?.data?.user_document_list,
          });
        }
      })
      .catch(errorMethod);
  };
  const errorMethod = (error) => {
    updateState({
      isLoading: false,
      isLoadingB: false,
      isLoading: false,
      isLoadingC: false,
    });
    showError(error?.message || error?.error);
  };
  const updateOrderStatus = (acceptRejectData, status) => {
    let data = {};
    data['order_id'] = acceptRejectData?.id;
    data['vendor_id'] = selectedVendor?.id;
    data['order_status_option_id'] = status;
    updateState({ isLoadingB: true });
    actions
      .updateOrderStatus(data, {
        code: appData?.profile?.code,
        currency: currencies?.primary_currency?.id,
        language: languages?.primary_language?.id,
      })
      .then((res) => {
        console.log(res, 'res>>>acceptRejectOrder and the hello');
        updateState({
          isLoadingB: false,
        });
        if (res && res.status == 'success') {
          updateState({
            showUpcomingStatus: false,
            current_status: res?.order_status?.current_status,
            upcoming_status: res?.order_status?.upcoming_status,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        updateState({
          isLoadingB: false,
        });
      });
  };

  const updateState = (data) => setState((state) => ({ ...state, ...data }));
  const toggleUpcomingStatus = () => {
    updateState({
      showUpcomingStatus: !showUpcomingStatus,
    });
  };

  const renderUserDetails = (item, index) => {
    return (
      <View style={{ marginTop: moderateScaleVertical(15) }}>
        <Text style={{ fontFamily: fontFamily.bold, fontSize: textScale(13) }}>
          {'• '}
          {item?.primary?.name}
        </Text>
        <View style={{ marginHorizontal: moderateScale(5), marginTop: 5 }}>
          {item?.file_type == 'Text' ? (
            <Text>{item?.user_document?.file_name}</Text>
          ) : item?.file_type == 'Image' ? (
            <FastImage
              source={{
                uri: getImageUrl(
                  item?.user_document?.image_file?.image_fit,
                  item?.user_document?.image_file?.image_path,
                  '500/500',
                ),
              }}
              style={{ height: 70, width: 70 }}
            />
          ) : (
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(item?.user_document?.image_file?.storage_url)
              }>
              <Text
                style={{
                  color: colors.blueColor,
                  textDecorationLine: 'underline',
                }}>
                {strings.VIEW_PDF}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const backPress = () => {

    navigation.navigate(navigationStrings?.VENDOR_ORDER, { index: index });
  }
  const onRejectPress = () => {
    updateState({
      isRejectResonModal: true,
      // rejectedOrder:item,

    })
  }

  // const onReject = ()=>{
  //   if (reason == '' || isEmpty(reason)) {
  //     alert('please enter the reason!')
  //     return
  //  }
  //   // updateOrderStatus(rejectedOrder,8)
  //   updateOrderStatus(data, 8)
  //   updateState({
  //     isRejectResonModal:false
  //   })
  // }

  const onClose = () => {
    updateState({
      isRejectResonModal: false
    })
  }
  //On change in textinput field
  const _onChangeText = (key) => (val) => {
    updateState({ [key]: val });
  };
  const onSubmit = () => {
    if (reason == '' || isEmpty(reason)) {
      alert('please enter the reason!')
      return
    }
    updateOrderStatus(data, 8)
    updateState({
      isRejectResonModal: false
    })
  }

  const renderItem = useCallback(({ item, index }) => {
    return (
      <View style={styles.itemBox}>
        <Image
          style={styles.itemImage}
          source={{
            uri: getImageUrl(
              item?.image_path?.image_fit,
              item?.image_path?.image_path,
              '500/500',
            ),
          }}
        />
        <View style={{ flex: 1, justifyContent: 'space-around' }}>
          <View style={{}}>
            <View style={{

              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
              <View style={{ flex: 0.8 }}>
                <Text style={styles.font16Medium}>
                  {/* {item?.translation?.title} */}
                  {item?.translation?.title || item?.product_addons[0]?.addon_title }
                </Text>
              </View>
              {!!appData?.profile?.preferences?.update_order_product_price ? (
                <TouchableOpacity
                  hitSlop={{
                    top: 50,
                    bottom: 50,
                    right: 50,
                    left: 50,
                  }}
                  onPress={() => editOrder(item)}
                  style={{

                  }}
                >
                  <Image source={imagePath?.edit1Royo} />
                </TouchableOpacity>) : <></>}
            </View>



            {/* {!userData?.is_superadmin ? (
              <View style={{ marginVertical: moderateScaleVertical(8) }}>
                {!!appData?.profile?.socket_url ? (
                  <TouchableOpacity
                    onPress={() => createRoom(item)}
                    style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.startChatText}>
                      {strings.START_CHAT}
                    </Text>
                    <Image
                      resizeMode="contain"
                      style={styles.agentUserIcon}
                      source={imagePath.icUserChat}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null} */}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.font13Regular}>
                {item.quantity}
                {strings.UNIT} {'x'}{' '}
              </Text>
              <Text style={styles.font14Regular}>
                {tokenConverterPlusCurrencyNumberFormater(
                  Number(item.price),
                  digit_after_decimal,
                  additional_preferences,
                  currencies?.primary_currency?.symbol,
                )}
              </Text>
            </View>
            <View>
              <Text style={styles.font16Semibold}>
                {`${currencies?.primary_currency?.symbol} ${Number(
                  item.quantity * item.price,
                ).toFixed(2)}`}
              </Text>
            </View>
          </View>
          {!!item?.product_variant_sets ? <View style={{ marginTop: moderateScale(2) }} >
            <Text style={styles.font14Regular}>
              {item?.product_variant_sets}
            </Text>
          </View> : <></>
          }
          {item?.product_addons.length > 0
            ? item?.product_addons.map((j) => {
              return (
                <View>
                  <Text>
                    {`(${j.option_title})`} ={' '}
                    {`${tokenConverterPlusCurrencyNumberFormater(
                      Number(j.price),
                      digit_after_decimal,
                      additional_preferences,
                      currencies?.primary_currency?.symbol,
                    )}`}
                  </Text>
                </View>
              );
            })
            : null}
        </View>

      </View>
    );
  }, []);

 
  return (
    <WrapperContainer
      isLoading={isLoadingB}
      bgColor="white"
      statusBarColor="white"
      barStyle="dark-content"
      source={loaderOne}>
      <Header
        headerStyle={{ marginVertical: moderateScaleVertical(16) }}
        leftIcon={imagePath.backRoyo}
        centerTitle={`Order #${data.order_number}`}
        onPressLeft={backPress}
      />
      {/* <View style={{...styles.orderNumberBox, zIndex: -1}}>
        <Text style={styles.orderNumber}>Order #{data.order_number}</Text>
      </View> */}
      <ScrollView
        style={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        {current_status?.id != 1 ? (
          <View>
            <Text style={styles.jobStatus}>{strings.JOB_STATUS}</Text>
            <View style={styles.preparingBox}>
              <Text style={{ ...styles.font16Semibold, color: colors.white }}>
                {current_status?.title}
              </Text>
              <TouchableOpacity
                disabled={!data?.order_status?.upcoming_status}
                onPress={toggleUpcomingStatus}>
                <Image source={imagePath.dropdownTriangle} />
              </TouchableOpacity>
            </View>
            {showUpcomingStatus && upcoming_status ? (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.upcomingStatus}
                onPress={() => updateOrderStatus(data, upcoming_status?.id)}>
                <Text style={{ ...styles.font16Semibold, color: colors.white }}>
                  {upcoming_status?.title}
                </Text>

                <Image
                  style={{ tintColor: colors.white }}
                  source={imagePath.selectedRoyo}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
        <View style={{ ...styles.orderNumberBox, zIndex: -1 }}>
          {/* <Text style={styles.orderNumber}>Order #{data.order_number}</Text> */}
          <Text style={styles.orderNumber}>{strings.ORDERAT}:</Text>
          {/* <Text style={styles.orderTime}>{`${moment(data?.date_time).format(
            'DD MMM,YYYY',
          )} ${moment(data?.date_time).format('LT')} `}</Text> */}
          <Text style={styles.orderNumber}>
            {data?.date_time}
          </Text>
        </View>
        <FlatList
          bounces={false}
          showsVerticalScrollIndicator={false}
          data={
            orderInfo.vendors && orderInfo.vendors[0]
              ? orderInfo.vendors[0].products
              : []
          }
          keyExtractor={(val, index) => index}
          renderItem={renderItem}
          // renderItem={({ item, index }) => {
          //   console.log(item,'kskgszdfigsdilufgs');
          //   return (
          //     <View style={styles.itemBox}>
          //       <Image
          //         style={styles.itemImage}
          //         source={{
          //           uri: getImageUrl(
          //             item?.image_path?.image_fit,
          //             item?.image_path?.image_path,
          //             '500/500',
          //           ),
          //         }}
          //       />
          //       <View style={{ flex: 1, justifyContent: 'space-around' }}>
          //         <Text style={styles.font16Medium}>
          //           {item?.translation?.title || item?.product_addons[0]?.addon_title }
          //         </Text>
          //         <Text style={styles.font13Regular}>
          //           {item.quantity}
          //           {strings.UNIT}
          //         </Text>
          //         <Text style={styles.font14Regular}>
          //           {currencies?.primary_currency?.symbol}{' '}
          //           {Number(item.price).toFixed(2)}
          //         </Text>
          //       </View>
          //       <Text style={styles.font16Semibold}>
          //         {`${currencies?.primary_currency?.symbol} ${Number(
          //           item.quantity * item.price,
          //         ).toFixed(2)}`}
          //       </Text>
          //     </View>
          //   );
          // }}
          contentContainerStyle={styles.orderBox}
          ItemSeparatorComponent={() => <View style={styles.itemSeperator} />}
        />

        {!!data?.specific_instructions && (
          <View style={{ margin: moderateScaleVertical(16) }}>
            <Text style={styles.font15Medium}>{strings.INSTRUCTIONS}</Text>
            <Text style={styles.font15Semibold}>
              {data?.specific_instructions}
            </Text>
          </View>
        )}

        <View style={{ margin: moderateScaleVertical(16) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.font15Medium}>{strings.SUBTOTAL}</Text>
            <Text style={styles.font15Semibold}>
              {currencies?.primary_currency?.symbol}{' '}
              {Number(data.payable_amount).toFixed(2)}
            </Text>
          </View>

          {/* <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.font15Medium}>{strings.DELIVERYFEE}</Text>
            <Text style={styles.font15Semibold}>
              {currencies?.primary_currency?.symbol}{' '}
              {Number(data.total_delivery_fee).toFixed(2)}
            </Text>
          </View> */}
          {/* ************************************************************ */}

          {!!data?.total_delivery_fee && !!Number(data?.total_delivery_fee) && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.font15Medium}>{strings.DELIVERYFEE}</Text>
              <Text style={styles.font15Semibold}>
                {currencies?.primary_currency?.symbol}{" "}
                {Number(data?.total_delivery_fee).toFixed(2)}
              </Text>
            </View>
          )}

          {!!data?.fixed_fee_amount && !!Number(data?.fixed_fee_amount) !== 0 && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.font15Medium}>
                {preferences?.fixed_fee_nomenclature != "" &&
                  preferences?.fixed_fee_nomenclature != null
                  ? preferences?.fixed_fee_nomenclature
                  : strings.FIXED_FEE}
              </Text>
              <Text style={styles.font15Semibold}>
                {currencies?.primary_currency?.symbol}{" "}
                {Number(data.fixed_fee_amount).toFixed(2)}
              </Text>
            </View>
          )}


          {Number(data?.total_service_fee) + Number(data?.taxable_amount) !==
            0 && (
              <View
                style={{ flexDirection: "row", justifyContent: "space-between" }}
              >
                <Text style={styles.font15Medium}>{strings.TAXES_FEES}</Text>
                <Text style={styles.font15Semibold}>
                  {currencies?.primary_currency?.symbol}{" "}
                  {(
                    Number(data?.total_service_fee) + Number(data?.taxable_amount)
                  ).toFixed(2)}
                </Text>
              </View>
            )}

          {!!data?.total_container_charges &&
            Number(data?.total_container_charges) !== 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.font15Medium}>
                  {/* {strings.CONTAINER_CHARGES} */}
                  {'container Charges'}
                </Text>
                <Text style={styles.font15Semibold}>
                  {currencies?.primary_currency?.symbol}{" "}
                  {Number(data?.total_container_charges).toFixed(2)}
                </Text>
              </View>
            )}


          {!!data?.total_discount && Number(data?.total_discount) !== 0 && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.font15Medium}>{strings.DISCOUNT}</Text>
              <Text style={styles.font15Semibold}>
                -{currencies?.primary_currency?.symbol}{" "}
                {Number(data.total_discount).toFixed(2)}
              </Text>
            </View>
          )}

          {!!data?.wallet_amount_used && Number(data?.wallet_amount_used) !== 0 && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.font15Medium}>{strings.WALLET}</Text>
              <Text style={styles.font15Semibold}>
                -{currencies?.primary_currency?.symbol}{" "}
                {Number(data.wallet_amount_used).toFixed(2)}
              </Text>
            </View>
          )}

          {!!data?.tip_amount && Number(data?.tip_amount) !== 0 && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.font15Medium}>{strings.TIP_AMOUNT}</Text>
              <Text style={styles.font15Semibold}>
                {currencies?.primary_currency?.symbol}{" "}
                {Number(data.tip_amount).toFixed(2)}
              </Text>
            </View>
          )}

          {!!data?.loyality_amount && Number(data?.loyality_amount) !== 0 && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.font15Medium}>{strings.LOYALTY}</Text>
              <Text style={styles.font15Semibold}>
                {currencies?.primary_currency?.symbol}{" "}
                {Number(data.loyality_amount).toFixed(2)}
              </Text>
            </View>
          )}

          {/* ********************************************************************** */}
          <View style={styles.dashLine} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.font15Medium}>{strings.TOTAL}</Text>
            <Text style={{ ...styles.font15Semibold, color: colors.themeColor2 }}>
              {`${currencies?.primary_currency?.symbol} ${Number(
                parseFloat(data.payable_amount)
              ).toFixed(2)}`}
            </Text>
          </View>
        </View>
        <View
          style={{
            padding: moderateScaleVertical(16),
            backgroundColor: colors.whiteSmokeColor,
          }}>
          <View style={styles.flexRow}>
            <Text style={styles.font14Semibold}>
              {strings.DELIEVERY_ADDRESS}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                  onPress={() => dialCall(orderInfo?.user?.phone_number)}
              // onPress={() => dialCall(1234567890)}
              >
                <Image source={imagePath.callRoyo} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onWhatsapp}>
                <Image
                  style={{
                    marginLeft: moderateScaleVertical(10),
                    // ...styles.shareImage,
                  }}
                  source={imagePath.whatsAppRoyo}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Share.share({
                    // message: 'https://www.google.com',
                    title: 'Download the app and start your business!',
                    url: 'https://play.google.com/store/apps/details?id=com.sabroson.vendorApp',
                  })
                }>
                <Image
                  style={{
                    marginLeft: moderateScaleVertical(10),
                  }}
                  source={imagePath.shareRoyo}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.locationBox}>
            <Image style={styles.locationImage} source={imagePath.icMap} />
            <View style={{ justifyContent: 'space-evenly' }}>
              <Text style={{ fontFamily: fontFamily.semiBold, fontSize: 16 }}>
                {data.user_name}
              </Text>
              <Text
                style={{
                  ...styles.font13Regular,
                  marginTop: moderateScaleVertical(5),
                }}>
                {address?.street}
              </Text>
              <Text style={styles.font13Regular}>
                {address?.city + ', ' + address?.country}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...styles.font14Semibold }}>
              {strings.PAYMENT_METHOD}
            </Text>
            <Text style={{ ...styles.font14Semibold, color: colors.black }}>
              {data.payment_option_title}
            </Text>
          </View>
        </View>
        <View style={{ marginHorizontal: moderateScale(20) }}>
          {!isEmpty(userDocumentList) &&
            userDocumentList.map(renderUserDetails)}
        </View>
        {current_status?.id == 1 ? (
          <View style={styles.buttonBox}>
            <ButtonWithLoader
              btnText={strings.REJECT}
              btnTextStyle={styles.btnText}
              btnStyle={styles.btnContainer}
              onPress={onRejectPress}
            />
            <ButtonWithLoader
              btnText={strings.CONFIRM}
              btnTextStyle={{ ...styles.btnText, color: colors.white }}
              btnStyle={{
                ...styles.btnContainer,
                backgroundColor: colors.themeColor2,
                marginLeft: moderateScale(10),
              }}
              onPress={() => updateOrderStatus(data, 7)}
            />
          </View>
        ) : null}
      </ScrollView>
      {
        !!isRejectResonModal && (
          <RejectResonModal
            isVisible={isRejectResonModal}
            onClose={onClose}
            onSubmit={onSubmit}
            onChangeText={_onChangeText('reason')}
          />
        )
      }
    </WrapperContainer>
  );
};

export default RoyoOrderDetail;

const styles = StyleSheet.create({
  font15Medium: {
    fontSize: textScale(15),
    fontFamily: fontFamily.medium,
    color: colors.blackOpacity43,
  },
  font15Semibold: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(15),
    color: colors.black,
  },
  font16Medium: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
  },
  font16Semibold: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    alignSelf: 'flex-end',
  },
  font13Regular: {
    fontFamily: fontFamily.regular,
    color: colors.blackOpacity40,
    fontSize: 13,
  },
  font14Regular: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
  },
  font14Semibold: {
    color: colors.blackOpacity43,
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
  },
  header: {
    marginBottom: moderateScaleVertical(32),
    marginHorizontal: moderateScaleVertical(16),
  },
  container: {
    flex: 1,
    // marginTop: moderateScaleVertical(24),
    paddingBottom: moderateScaleVertical(10),
    // marginBottom: moderateScaleVertical(16),
    marginBottom: customMarginBottom(),
  },
  jobStatus: {
    fontSize: 18,
    fontFamily: fontFamily.medium,
    marginHorizontal: moderateScaleVertical(16),
    // marginTop: moderateScaleVertical(16),
  },
  preparingBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScaleVertical(15),
    borderRadius: moderateScale(5),
    backgroundColor: colors.themeColor2,
    marginTop: moderateScaleVertical(16),
    marginHorizontal: moderateScaleVertical(16),
    alignItems: 'center',
  },
  upcomingStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScaleVertical(15),
    borderRadius: moderateScale(5),
    backgroundColor: colors.themeColor2,
    marginTop: moderateScaleVertical(16),
    marginHorizontal: moderateScaleVertical(16),
    alignItems: 'center',
    marginTop: 0,
    zIndex: 23,
    position: 'absolute',
    bottom: -moderateScaleVertical(48),
    width: width - moderateScaleVertical(32),
  },
  orderNumberBox: {
    marginTop: moderateScaleVertical(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: moderateScale(4),
    marginHorizontal: moderateScaleVertical(16),
  },
  orderNumber: {
    color: colors.blackOpacity66,
    fontFamily: fontFamily.regular,
    fontSize: 16,
  },
  orderTime: {
    color: colors.blackOpacity66,
    fontFamily: fontFamily.regular,
    fontSize: 16,
  },
  itemBox: {
    flexDirection: 'row',
    padding: moderateScale(16),
  },
  itemImage: {
    width: moderateScale(65),
    height: moderateScale(65),
    borderRadius: moderateScale(5),
    marginRight: moderateScale(16),
  },
  orderBox: {
    borderRadius: moderateScale(8),
    backgroundColor: colors.whiteSmokeColor,
    margin: moderateScaleVertical(16),
  },
  itemSeperator: {
    borderBottomColor: colors.lightGreyBgColor,
    borderBottomWidth: 1,
    marginHorizontal: moderateScale(16),
  },
  dashLine: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
    flex: 1,
    marginVertical: moderateScaleVertical(16),
    borderColor: colors.lightGreyBgColor,
  },
  shareImage: {
    height: moderateScaleVertical(23),
    width: moderateScaleVertical(23),
  },
  locationBox: {
    flexDirection: 'row',
    marginVertical: moderateScale(16),
    borderRadius: moderateScale(6),
  },
  locationImage: {
    width: moderateScale(65),
    height: moderateScale(65),
    borderRadius: moderateScale(5),
    marginRight: moderateScaleVertical(16),
  },
  btnText: {
    color: colors.themeColor2,
    // paddingHorizontal: moderateScale(16),
    textTransform: 'none',
    fontSize: textScale(14),
  },
  buttonBox: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: moderateScaleVertical(16),
  },
  btnContainer: {
    borderRadius: moderateScale(5),
    backgroundColor: colors.white,
    borderColor: colors.themeColor2,
    paddingHorizontal: moderateScale(20),
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
