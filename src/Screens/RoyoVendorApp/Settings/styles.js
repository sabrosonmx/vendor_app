import {StyleSheet} from 'react-native';
import colors from '../../../styles/colors';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../../../styles/responsiveSize';

export default ({fontFamily,themeColors}) => {
  const styles = StyleSheet.create({
    currency: {
      color: colors.blackB,
      // textAlign: 'center',
      fontFamily: fontFamily.regular,
      fontSize: textScale(14),
      marginLeft:moderateScale(16)
    },
    darkAppearanceTextStyle: {
      lineHeight: 24,
      color: colors.blackB,
      // textAlign: 'center',
      fontFamily: fontFamily.regular,
      fontSize: textScale(14),
    },
    dropDownTouch: {
      marginHorizontal: moderateScale(20),
      paddingVertical: moderateScaleVertical(10),
      paddingHorizontal: moderateScale(15),
      justifyContent: 'space-between',

      borderWidth: 0.5,

      borderRadius: moderateScale(5),
    },

    touchAbleLoginVIew: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      
    },
    loginLogoutText: {
      fontSize: textScale(12),
      color: themeColors?.primary_color,
      fontFamily: fontFamily?.medium,
      textAlign: 'left',
      marginRight: moderateScale(8),
      alignItems:'center'
    },
    languageview:{ flexDirection: 'row', justifyContent: 'space-between', marginTop:moderateScaleVertical(12),paddingHorizontal:moderateScaleVertical(16) },
    triggertext:{fontSize:textScale(14),opacity:0.5},
    innerlanguageview:{
      flexDirection: 'row',   
      alignItems: 'center',

    },
    pushnotificationview:{flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: moderateScaleVertical(15),
    paddingHorizontal: moderateScale(16),
    // borderTopWidth: 0.7,}
  }
  });
  return styles;
};
