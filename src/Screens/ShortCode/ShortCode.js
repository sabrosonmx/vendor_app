import React, { useEffect, useState } from 'react';
import { Image, Linking, Text, View } from 'react-native';
import { getBundleId } from 'react-native-device-info';
import { MaterialIndicator } from 'react-native-indicators';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import { useSelector } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import ButtonWithLoader from '../../Components/ButtonWithLoader';
import WrapperContainer from '../../Components/WrapperContainer';
import imagePath from '../../constants/imagePath';
import strings from '../../constants/lang';
import * as NavigationService from '../../navigation/NavigationService';
import navigationStrings from '../../navigation/navigationStrings';
import actions from '../../redux/actions';
import store from '../../redux/store';
import colors from '../../styles/colors';
import {
  moderateScale,
  moderateScaleVertical,
  width,
} from '../../styles/responsiveSize';
import { appIds, shortCodes } from '../../utils/constants/DynamicAppKeys';
import { enums } from '../../utils/enums';
import { getUrlRoutes, showError } from '../../utils/helperFunctions';
import { getItem, setItem } from '../../utils/utils';
import styles from './styles';

const fs = RNFetchBlob.fs;

export default function ShortCode({ route, navigation }) {
  const shortCodeParam = route?.params?.shortCodeParam;
  // alert(shortCodeParam)
  const [state, setState] = useState({
    email: '',
    password: '',
    shortCode: '',
    isShortcodePrefilled: true,
    isBtnDisabled: true,
    isLoading: false,
    changeInShortCode: false,
    LoadingScreen: true,
  });
  const { dispatch } = store;

  const {
    shortCode,
    changeInShortCode,
    isBtnDisabled,
    isLoading,
    isShortcodePrefilled,
    LoadingScreen,
  } = state;
  const updateState = (data) => setState((state) => ({ ...state, ...data }));
  const { appData, appStyle, currencies, languages } = useSelector(
    (state) => state?.initBoot,
  );
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    console.log(getBundleId(), 'getBundleId()');

    (async () => {
      const saveShortCode = await getItem('saveShortCode');
      switch (getBundleId()) {       
          case appIds.sabroson:
          updateState({
            shortCode: shortCodes.sabroson,
            isShortcodePrefilled: true,
          });
          break;        
      }
    })();
  }, []);

  useEffect(() => {
    if (shortCode && isShortcodePrefilled) {
      checkScreen();
    }
  }, [shortCode, isShortcodePrefilled]);

  const checkScreen = () => {
    initApiHit();
    updateState({ isShortcodePrefilled: true });
  };

  const moveToNewScreen = (screenName, data) => () => {
    navigation.navigate(screenName, {});
  };

  //i did added in this fun signup page replace with tabroutes
  const _onSubmitShortCode = () => {
    updateState({ isLoading: true });
    setTimeout(() => {
      initApiHit();
    }, 1000);
  };

  const initApiHit = async () => {
    const res = await getItem('setPrimaryLanguage');

    console.log(res,'resresresres');
    let header = {};

    if (!!res?.primary_language?.id) {
      header = {
        //code: 'dda7d5',
        code: shortCode,
        language: res?.primary_language?.id,
      };
    } else {
      header = {
        //code: 'dda7d5',
        code: shortCode,
      };
    }

    actions
      .initApp({}, header, false, null, null, true)
      .then((res) => {
        console.log(res, '<====headerResponse');
        updateState({ changeInShortCode: false });
        homeData(res.data);
      })
      .catch((error) => {
        console.log(error, 'error>>>error>>error');

        updateState({
          isLoading: false,
          changeInShortCode: false,
          shortCode: '',
        });
        setTimeout(() => {
          showError(error?.message || error?.error);
        }, 500);
      });
  };

  //get home data

  //Home data

  async function handleDynamicLink(deepLinkUrl) {
    console.log('checking deep link >>> ', decodeURI(deepLinkUrl));
    if (deepLinkUrl != null) {
      setItem('deepLinkUrl', deepLinkUrl);
      let routeName = getUrlRoutes(deepLinkUrl, 1);
      var data = deepLinkUrl?.split('=').pop();
      console.log('checking deep link data >>> ', data);
      let removePer = decodeURI(data);
      let sendingData = JSON.parse(removePer);

      let decodedUri = decodeURI(deepLinkUrl);
      let vendorName = decodedUri.split('?')[1].split('&')[1].split('=')[1];
      let vendorId = decodedUri.split('?')[1].split('&')[0].split('=')[1];

      // return;
      setTimeout(() => {
        NavigationService.navigate(navigationStrings.TAB_ROUTES, {
          screen: navigationStrings.HOMESTACK,
          params: {
            screen: navigationStrings.PRODUCT_LIST,
            params: {
              data: {
                category_slug: 'Restaurants',
                id: vendorId,
                name: vendorName,
                vendor: true,
                table_id: sendingData,
              },
            },
          },
        });
      }, 1800);
    } else {
      navigation.push(navigationStrings.TAB_ROUTES);
    }
  }

  const handleNotiRedirectionForVendorApp = (deepLinkUrl) => {
    if (deepLinkUrl != null) {
      navigation.navigate(navigationStrings.TABROUTESVENDORNEW, {
        screen: navigationStrings.ROYO_VENDOR_ORDER,
        params: { index: 1 },
      });
    } else {
      navigation.navigate(navigationStrings.TABROUTESVENDORNEW);
    }
  };

  const navigateToNextScreen = (res, homeData) => {
    // return;
    if (enums.isVendorStandloneApp) {
      if (!!userData?.auth_token) {
        Linking.getInitialURL()
          .then((link) => {
            handleNotiRedirectionForVendorApp(link);
          })
          .catch((err) => {
            console.log('checking deep link >>> 3232sdsd', err);
          });
      } else {
        navigation.navigate(navigationStrings.LOGIN);
      }
    } else {
      getItem('firstTime').then((el) => {
        if (!el && res.dynamic_tutorial && res.dynamic_tutorial.length > 0) {
          navigation.push(navigationStrings.APP_INTRO, {
            images: res.dynamic_tutorial,
          });
        } else {
          // navigation.push(navigationStrings.TAB_ROUTES);
          Linking.getInitialURL()
            .then((link) => {
              handleDynamicLink(link);
            })
            .catch((err) => {
              console.log('checking deep link >>> 3232sdsd', err);
            });
        }
      });
    }
  };

  const homeData = (res) => {
    actions
      .homeData(
        {},
        {
          code: res?.profile?.code,
          currency: res?.currencies?.find((x) => x.is_primary).currency_id,
          language: res?.languages?.find((x) => x.is_primary).language_id,
        },
        true,
      )
      .then((homeData) => {
        updateState({ isLoading: false, LoadingScreen: false });
        navigateToNextScreen(res, homeData.data);
      })
      .catch((error) => {
        updateState({ isLoading: false });
        navigateToNextScreen(res, homeData.data);
      });
  };

  const onOtpInput = (code) => {
    (async () => {
      updateState({
        isLoading: true,
        shortCode: code,
        changeInShortCode: true,
      });
      //
    })();
  };

  useEffect(() => {
    (async () => {
      if (changeInShortCode) {
        const saveShortCode = await getItem('saveShortCode');
        if (saveShortCode && shortCode != saveShortCode) {
          actions.userLogout();
          actions.cartItemQty('');
          actions.saveAddress(null);
          actions.saveAllUserAddress([]);
        }
        initApiHit();
      }
    })();
  }, [changeInShortCode]);

  useEffect(() => {
    if (shortCode?.length === 6) {
      updateState({ isBtnDisabled: false });
    } else {
      updateState({ isBtnDisabled: true });
    }
  }, [shortCode, isLoading]);

  return (
    <WrapperContainer
      statusBarColor={colors.white}
      bgColor={colors.white}
      isLoadingB={isLoading}
    // source={loaderOne}
    >
      {isShortcodePrefilled ? (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              position: 'absolute',
              zIndex: 99,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: colors.grayOpacity51,
            }}>
            <View style={{ position: 'absolute', bottom: moderateScale(100) }}>
              {LoadingScreen && (
                <MaterialIndicator size={50} color={colors.greyMedium} />
              )}
            </View>
          </View>
          <Image source={{ uri: 'Splash' }} style={{ flex: 1, zIndex: -1 }} />
        </View>
      ) : (
        <View
          style={{
            paddingHorizontal: moderateScale(24),
            flex: 1,
            marginTop: width / 3,
          }}>
          <Image style={{ alignSelf: 'center' }} source={imagePath.logo} />
          <View style={{ height: moderateScaleVertical(50) }} />
          <Text style={styles.enterShortCode}>{strings.ENTER_SHORT_CODE}</Text>
          <View style={{ height: 10 }} />
          <Text style={styles.enterShortCode2}>
            {strings.ENTERSHORTCODEBELOW}
          </Text>

          <View style={{ height: 10 }} />

          <SmoothPinCodeInput
            containerStyle={{ alignSelf: 'center' }}
            password
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
              borderBottomWidth: 1,
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
            value={shortCode}
            autoFocus={false}
            keyboardType={'default'}
            onTextChange={(shortCode) => updateState({ shortCode })}
            onFulfill={(code) => onOtpInput(code)}
          />

          <View style={{ height: 20 }} />

          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <ButtonWithLoader
              // isLoading={isLoading}
              color={colors.black}
              disabled={isBtnDisabled}
              btnStyle={{
                ...styles.guestBtn,
                ...{
                  backgroundColor: isBtnDisabled
                    ? colors.blueBackGroudB
                    : colors.blueBackGroudB,
                },
              }}
              onPress={_onSubmitShortCode}
              btnText={strings.SUBMIT}
              btnTextStyle={{
                color: colors.white,
              }}
            />
          </View>

          <View style={{ height: 20 }} />
        </View>
        // </KeyboardAwareScrollView>
      )}

      {/* </ScrollView> */}
    </WrapperContainer>
  );
}
