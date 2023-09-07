import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { cloneDeep, isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  I18nManager,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNRestart from 'react-native-restart';

import { useDarkMode } from 'react-native-dynamic';
import DeviceInfo from 'react-native-device-info';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSelector } from 'react-redux';
import BorderTextInput from '../../Components/BorderTextInput';
import ButtonComponent from '../../Components/ButtonComponent';
import TransparentButtonWithTxtAndIcon from '../../Components/ButtonComponent';
import GradientButton from '../../Components/GradientButton';
import { loaderOne } from '../../Components/Loaders/AnimatedLoaderFiles';
import PhoneNumberInput from '../../Components/PhoneNumberInput';
import WrapperContainer from '../../Components/WrapperContainer';
import imagePath from '../../constants/imagePath';
import strings, { changeLaguage } from '../../constants/lang';
import { resetStackAndNavigate } from '../../navigation/NavigationService';
import navigationStrings from '../../navigation/navigationStrings';
import actions from '../../redux/actions';
import colors from '../../styles/colors';
import {
  moderateScale,
  moderateScaleVertical,
} from '../../styles/responsiveSize';
import { MyDarkTheme } from '../../styles/theme';
import { enums } from '../../utils/enums';
import { showError } from '../../utils/helperFunctions';
import {
  fbLogin,
  googleLogin,
  handleAppleLogin,
  _twitterSignIn,
} from '../../utils/socialLogin';
import { checkIsAdmin, setItem } from '../../utils/utils';
import validator from '../../utils/validations';
import stylesFunc from './styles';
import LanguageModal from '../../Components/LanguageModal';
import Header from '../../Components/Header';

export default function Login({ navigation }) {
  const navigation_ = useNavigation();
  const { appData, themeColors, currencies, languages, appStyle } = useSelector(
    (state) => state?.initBoot,
  );
  const { apple_login, fb_login, twitter_login, google_login } = useSelector(
    (state) => state?.initBoot?.appData?.profile?.preferences,
  );
  const theme = useSelector((state) => state?.initBoot?.themeColor);
  const toggleTheme = useSelector((state) => state?.initBoot?.themeToggle);
  const darkthemeusingDevice = useDarkMode();
  const isDarkMode = toggleTheme ? darkthemeusingDevice : theme;
  var clonedState = {};

  const [state, setState] = useState({
    // email: '',
    password: '',
    isLoading: false,
    phoneInput: false,
    phoneNoVisibility: false,
    phoneNumber: '',
    email: {
      value: '',
      focus: true,
    },
    mobilNo: {
      phoneNo: '',
      callingCode: !!appData?.profile.country?.phonecode
        ? appData?.profile?.country?.phonecode
        : '91',
      cca2: !!appData?.profile?.country?.code
        ? appData?.profile?.country?.code
        : 'IN',
      focus: false,
      countryName: '',
      isShowPassword: false,
      getLanguage: '',
      isLoading: false,
      isSelectLanguageModal: false,
      isLangSelected: false,
      allLangs: [],
    },
  });

  const fontFamily = appStyle?.fontSizeData;
  //CLone deep all the states
  useEffect(() => {
    clonedState = cloneDeep(state);
  }, []);
  console.log(languages, 'languageslanguageslanguages')
  //Update states
  const updateState = (data) => setState((state) => ({ ...state, ...data }));
  //Styles in app
  const styles = stylesFunc({ themeColors, fontFamily });

  //all states used in this screen
  const {
    password,
    isLoading,
    phoneInput,
    phoneNoVisibility,
    mobilNo,
    email,
    number,
    isShowPassword,
    getLanguage,
    // isLoading,
    isSelectLanguageModal,
    isLangSelected,
    allLangs,
  } = state;

  //Naviagtion to specific screen
  const moveToNewScreen = (screenName, data) => () => {
    navigation.navigate(screenName, { data });
  };
  //On change textinput
  const _onChangeText = (key) => (val) => {
    updateState({ [key]: val });
  };

  //Validate form
  const isValidData = () => {
    const error = email.focus
      ? validator({ email: email.value, password })
      : validator({
        phoneNumber: mobilNo.phoneNo,
        callingCode: mobilNo.callingCode,
      });
    if (error) {
      showError(error);
      return;
    }
    return true;
  };

  const checkIfEmailVerification = (_data) => {
    if (
      !!_data?.client_preference?.verify_email ||
      !!_data?.client_preference?.verify_phone
    ) {
      if (
        !_data?.verify_details?.is_email_verified &&
        !!_data?.client_preference?.verify_email
      ) {
        moveToNewScreen(navigationStrings.VERIFY_ACCOUNT, {
          data: _data,
        })();
      } else if (
        !_data?.verify_details?.is_phone_verified &&
        !!_data?.client_preference?.verify_phone
      ) {
        moveToNewScreen(navigationStrings.VERIFY_ACCOUNT, {
          data: _data,
        })();
      } else {
        checkIsAdmin(navigation_, navigation, _data);
      }
    } else {
      checkIsAdmin(navigation_, navigation, _data);
    }
  };

  const _onLoginVendor = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');

    const checkValid = isValidData();
    if (!checkValid) {
      return;
    }

    let data = {
      email: email.focus ? email.value : mobilNo.phoneNo,
      password: password,
      device_type: Platform.OS,
      device_token: DeviceInfo.getUniqueId(),
      fcm_token: !!fcmToken ? fcmToken : DeviceInfo.getUniqueId(),
      dialCode: mobilNo.focus ? mobilNo.callingCode : '',
      countryData: mobilNo.focus ? mobilNo.cca2 : '',
      is_vendor_app: 1,
    };
    updateState({ isLoading: true });
    console.log('chck login data >>>', data);
    actions
      .VendorLoginUsername(data, {
        code: appData?.profile?.code,
        currency: currencies?.primary_currency?.id,
        language: languages?.primary_language?.id,
        systemuser: DeviceInfo.getUniqueId(),
      })
      .then((res) => {
        console.log(res, "resLoginnnnnnn")
        if (!!res.data) {
          if (!!res?.data?.is_phone) {
            navigation.navigate(navigationStrings.OTP_VERIFICATION, {
              username: mobilNo?.phoneNo,
              dialCode: mobilNo?.callingCode,
              countryData: mobilNo?.cca2,
              data: res.data,
            });
          }
          else {
            resetStackAndNavigate(
              navigation_,
              navigationStrings.TABROUTESVENDORNEW,
            );
          }
          // checkIsAdmin(navigation_, navigation, res.data);

        }
        updateState({ isLoading: false });
        // getCartDetail();
      })
      .catch(errorMethod);
  };


  useEffect(() => {
    if (!isEmpty(languages)) {
      console.log('hihihii')
      const all_languages = [...languages?.all_languages];

      all_languages?.forEach((itm, indx) => {
        if (languages?.primary_language?.id === itm?.id) {
          all_languages[indx].isActive = true;
          updateState({
            allLangs: [...all_languages],
          });
        } else {
          all_languages[indx].isActive = false;
          updateState({
            allLangs: [...all_languages],
          });
        }
      });
    }
  }, []);

  //Login api fucntion
  const _onLogin = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');

    const checkValid = isValidData();
    if (!checkValid) {
      return;
    }

    let data = {
      username: email.focus ? email.value : mobilNo.phoneNo,
      password: password,
      device_type: Platform.OS,
      device_token: DeviceInfo.getUniqueId(),
      fcm_token: !!fcmToken ? fcmToken : DeviceInfo.getUniqueId(),
      dialCode: mobilNo.focus ? mobilNo.callingCode : '',
      countryData: mobilNo.focus ? mobilNo.cca2 : '',
    };
    updateState({ isLoading: true });
    console.log('chck login data >>>', data);
    actions
      .loginUsername(data, {
        code: appData?.profile?.code,
        currency: currencies?.primary_currency?.id,
        language: languages?.primary_language?.id,
        systemuser: DeviceInfo.getUniqueId(),
      })
      .then((res) => {
        console.log(res, "resssloginnn")
        if (!!res.data) {

          res.data.is_phone
            ? navigation.navigate(navigationStrings.OTP_VERIFICATION, {
              username: mobilNo?.phoneNo,
              dialCode: mobilNo?.callingCode,
              countryData: mobilNo?.cca2,
              data: res.data,
            })
            : checkIfEmailVerification(res.data);
        }
        updateState({ isLoading: false });
        getCartDetail();
      })
      .catch(errorMethod);
  };

  //Get your cart detail
  const getCartDetail = () => {
    actions
      .getCartDetail(
        {},
        {
          code: appData?.profile?.code,
          currency: currencies?.primary_currency?.id,
          language: languages?.primary_language?.id,
          systemuser: DeviceInfo.getUniqueId(),
        },
      )
      .then((res) => {
        actions.cartItemQty(res);
      })
      .catch((error) => { });
  };
  //Error handling in api
  const errorMethod = (error) => {
    console.log(error, 'error>error11111');


    updateState({ isLoading: false });
    if (error?.data && !error?.data?.user_exists) {
      Alert.alert('', error?.message, [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          // style: 'destructive',
        },
        {
          text: 'Signup',
          onPress: () => navigation.navigate(navigationStrings.SIGN_UP),
        },
      ]);
    } else {
      showError(error?.error || error?.message || error?.error || error);
      // setTimeout(() => {
      //   showError(error?.message || error?.error || error);
      // }, 500);
    }
  };

  //Saving login user to backend
  const _saveSocailLogin = async (socialLoginData, type) => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    let data = {};
    data['name'] =
      socialLoginData?.name ||
      socialLoginData?.userName ||
      socialLoginData?.fullName?.givenName;
    data['auth_id'] =
      socialLoginData?.id ||
      socialLoginData?.userID ||
      socialLoginData?.identityToken;
    data['phone_number'] = '';
    data['email'] = socialLoginData?.email;
    data['device_type'] = Platform.OS;
    data['device_token'] = DeviceInfo.getUniqueId();
    data['fcm_token'] = !!fcmToken ? fcmToken : DeviceInfo.getUniqueId();
    data['is_vendor_app'] = 1;

    let query = '';
    if (
      type == 'facebook' ||
      type == 'twitter' ||
      type == 'google' ||
      type == 'apple'
    ) {
      query = type;
    }
    actions
      .socailLogin(`/${query}`, data, {
        code: appData?.profile?.code,
        currency: currencies?.primary_currency?.id,
        language: languages?.primary_language?.id,
        systemuser: DeviceInfo.getUniqueId(),
      })
      .then((res) => {
        console.log(res, 'res>>>SOCIAL');
        if (!!res.data) {
          !!res.data?.client_preference?.verify_email ||
            !!res.data?.client_preference?.verify_phone
            ? !!res.data?.verify_details?.is_email_verified &&
              !!res.data?.verify_details?.is_phone_verified
              ? checkIsAdmin()
              : moveToNewScreen(navigationStrings.VERIFY_ACCOUNT, {})()
            : checkIsAdmin();
        }
        updateState({ isLoading: false });
        getCartDetail();
      })
      .catch(errorMethod);
  };

  //Apple Login Support
  const openAppleLogin = () => {
    updateState({ isLoading: false });
    handleAppleLogin()
      .then((res) => {
        _saveSocailLogin(res, 'apple');
        // updateState({isLoading: false});
      })
      .catch((err) => {
        updateState({ isLoading: false });
      });
  };

  //Gmail Login Support
  const openGmailLogin = () => {
    updateState({ isLoading: true });
    googleLogin()
      .then((res) => {
        console.log(res, 'google');
        if (res?.user) {
          _saveSocailLogin(res.user, 'google');
        } else {
          updateState({ isLoading: false });
        }
      })
      .catch((err) => {
        console.log(err, 'error in gmail login');
        updateState({ isLoading: false });
      });
  };
  const _responseInfoCallback = (error, result) => {
    updateState({ isLoading: true });
    if (error) {
      updateState({ isLoading: false });
    } else {
      if (result && result?.id) {
        console.log(result, 'fbresult');
        _saveSocailLogin(result, 'facebook');
      } else {
        updateState({ isLoading: false });
      }
    }
  };
  //FacebookLogin
  const openFacebookLogin = () => {
    fbLogin(_responseInfoCallback);
  };

  //twitter login
  const openTwitterLogin = () => {
    _twitterSignIn()
      .then((res) => {
        if (res) {
          _saveSocailLogin(res, 'twitter');
        }
      })
      .catch((err) => { });
  };
  const _onCountryChange = (data) => {
    updateState({
      mobilNo: {
        phoneNo: mobilNo.phoneNo,
        cca2: data.cca2,
        callingCode: data.callingCode.toString(),
        focus: true,
      },
      // cca2: data.cca2,
      // callingCode: data.mobilNo.callingCode[0],
    });
    return;
  };

  const selectedLangTitle = !isEmpty(allLangs) ? allLangs.find((itm) => itm.isActive === true) : {};
  // const selectedLangTitle ={}
  const _onBackdropPress = () => {
    updateState({ isSelectLanguageModal: false });
  };
  const _selectLang = () => {
    updateState({ isSelectLanguageModal: true });
  };
  const _onLangSelect = (item, indx) => {
    const langs = [...allLangs];
    langs.forEach((item, index) => {
      if (index === indx) {
        langs[index].isActive = true;
        updateState({
          allLangs: [...langs],
        });
      } else {
        langs[index].isActive = false;
        updateState({
          allLangs: [...langs],
        });
      }
    });
  };

  const onSubmitLang = async (lang, languagesData) => {
    if (lang == '') {
      showAlertMessageError(strings.SELECT);
      return;
    } else {
      if (lang === 'ar' || lang === 'he') {
        I18nManager.forceRTL(true);
        setItem('language', lang);
        changeLaguage(lang);
        RNRestart.Restart();
      } else {
        I18nManager.forceRTL(false);
        setItem('language', lang);
        changeLaguage(lang);
        RNRestart.Restart();
      }
    }
  };
  useEffect(() => {
    getListOfAllCmsLinks()
  }, [])
  const getListOfAllCmsLinks = () => {
    actions
      .getListOfAllCmsLinks(
        {},
        {
          code: appData?.profile?.code,
          currency: currencies?.primary_currency?.id,
          language: languages?.primary_language?.id,
        },
      )
      .then((res) => {
        console.log('All Cms links', res);
        updateState({ isLoadingB: false, isLoading: false, isRefreshing: false });
        if (res && res?.data) {
          updateState({ cmsLinks: res?.data });
        }
      })
      .catch(errorMethod);
  };


  const vendorRegistartion = () => {
    navigation.navigate(navigationStrings.WEBLINKS, {
      id: 10,
      slug: "inscribe-tu-negocio",
      title: "Vendor Registration"
    })
  }

  const updateLanguage = (item) => {
    const data = languages?.all_languages?.filter((x) => x.id == item.id)[0];

    if (data.sort_code !== languages?.primary_language.sort_code) {
      let languagesData = {
        ...languages,
        primary_language: data,
      };

      // updateState({isLoading: true});
      setItem('setPrimaryLanguage', languagesData);
      setTimeout(() => {
        actions.updateLanguage(data);
        onSubmitLang(data.sort_code, languagesData);
      }, 1000);
    }
  };
  const _updateLang = (selectedLangTitle) => {
    updateState({ isSelectLanguageModal: false });
    updateLanguage(selectedLangTitle);
  };
  /*************************** Check Input Handler */
  const checkInputHandler = (data = '') => {
    let re = /^[0-9]{1,45}$/;
    let c = re.test(data);

    if (c) {
      updateState({
        phoneInput: true,
        mobilNo: {
          ...mobilNo,
          phoneNo: data,
          focus: true,
        },
        email: {
          ...email,
          focus: false,
        },
      });
    } else {
      updateState({
        phoneInput: false,
        email: {
          value: data,
          focus: true,
        },
        mobilNo: {
          ...mobilNo,
          focus: false,
        },
      });
    }
  };

  /*************************** On Text Change
   */ const textChangeHandler = (type, data, value = 'value') => {
    updateState((preState) => {
      return {
        [type]: {
          ...preState[type],
          [value]: data,
        },
      };
    });
  };

  const showHidePassword = () => {
    updateState({ isShowPassword: !isShowPassword });
  };

  return (
    <WrapperContainer
      isLoadingB={isLoading}
      source={loaderOne}
      bgColor={isDarkMode ? MyDarkTheme.colors.background : colors.white}>
      <Header
        rightViewStyle={{ flex: 0.1 }}
        noLeftIcon={true}
        // leftIcon={imagePath.icBackb}
        // centerTitle={'Vendor Scheduling'}
        righttextview={{ flex: 0.28 }}
        headerStyle={
          {

            shadowColor: colors.greyColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 4,
            backgroundColor: colors.white,
            elevation: 8,
            backgroundColor: isDarkMode ? MyDarkTheme.colors.background : colors.white
          }
        }
        isRightText
        rightTxt={
          !!selectedLangTitle
            ? selectedLangTitle.sort_code
            : 'en'
        }
        rightTxtContainerStyle={{
          backgroundColor: themeColors.primary_color,
          height: moderateScale(30),
          width: moderateScale(30),
          borderRadius: moderateScale(30),
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPressRightTxt={_selectLang}
        rightTxtStyle={{ color: colors.white, textTransform: 'uppercase' }}
      />
      {/* <View style={styles.headerContainer}>
        {!enums.isVendorStandloneApp && (
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
        )}
      </View> */}
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{
          flex: 1,
          marginHorizontal: moderateScale(24),
        }}>
        <View style={{ height: moderateScaleVertical(28) }} />
        <Text
          style={
            isDarkMode
              ? [styles.header, { color: MyDarkTheme.colors.text }]
              : styles.header
          }>
          {strings.LOGIN_YOUR_ACCOUNT}
        </Text>

        <Text
          style={
            isDarkMode
              ? [styles.txtSmall, { color: MyDarkTheme.colors.text }]
              : styles.txtSmall
          }>
          {strings.ENTE_REGISTERED_EMAIL}
        </Text>
        <View style={{ height: moderateScaleVertical(30) }} />

        {!phoneInput && (
          <>
            <BorderTextInput
              onChangeText={(data) => checkInputHandler(data)}
              placeholder={strings.YOUR_EMAIL_PHONE}
              value={email.value}
              keyboardType={'email-address'}
              autoCapitalize={'none'}
              autoFocus={true}
            />
            <BorderTextInput
              onChangeText={_onChangeText('password')}
              placeholder={strings.ENTER_PASSWORD}
              value={password}
              secureTextEntry={isShowPassword ? false : true}
              rightIcon={
                password.length > 0
                  ? !isShowPassword
                    ? imagePath.icShowPassword
                    : imagePath.icHidePassword
                  : false
              }
              onPressRight={showHidePassword}
              isShowPassword={isShowPassword}
              rightIconStyle={{}}
            />
          </>
        )}
        {phoneInput && (
          <View style={{ marginBottom: moderateScale(18) }}>
            <PhoneNumberInput
              onCountryChange={_onCountryChange}
              onChangePhone={(data) => checkInputHandler(data)}
              cca2={mobilNo.cca2}
              phoneNumber={mobilNo.phoneNo}
              callingCode={mobilNo.callingCode}
              placeholder={strings.YOUR_PHONE_NUMBER}
              keyboardType={'phone-pad'}
              color={isDarkMode ? MyDarkTheme.colors.text : null}
              autoFocus={true}
            />
          </View>
        )}

        <View style={styles.forgotContainer}>
          <Text
            onPress={moveToNewScreen(navigationStrings.FORGOT_PASSWORD)}
            style={{
              fontFamily: fontFamily.bold,
              color: themeColors.primary_color,
            }}>
            {' '}
            {strings.FORGOT}
          </Text>
        </View>
        <ButtonComponent
          btnText={strings.LOGIN_ACCOUNT}
          containerStyle={{ marginTop: moderateScaleVertical(10), backgroundColor: themeColors.primary_color }}
          onPress={_onLoginVendor}
        />

        <View style={{ marginTop: moderateScaleVertical(40) }}>

          <ButtonComponent
            btnText={strings.REGISTER_YOUR_BUSINESS}
            containerStyle={{ marginTop: moderateScaleVertical(10), backgroundColor: themeColors.primary_color }}
            onPress={vendorRegistartion}
          />
        </View>
        {/* <GradientButton
          containerStyle={{marginTop: moderateScaleVertical(10)}}
          onPress={ _onLoginVendor }
          btnText={strings.LOGIN_ACCOUNT}
        /> */}
        {/* <View style={{marginTop: moderateScaleVertical(30)}}>
          {(!!google_login || !!fb_login || !!twitter_login || !!apple_login) &&
          !enums.isVendorStandloneApp ? (
            <View style={styles.socialRow}>
              <View style={styles.hyphen} />
              <Text
                style={
                  isDarkMode
                    ? [styles.orText, {color: MyDarkTheme.colors.text}]
                    : styles.orText
                }>
                {strings.OR_LOGIN_WITH}
              </Text>
              <View style={styles.hyphen} />
            </View>
          ) : null}
          <View
            style={{
              flexDirection: 'column',
            }}>
            {!!google_login && !enums.isVendorStandloneApp && (
              <View style={{marginTop: moderateScaleVertical(15)}}>
                <TransparentButtonWithTxtAndIcon
                  icon={imagePath.ic_google2}
                  btnText={strings.CONTINUE_GOOGLE}
                  containerStyle={{
                    backgroundColor: isDarkMode
                      ? MyDarkTheme.colors.lightDark
                      : colors.white,
                    borderColor: colors.borderColorD,
                    borderWidth: 1,
                  }}
                  textStyle={{
                    color: isDarkMode ? colors.white : colors.textGreyB,
                    marginHorizontal: moderateScale(15),
                  }}
                  onPress={() => openGmailLogin()}
                />
              </View>
            )}
            {!!fb_login && !enums.isVendorStandloneApp && (
              <View style={{marginTop: moderateScaleVertical(15)}}>
                <TransparentButtonWithTxtAndIcon
                  icon={imagePath.ic_fb2}
                  btnText={strings.CONTINUE_FACEBOOK}
                  containerStyle={{
                    backgroundColor: isDarkMode
                      ? MyDarkTheme.colors.lightDark
                      : colors.white,
                    borderColor: colors.borderColorD,
                    borderWidth: 1,
                  }}
                  textStyle={{
                    color: isDarkMode ? colors.white : colors.textGreyB,
                    marginHorizontal: moderateScale(5),
                  }}
                  onPress={() => openFacebookLogin()}
                />
              </View>
            )}
            {!!twitter_login && !enums.isVendorStandloneApp && (
              <View style={{marginTop: moderateScaleVertical(15)}}>
                <TransparentButtonWithTxtAndIcon
                  icon={imagePath.ic_twitter2}
                  btnText={strings.CONTINUE_TWITTER}
                  containerStyle={{
                    backgroundColor: isDarkMode
                      ? MyDarkTheme.colors.lightDark
                      : colors.white,
                    borderColor: colors.borderColorD,
                    borderWidth: 1,
                  }}
                  textStyle={{
                    color: isDarkMode ? colors.white : colors.textGreyB,
                    marginHorizontal: moderateScale(10),
                  }}
                  nPress={() => openTwitterLogin()}
                />
              </View>
            )}

            {!!apple_login &&
              !enums.isVendorStandloneApp &&
              Platform.OS == 'ios' && (
                <View style={{marginVertical: moderateScaleVertical(15)}}>
                  <TransparentButtonWithTxtAndIcon
                    icon={isDarkMode ? imagePath.ic_apple : imagePath.ic_apple2}
                    btnText={strings.CONTINUE_APPLE}
                    containerStyle={{
                      backgroundColor: isDarkMode
                        ? MyDarkTheme.colors.lightDark
                        : colors.white,
                      borderColor: colors.borderColorD,
                      borderWidth: 1,
                    }}
                    textStyle={{
                      color: isDarkMode ? colors.white : colors.textGreyB,
                      marginHorizontal: moderateScale(17),
                    }}
                    onPress={() => openAppleLogin()}
                  />
                </View>
              )}
          </View>
        </View> */}
        {/* {!enums.isVendorStandloneApp && (
          <View style={styles.bottomContainer}>
            <Text
              style={
                isDarkMode
                  ? {...styles.txtSmall, color: MyDarkTheme.colors.text}
                  : {...styles.txtSmall, color: colors.textGreyLight}
              }>
              {strings.DONT_HAVE_ACCOUNT}
              <Text
                onPress={moveToNewScreen(navigationStrings.SIGN_UP)}
                style={{
                  fontFamily: fontFamily.bold,
                  color: themeColors.primary_color,
                }}>
                {' '}
                {strings.SIGN_UP}
              </Text>
            </Text>
          </View>
        )} */}
        {isSelectLanguageModal && (
          <LanguageModal
            isSelectLanguageModal={isSelectLanguageModal}
            onBackdropPress={_onBackdropPress}
            _onLangSelect={_onLangSelect}
            isLangSelected={isLangSelected}
            allLangs={allLangs}
            _updateLang={_updateLang}
          />
        )}
      </KeyboardAwareScrollView>

    </WrapperContainer>
  );
}
