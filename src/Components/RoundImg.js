import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { moderateScale } from '../styles/responsiveSize';
import colors from '../styles/colors';
import { useSelector } from 'react-redux';
import { useDarkMode } from 'react-native-dynamic';
import FastImage from 'react-native-fast-image';
const RoundImg = ({ imgStyle = {}, img = {}, size = 76 }) => {
  const theme = useSelector((state) => state?.initBoot?.themeColor);
  const toggleTheme = useSelector((state) => state?.initBoot?.themeToggle);
  const darkthemeusingDevice = useDarkMode();
  const isDarkMode = toggleTheme ? darkthemeusingDevice : theme;

  return (
    <FastImage
      style={{
        width: moderateScale(size),
        height: moderateScale(size),
        borderRadius: moderateScale(size / 2),
        backgroundColor: isDarkMode
          ? colors.whiteOpacity15
          : colors.blackOpacity10,
        ...imgStyle,
      }}
      source={{
        uri: img,
        priority: FastImage.priority.high,
        cache: FastImage.cacheControl.immutable
      }}
    />
  );
};

export default React.memo(RoundImg);
