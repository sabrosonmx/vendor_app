import { BluetoothManager } from '@brooons/react-native-bluetooth-escpos-printer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  I18nManager,
  Image, ScrollView, Text, View
} from 'react-native';
import { useDarkMode } from 'react-native-dynamic';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import RNRestart from 'react-native-restart';
import { useSelector } from 'react-redux';
import Header from '../../../Components/Header';
import { loaderOne } from '../../../Components/Loaders/AnimatedLoaderFiles';
import WrapperContainer from '../../../Components/WrapperContainer';
import imagePath from '../../../constants/imagePath';
import strings, { changeLaguage } from '../../../constants/lang/index';
import actions from '../../../redux/actions';
import colors from '../../../styles/colors';
import commonStylesFunc from '../../../styles/commonStyles';
import {
  moderateScale,
  moderateScaleVertical
} from '../../../styles/responsiveSize';
import { MyDarkTheme } from '../../../styles/theme';
import { setItem } from '../../../utils/utils';
import stylesFunc from './styles';

export default function Settings({ route, navigation }) {
  const {
    currencies,
    appData,
    languages,
    appStyle,
    themeColors,
    themeToggle,
    themeColor,
  } = useSelector((state) => state?.initBoot);
  const { userData } = useSelector((state) => state?.auth);
  const darkthemeusingDevice = useDarkMode();
  const isDarkMode = themeToggle ? darkthemeusingDevice : themeColor;
  console.log(languages, 'languageslanguageslanguages');
  const [state, setState] = useState({
    isLoading: false,
    country: 'uk',
    appCurrencies: currencies,
    appLanguages: languages,
  });

  const {
    isLoading,
    appCurrencies,
    appLanguages,
  } = state;

  const fontFamily = appStyle?.fontSizeData;
  const styles = stylesFunc({ fontFamily, themeColors });
  const commonStyles = commonStylesFunc({ fontFamily });

  useFocusEffect(
    React.useCallback(() => {
      updateState({
        appLanguages: languages,
      });
    }, [currencies, languages]),
  );


  //update state
  const updateState = (data) => setState((state) => ({ ...state, ...data }));

  //Update language
  const updateLanguage = (item) => {
    console.log(item, 'itemmmm');
    const data = languages.all_languages.filter((x) => x.id == item.id)[0];
    // console.log(data, "setLang")
    if (data.sort_code !== languages.primary_language.sort_code) {
      let languagesData = {
        ...languages,
        primary_language: data,
      };
      // updateState({isLoading: true});
      setItem('setPrimaryLanguage', languagesData);
      setTimeout(() => {
        updateState({ isLoading: false });
        actions.updateLanguage(data);
        onSubmitLang(data.sort_code, languagesData);
      }, 1000);
    }
  };

  //update language all over the app
  const onSubmitLang = async (lang, languagesData) => {
    if (lang == '') {
      showAlertMessageError(strings.SELECT);
      return;
    } else {
      let btData = {};
      AsyncStorage.getItem('BleDevice').then(async (res) => {
        if (res !== null) {
          btData = res;
          await AsyncStorage.setItem('autoConnectEnabled', 'true');
          await AsyncStorage.setItem('BleDevice2', btData);
          console.log('++++++22', btData);
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
          BluetoothManager.disconnect(JSON.parse(res).boundAddress).then(
            (s) => { },
          );
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
      });
      // await BackgroundService.removeAllListeners();
      // await BackgroundService.stop().then((res) => {});
      // await AsyncStorage.removeItem('BleDevice');
    }
  };







  return (
    <WrapperContainer
      bgColor={
        isDarkMode ? MyDarkTheme.colors.background : colors.white
      }
      statusBarColor={colors.white}
      source={loaderOne}
      isLoadingB={isLoading}>
      <Header
      rightViewStyle={{flex:0.1}}
        leftIcon={imagePath.icBackb}
        lefttext={strings.SETTINGS}
       righttextview={{flex:0.28}}

        headerStyle={
          {
      
            shadowColor: colors.greyColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 4,
            backgroundColor: colors.white,
            elevation: 8,
            backgroundColor:isDarkMode?MyDarkTheme.colors.background:colors.white
                }
          
          
        }
        
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        
            <View style={styles.languageview}>
              <View
                style={styles.innerlanguageview}>
                <Image source={imagePath.language} style={{ alignItems: 'center',tintColor:isDarkMode?MyDarkTheme.colors.white:colors.black }} />
                <Text
                  style={{
                    ...styles.currency,
                    color: isDarkMode ? MyDarkTheme.colors.text : colors.blackB, 
                  }}>
                  {strings.LANGUAGES}
                </Text>
              </View>
              {console.log(appLanguages.all_languages, 'appLanguages.all_languages')}
            
              <Menu style={{ alignSelf: 'flex-end' }}>
                <MenuTrigger>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{opacity:0.5}}>{appLanguages?.primary_language?.nativeName ||
                      appLanguages?.primary_language?.name ||
                      appLanguages?.primary_language?.label ||
                      ''}
                      </Text>
                      <Image style={{marginHorizontal:8,transform:[{rotate:'180deg'}],tintColor:colors.atlanticgreen}}
                      source={imagePath.icBackb}/>
                  </View>
                </MenuTrigger>
                <MenuOptions
                  customStyles={{
                    optionsContainer: {
                      marginTop: moderateScaleVertical(36),
                      width: moderateScale(100),
                    },
                  }}>
                  {appLanguages.all_languages?.map((item, index) => {
                    return (
                      <View key={index}>
                        <MenuOption
                          onSelect={() => updateLanguage(item)}
                          key={String(index)}
                          text={item?.label}
                          style={{
                            marginVertical: moderateScaleVertical(5),
                          }}
                        />
                        <View
                          style={{
                            borderBottomWidth: 1,
                            borderBottomColor: colors.greyColor,
                          }}
                        />
                      </View>
                    );
                  })}
                </MenuOptions>
              </Menu>
            </View>
            <View
              style={{
                // height: 0.5,
                backgroundColor: isDarkMode
                  ? MyDarkTheme.colors.text
                  : colors.blackOpacity20,
                marginTop: moderateScaleVertical(20),
              }}
            />
         

      </ScrollView>
    </WrapperContainer>
  );
}
