import React from 'react';
import {ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import colors from '../styles/colors';
import commonStylesFun from '../styles/commonStyles';

const GradientButton = ({
  containerStyle,
  btnStyle = {},
  //colorsArray = [themeColors?.primary_color, themeColors?.primary_color],
  borderRadius = 13,
  onPress,
  btnText,
  marginTop = 0,
  marginBottom = 0,
  textStyle = {},
  indicator = false,
  endcolor = {},
  startcolor = {},
  colorsArray = null,
  indicatorColor = '#0000ff',
  disabled = false,
}) => {
  const {appStyle, themeColors} = useSelector((state) => state?.initBoot);
  const fontFamily = appStyle?.fontSizeData;
  const buttonTextColor = themeColors;
  const commonStyles = commonStylesFun({fontFamily, buttonTextColor});
  return (
    <TouchableOpacity
      disabled={disabled}
      style={{
        ...commonStyles.buttonRect,
        borderWidth: 0,
        marginTop,
        marginBottom,
        ...containerStyle,
      }}
      onPress={onPress}>
      <LinearGradient
        start={{x: 0.0, y: -1.5}}
        end={{x: 0.5, y: 1.0}}
        // end={endcolor}
        style={{
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          borderRadius,
          ...btnStyle,
        }}
        colors={
          colorsArray
            ? colorsArray
            : [themeColors?.primary_color, themeColors?.primary_color]
        }>
        {!!indicator ? (
          <ActivityIndicator size="small" color={indicatorColor} />
        ) : (
          <Text style={{...commonStyles.buttonTextWhite, ...textStyle}}>
            {btnText}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default React.memo(GradientButton);
