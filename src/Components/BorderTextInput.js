import React, {useEffect, useRef} from 'react';
import {
  I18nManager,
  Image,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDarkMode} from 'react-native-dynamic';
import {useSelector} from 'react-redux';
import imagePath from '../constants/imagePath';
import colors from '../styles/colors';
import {hitSlopProp} from '../styles/commonStyles';
import {moderateScaleVertical, textScale} from '../styles/responsiveSize';
import {MyDarkTheme} from '../styles/theme';

const BorderTextInput = ({
  containerStyle,
  textInputStyle,
  leftIcon,
  color,
  rightIcon,
  onChangeText,
  value,
  placeholder,
  marginBottom = 20,
  onPressRight = () => {},
  withRef = false,
  secureTextEntry = false,
  borderWidth = 1,
  borderRadius = 13,
  isShowPassword,
  rightIconStyle = {},
  ...props
}) => {
  const theme = useSelector((state) => state?.initBoot?.themeColor);
  const toggleTheme = useSelector((state) => state?.initBoot?.themeToggle);
  const darkthemeusingDevice = useDarkMode();
  const isDarkMode = toggleTheme ? darkthemeusingDevice : theme;

  const inputRef = useRef();
  const {appStyle} = useSelector((state) => state.initBoot);
  const fontFamily = appStyle?.fontSizeData;

  useEffect(() => {
    if (withRef && Platform.OS === 'android') {
      if (inputRef.current) {
        inputRef.current.setNativeProps({
          style: {fontFamily: fontFamily.regular},
        });
      }
    }
  }, [secureTextEntry]);
  return (
    <View
      style={{
        flexDirection: 'row',
        height: moderateScaleVertical(49),
        color: colors.white,
        borderWidth: borderWidth,
        borderRadius: borderRadius,
        borderColor: isDarkMode ? MyDarkTheme.colors.text : colors.borderLight,
        marginBottom,
        overflow: 'hidden',

        ...containerStyle,
      }}>
      {leftIcon && (
        <View style={{justifyContent: 'center', marginLeft: 10}}>
          <Image source={leftIcon} />
        </View>
      )}

      <TextInput
        selectionColor={isDarkMode ? MyDarkTheme.colors.text : colors.black}
        placeholder={placeholder}
        placeholderTextColor={
          isDarkMode ? MyDarkTheme.colors.text : colors.textGreyB
        }
        style={{
          flex: 1,
          opacity: 0.7,
          color: isDarkMode ? MyDarkTheme.colors.text : colors.textGreyOpcaity7,
          fontFamily: fontFamily.medium,
          fontSize: textScale(14),
          paddingHorizontal: 8,
          paddingTop: 0,
          paddingBottom: 0,
          textAlign: I18nManager.isRTL ? 'right' : 'left',
          ...textInputStyle,
        }}
        ref={inputRef}
        // numberOfLines
        blurOnSubmit
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={secureTextEntry}
        autoCapitalize={'none'}
        {...props}
      />

      {rightIcon && (
        <TouchableOpacity
          style={{justifyContent: 'center', marginRight: 10}}
          hitSlop={hitSlopProp}
          onPress={onPressRight}>
          <Image style={{...rightIconStyle}} source={rightIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(BorderTextInput);
