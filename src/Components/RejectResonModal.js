import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import Modal from 'react-native-modal';
import imagePath from '../constants/imagePath';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../styles/responsiveSize';
import strings from '../constants/lang';

import GradientButton from './GradientButton';
import colors from '../styles/colors';
import BorderTextInput from './BorderTextInput';

const RejectResonModal = ({
  isVisible = true,
  onClose = () => {},
  onSubmit = () => {},
  onChangeText = () => {},
}) => {
  const {themeColors, appStyle} = useSelector((state) => state?.initBoot);
  const fontFamily = appStyle?.fontSizeData;
  //On change in textinput field

  return (
    <Modal
      isVisible={isVisible}
      style={{
        flex: 1,
      }}>
      <View
        style={{
          height: height / 3,
          justifyContent: 'center',
          backgroundColor: colors.white,
          width: '80%',
          alignSelf: 'center',
          borderRadius: moderateScale(12),
        }}>
        <Text
          style={{
            fontFamily: fontFamily.medium,
            fontSize: textScale(14),
            alignSelf: 'center',
            textAlign: 'center',
            color: colors.black,
            marginHorizontal: moderateScale(8),
          }}>
          Enter reason for rejecting the order
        </Text>
        <BorderTextInput
          onChangeText={onChangeText}
          placeholder={'Enter Reason'}
          containerStyle={{
            marginHorizontal: moderateScale(16),
            marginTop: moderateScale(16),
            height: moderateScale(44),
          }}
        />
        <GradientButton
          containerStyle={{
            // marginTop: moderateScaleVertical(12),
            height: moderateScale(40),
            marginHorizontal: moderateScale(16),
          }}
          colorsArray={[colors.themeColor2, colors.themeColor2]}
          onPress={onSubmit}
          borderRadius={moderateScale(15)}
          btnText={strings.SUBMIT}
        />
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 5,
            bottom: 0,
            right: 5,
          }}
          onPress={onClose}>
          <Image
            source={imagePath.cross}
            style={{
              tintColor: colors.themeColor2,
              height: moderateScale(25),
              width: moderateScale(25),
            }}
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default RejectResonModal;

const styles = StyleSheet.create({});
