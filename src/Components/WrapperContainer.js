import React from 'react';
import {StatusBar, View} from 'react-native';
import colors from '../styles/colors';
import CustomAnimatedLoader from './CustomAnimatedLoader';
import Loader from './Loader';
import {defaultLoader} from '../Components/Loaders/AnimatedLoaderFiles';
import {useSelector} from 'react-redux';
import {moderateScale, moderateScaleVertical} from '../styles/responsiveSize';
import {useDarkMode} from 'react-native-dynamic';
import {MyDarkTheme} from '../styles/theme';
import strings from '../constants/lang';
import {SafeAreaView} from 'react-native-safe-area-context';

const WrapperContainer = ({
  children,
  isLoading,
  isLoadingB,
  bgColor = colors.white,
  statusBarColor = colors.white,
  barStyle = 'dark-content',
  withModal = false,
  source = defaultLoader,
  loadercolor,
  loaderHeightWidth,
  extraStyles = {},
}) => {
  const {themeColors} = useSelector((state) => state?.initBoot);
  const theme = useSelector((state) => state?.initBoot?.themeColor);
  const toggleTheme = useSelector((state) => state?.initBoot?.themeToggle);
  const darkthemeusingDevice = useDarkMode();
  const isDarkMode = toggleTheme ? darkthemeusingDevice : theme;

  const customColor = loadercolor ? loadercolor : themeColors.primary_color;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDarkMode
          ? MyDarkTheme.colors.background
          : statusBarColor,
      }}>
      <StatusBar
        backgroundColor={
          isDarkMode ? MyDarkTheme.colors.background : statusBarColor
        }
        barStyle={isDarkMode ? 'light-content' : barStyle}
      />
      <View style={{backgroundColor: bgColor, flex: 1}}>{children}</View>
      <Loader isLoading={isLoading} withModal={withModal} />
      <CustomAnimatedLoader
        source={source}
        loaderTitle={strings.LOADING}
        containerColor={
          isDarkMode ? MyDarkTheme.colors.lightDark : colors.white
        }
        loadercolor={customColor}
        animationStyle={[
          {
            height: moderateScaleVertical(40),
            width: moderateScale(40),
          },
          {...loaderHeightWidth},
        ]}
        visible={isLoadingB}
      />
    </SafeAreaView>
  );
};

export default React.memo(WrapperContainer);
