import React, {useState, useEffect} from 'react';
import {Image, Text, TouchableOpacity, View, I18nManager} from 'react-native';
import {useSelector} from 'react-redux';
import WrapperContainer from '../../Components/WrapperContainer';
import imagePath from '../../constants/imagePath';
import strings from '../../constants/lang';
import navigationStrings from '../../navigation/navigationStrings';
import actions from '../../redux/actions';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
  width,
} from '../../styles/responsiveSize';
import {
  showSuccess,
  showError,
  otpTimerCounter,
} from '../../utils/helperFunctions';
import stylesFunc from './styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import BorderTextInput from '../../Components/BorderTextInput';
import PhoneNumberInput from '../../Components/PhoneNumberInput';
import colors from '../../styles/colors';
import {TextInput} from 'react-native-gesture-handler';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import CountryPicker, {Flag} from 'react-native-country-picker-modal';
import {loaderOne} from '../../Components/Loaders/AnimatedLoaderFiles';
import validations from '../../utils/validations';
import {useDarkMode} from 'react-native-dynamic';
import {MyDarkTheme} from '../../styles/theme';
import {useNavigation} from '@react-navigation/native';
import {checkIsAdmin} from '../../utils/utils';

export default function VerifyAccount({navigation, route}) {
  const navigation_ = useNavigation();
  const theme = useSelector((state) => state?.initBoot?.themeColor);
  const toggleTheme = useSelector((state) => state?.initBoot?.themeToggle);
  const darkthemeusingDevice = useDarkMode();
  const isDarkMode = toggleTheme ? darkthemeusingDevice : theme;
  const appData = useSelector((state) => state?.initBoot?.appData);
  let paramsData = route?.params;
  const userData = useSelector((state) => state?.auth?.userData);
  const [state, setState] = useState({
    timer2: 0,
    timer: 0,
    isLoading: false,
    callingCode: userData?.dial_code
      ? userData?.dial_code
      : appData?.profile?.country?.phonecode
      ? appData?.profile?.country?.phonecode
      : '91',
    cca2: userData?.cca2
      ? userData?.cca2
      : appData?.profile?.country?.code
      ? appData?.profile?.country?.code
      : 'IN',
    name: '',
    email: userData?.email || '',
    password: '',
    phoneNumber: userData?.phone_number || '',
    deviceToken: '',
    referralCode: '',
    editableEmail: false,
    editablePhone: false,
    emailOtp: '',
    phoneOtp: '',
    countryPickerModalVisible: false,
  });

  const {appStyle, themeColors} = useSelector((state) => state?.initBoot);
  const fontFamily = appStyle?.fontSizeData;
  const styles = stylesFunc({userData, fontFamily, themeColors});
  const updateState = (data) => setState((state) => ({...state, ...data}));
  const {
    timer2,
    timer,
    phoneNumber,
    callingCode,
    cca2,
    name,
    email,
    isLoading,
    password,
    referralCode,
    editableEmail,
    editablePhone,
    emailOtp,
    phoneOtp,
    countryPickerModalVisible,
  } = state;

  const moveToNewScreen = (screenName, data) => () => {
    navigation.navigate(screenName, {});
  };
  const sendOTP = (type, resendType) => {
    let data = {};
    if (type == 'phone') {
      data['phone_number'] = phoneNumber;
      data['dial_code'] = callingCode;
      data['type'] = type;
    } else {
      data['email'] = email;
      data['type'] = type;
    }
    updateState({isLoading: true});
    actions
      .resendOTP(data, {
        code: appData?.profile?.code,
      })
      .then((res) => {
        console.log(res, 'resresres');
        showSuccess(res.message);
        if (type == 'phone') {
          updateState({
            editablePhone: false,
          });
        } else {
          updateState({editableEmail: false});
        }

        // moveToNewScreen(navigationStrings.OTP_VERIFICATION, {})();

        updateState({isLoading: false});
      })
      .catch(errorMethod);
  };

  //Resend code

  const resendOtpData = (type) => {
    let data = {};
    if (type == 'phone') {
      data['phone_number'] = phoneNumber;
      data['dial_code'] = callingCode;
      data['type'] = type;
    } else {
      data['email'] = email;
      data['type'] = type;
    }
    updateState({isLoading: true});
    actions
      .resendOTP(data, {
        code: appData?.profile?.code,
      })
      .then((res) => {
        console.log(res, 'res>>>');
        showSuccess(res.message);
        if (type == 'phone') {
          updateState({timer2: 30});
        } else {
          updateState({timer: 30});
        }
        // moveToNewScreen(navigationStrings.OTP_VERIFICATION, {})();

        updateState({isLoading: false});
      })
      .catch(errorMethod);
  };
  useEffect(() => {
    let timerId;
    if (timer > 0) {
      timerId = setTimeout(() => {
        updateState({timer: timer - 1});
      }, 1000);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [timer]);

  useEffect(() => {
    let timerId2;
    if (timer2 > 0) {
      timerId2 = setTimeout(() => {
        updateState({timer2: timer2 - 1});
      }, 1000);
    }
    return () => {
      if (timerId2) clearTimeout(timerId2);
    };
  }, [timer2]);

  const isValidData = (otp) => {
    const error = validations({
      otp,
    });
    if (error) {
      showError(error);
      return;
    }
    return true;
  };

  const onVerify = (type, otp) => {
    const checkValid = isValidData(otp);
    if (!checkValid) {
      return;
    }
    let data = {};
    data['type'] = type;
    data['otp'] = otp;
    if (type == 'phone') {
      data['phone_number'] = phoneNumber;
    }
    updateState({isLoading: true});
    actions
      .verifyAccount(data, {
        code: appData?.profile?.code,
      })
      .then((res) => {
        console.log(res, 'res data to show');
        showSuccess(res.message);
        if (res && res?.status == 'Success') {
          if (
            res?.data?.client_preference?.verify_email &&
            res?.data?.client_preference?.verify_phone
          ) {
            if (
              res?.data?.verify_details?.is_email_verified &&
              res?.data?.verify_details?.is_phone_verified
            ) {
              if (
                paramsData &&
                paramsData?.data &&
                paramsData?.data?.formCart
              ) {
                navigation.goBack();
              } else {
                navigation.push(navigationStrings.TAB_ROUTES);
              }
            }
          } else if (res?.data?.client_preference?.verify_email) {
            if (res?.data?.verify_details?.is_email_verified) {
              if (
                paramsData &&
                paramsData?.data &&
                paramsData?.data?.formCart
              ) {
                navigation.goBack();
              } else {
                navigation.push(navigationStrings.TAB_ROUTES);
              }
            }
          } else if (res?.data?.client_preference?.verify_phone) {
            if (res?.data?.verify_details?.is_phone_verified) {
              if (
                paramsData &&
                paramsData?.data &&
                paramsData?.data?.formCart
              ) {
                navigation.goBack();
              } else {
                navigation.push(navigationStrings.TAB_ROUTES);
              }
            }
          }
        }
        updateState({isLoading: false});
      })
      .catch(errorMethod);
  };

  const errorMethod = (error) => {
    updateState({isLoading: false});
    showError(error?.message || error?.error);
  };

  //On change textinput
  const _onChangeText = (key) => (val) => {
    updateState({[key]: val});
  };

  const onclickSaveAndSend = (type, editable) => {
    if (type == 'email') {
      // alert('21');
      if (editable) {
        updateState({editableEmail: false});
        sendOTP(type);
      } else {
        updateState({editableEmail: true});
      }
    }
    if (type == 'phone') {
      if (editable) {
        updateState({editablePhone: false});
        sendOTP(type);
      } else {
        updateState({editablePhone: true});
      }
    }
  };

  const otpView = (type, value) => {
    return (
      <SmoothPinCodeInput
        containerStyle={{
          alignSelf: 'center',
          marginTop: moderateScale(20),
        }}
        // password
        mask={
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 25,
              backgroundColor: 'blue',
            }}></View>
        }
        cellSize={width / 10}
        codeLength={6}
        cellSpacing={10}
        editable={true}
        cellStyle={{
          borderWidth: 1,
          borderRadius: 10,
          borderColor: 'gray',
        }}
        cellStyleFocused={{
          borderColor: 'black',
        }}
        textStyle={{
          fontSize: 24,
          color: colors.textBlue,
        }}
        textStyleFocused={{
          color: colors.textBlue,
        }}
        // autoCapitalize={'none'}
        inputProps={{
          autoCapitalize: 'none',
        }}
        value={type}
        autoFocus={false}
        keyboardType={'numeric'}
        onTextChange={(val) => updateState({[value]: val})}
        // onFulfill={(code) => onVerify(type, code)}
      />
    );
  };
  const _onCountryChange = (data) => {
    updateState({countryPickerModalVisible: false});
    onCountryChange(data);
  };
  const _openCountryPicker = () => {
    updateState({countryPickerModalVisible: true});
  };
  const _onCountryPickerModalClose = () => {
    updateState({countryPickerModalVisible: false});
  };

  const onCountryChange = (data) => {
    updateState({cca2: data.cca2, callingCode: data.callingCode[0]});
    return;
  };

  return (
    <WrapperContainer
      isLoadingB={isLoading}
      source={loaderOne}
      bgColor={isDarkMode ? MyDarkTheme.colors.background : colors.white}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack(null)}
          style={{alignSelf: 'flex-start'}}>
          <Image
            source={
              appStyle?.homePageLayout === 3
                ? imagePath.icBackb
                : imagePath.back
            }
            style={
              isDarkMode
                ? {
                    transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                    tintColor: MyDarkTheme.colors.text,
                  }
                : {transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]}
            }
          />
        </TouchableOpacity>
        {!!(
          paramsData &&
          paramsData?.data &&
          paramsData?.data?.formCart
        ) ? null : (
          <TouchableOpacity
            // onPress={() => navigation.push(navigationStrings.TAB_ROUTES)}>
            onPress={() => {
              // console.log(route.params.data.data);
              checkIsAdmin(navigation_, navigation, route.params.data.data);
              // navigation.push(navigationStrings.TAB_ROUTES)
            }}>
            <Text style={styles.skipText}>{strings.SKIP}</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!countryPickerModalVisible && (
        <CountryPicker
          cca2={cca2}
          visible={countryPickerModalVisible}
          withFlagButton={false}
          withFilter
          onClose={_onCountryPickerModalClose}
          onSelect={_onCountryChange}
          closeButtonImage={imagePath.closeButton}
          withCallingCode={callingCode}
        />
      )}
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{
          flex: 1,
        }}>
        <View style={{flex: 1}}>
          {!!userData?.client_preference?.verify_email ? (
            !userData?.verify_details?.is_email_verified && (
              <>
                <View
                  style={{
                    marginVertical: moderateScaleVertical(20),
                    marginHorizontal: moderateScale(20),
                  }}>
                  <Text
                    style={
                      isDarkMode
                        ? [styles.header, {color: MyDarkTheme.colors.text}]
                        : styles.header
                    }>
                    {strings.VERIFY_EMAIL_ADDRESS}
                  </Text>
                  <Text
                    style={
                      isDarkMode
                        ? [styles.txtSmall, {color: MyDarkTheme.colors.text}]
                        : styles.txtSmall
                    }>
                    {strings.ENTER_CODE_SENT_TO_EMAIL}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: moderateScale(20),
                    marginHorizontal: moderateScale(20),
                  }}>
                  <View style={styles.inputContainer}>
                    <View
                      style={
                        isDarkMode
                          ? [
                              styles.textInputContainer,
                              {
                                backgroundColor: editableEmail
                                  ? colors.white
                                  : '#EBEBEB',
                              },
                            ]
                          : [
                              styles.textInputContainer,
                              {
                                backgroundColor: editableEmail
                                  ? colors.white
                                  : '#EBEBEB',
                              },
                            ]
                      }>
                      <TextInput
                        editable={editableEmail}
                        selectionColor={colors.black}
                        placeholder={strings.YOUR_EMAIL}
                        placeholderTextColor={colors.textGreyOpcaity7}
                        style={styles.textInputField}
                        // ref={inputRef}
                        // numberOfLines
                        autoCapitalize={'none'}
                        keyboardType={'email-address'}
                        blurOnSubmit
                        onChangeText={_onChangeText('email')}
                        value={email}
                      />
                    </View>
                    <View
                      style={[
                        styles.editAndSendView,
                        {flex: editableEmail ? 0.35 : 0.2},
                      ]}>
                      <Text
                        onPress={() =>
                          onclickSaveAndSend('email', editableEmail)
                        }
                        style={{
                          textAlign: 'center',
                          fontFamily: fontFamily.medium,
                          fontSize: textScale(12),
                          color: themeColors.primary_color,
                        }}>
                        {editableEmail ? strings.SAVE_SEND : strings.EDIT}
                      </Text>
                    </View>
                  </View>
                  {otpView(emailOtp, 'emailOtp')}
                  <View style={{marginVertical: 10}}>
                    {timer > 0 ? (
                      <View style={styles.bottomContainer}>
                        <Text
                          style={{
                            ...styles.txtSmall,
                            color: colors.textGreyLight,
                          }}>
                          {strings.RESEND_CODE_IN}
                          <Text
                            style={{
                              color: themeColors.primary_color,
                              fontFamily: fontFamily.bold,
                            }}>
                            {`${otpTimerCounter(timer)} min`}
                          </Text>
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={
                          isDarkMode
                            ? [
                                styles.didintRecieveCode,
                                {color: MyDarkTheme.colors.text},
                              ]
                            : styles.didintRecieveCode
                        }>
                        {strings.DONT_RECEIVE_CODE}{' '}
                        <Text
                          onPress={() => resendOtpData('email')}
                          style={styles.resend}>
                          {strings.RESEND}
                        </Text>
                      </Text>
                    )}

                    <View style={styles.verifyView}>
                      <TouchableOpacity
                        style={[
                          styles.btnPhoneSecond,
                          {
                            backgroundColor: !userData?.verify_details
                              ?.is_email_verified
                              ? themeColors.primary_color
                              : colors.white,
                          },
                        ]}
                        onPress={() => onVerify('email', emailOtp)}>
                        {/* onPress={() => sendOTP('email')}> */}
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.phonebtnText,
                            {
                              color: !userData?.verify_details
                                ?.is_email_verified
                                ? colors.white
                                : colors.green,
                            },
                          ]}>
                          {!userData?.verify_details?.is_email_verified
                            ? strings.VERIFY_CAPITAL
                            : strings.VERIFIED}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </>
            )
          ) : (
            <View />
          )}

          {!!userData?.client_preference?.verify_phone ? (
            !userData?.verify_details?.is_phone_verified && (
              <>
                <View
                  style={{
                    marginTop: moderateScaleVertical(40),
                    marginHorizontal: moderateScale(20),
                  }}>
                  <Text
                    style={
                      isDarkMode
                        ? [styles.header, {color: MyDarkTheme.colors.text}]
                        : styles.header
                    }>
                    {strings.VERIFY_PHONE_NUMBER}
                  </Text>
                  <Text
                    style={
                      isDarkMode
                        ? [styles.txtSmall, {color: MyDarkTheme.colors.text}]
                        : styles.txtSmall
                    }>
                    {strings.ENTER_CODE_SENT_TO_MOBILE}
                  </Text>
                </View>
                <View
                  style={{
                    marginHorizontal: moderateScale(20),
                    marginTop: moderateScale(20),
                  }}>
                  <View style={styles.inputContainer}>
                    <View
                      style={[
                        styles.textInputContainer,
                        {
                          backgroundColor: editablePhone
                            ? colors.white
                            : '#EBEBEB',
                        },
                      ]}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: moderateScale(60),
                        }}
                        onPress={() => _openCountryPicker()}>
                        <Text
                          style={{
                            fontFamily: fontFamily.medium,
                            color: colors.textGreyOpcaity7,
                            marginStart: 2,
                          }}>
                          +{callingCode}
                        </Text>

                        <View style={{marginRight: moderateScale(-10)}}>
                          <Flag countryCode={cca2} />
                        </View>

                        <Image source={imagePath.dropdownTriangle} />
                      </TouchableOpacity>
                      <TextInput
                        editable={editablePhone}
                        keyboardType="numeric"
                        selectionColor={colors.black}
                        placeholder={strings.PHONE_NUMBER}
                        placeholderTextColor={colors.textGreyOpcaity7}
                        style={styles.textInputField}
                        // ref={inputRef}
                        // numberOfLines
                        blurOnSubmit
                        onChangeText={_onChangeText('phoneNumber')}
                        value={phoneNumber}
                      />
                    </View>
                    <View
                      style={[
                        styles.editAndSendView,
                        {flex: editablePhone ? 0.35 : 0.2},
                      ]}>
                      <Text
                        onPress={() =>
                          onclickSaveAndSend('phone', editablePhone)
                        }
                        style={{
                          textAlign: 'center',
                          fontFamily: fontFamily.medium,
                          fontSize: textScale(12),
                          color: themeColors.primary_color,
                        }}>
                        {editablePhone ? 'Save & Send' : 'Edit'}
                      </Text>
                    </View>
                  </View>
                  {otpView(phoneOtp, 'phoneOtp')}
                  <View style={{marginVertical: 10}}>
                    {timer2 > 0 ? (
                      <Text
                        style={{
                          ...styles.txtSmall,
                          color: colors.textGreyLight,
                        }}>
                        {strings.RESEND_CODE_IN}
                        <Text
                          style={{
                            color: themeColors.primary_color,
                            fontFamily: fontFamily.bold,
                          }}>
                          {`${otpTimerCounter(timer2)} min`}
                        </Text>
                      </Text>
                    ) : (
                      <Text
                        style={
                          isDarkMode
                            ? [
                                styles.didintRecieveCode,
                                {color: MyDarkTheme.colors.text},
                              ]
                            : styles.didintRecieveCode
                        }>
                        {strings.DONT_RECEIVE_CODE}{' '}
                        <Text
                          onPress={() => resendOtpData('phone')}
                          style={styles.resend}>
                          {strings.RESEND}
                        </Text>
                      </Text>
                    )}

                    <View style={styles.verifyView}>
                      <TouchableOpacity
                        style={[
                          styles.btnPhoneSecond,
                          {
                            backgroundColor: !userData?.verify_details
                              ?.is_phone_verified
                              ? themeColors.primary_color
                              : colors.white,
                          },
                        ]}
                        onPress={() => onVerify('phone', phoneOtp)}>
                        {/* onPress={() => sendOTP('phone')}> */}
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.phonebtnText,
                            {
                              color: !userData?.verify_details
                                ?.is_phone_verified
                                ? colors.white
                                : colors.green,
                            },
                          ]}>
                          {!userData?.verify_details?.is_phone_verified
                            ? strings.VERIFY_CAPITAL
                            : strings.VERIFIED}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </>
            )
          ) : (
            <View></View>
          )}

          <View style={{height: 50}} />
        </View>
      </KeyboardAwareScrollView>
    </WrapperContainer>
  );
}
