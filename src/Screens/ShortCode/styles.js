import {StyleSheet} from 'react-native';
import colors from '../../styles/colors';
import fontFamily from '../../styles/fontFamily';
import {moderateScaleVertical, textScale} from '../../styles/responsiveSize';

export default StyleSheet.create({
  enterShortCode: {
    color: colors.black,
    textAlign: 'center',
    fontFamily: fontFamily.circularBold,
    fontSize:textScale(18),
  },
  enterShortCode2: {
    color: colors.lightGreyBgColor,
    textAlign: 'center',
    fontFamily: fontFamily.circularMedium,
    fontSize:textScale(14),
  },
  guestBtn: {
    marginTop: moderateScaleVertical(20),
    // backgroundColor: colors.white,
    borderWidth: 0,
  },
});
