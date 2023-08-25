import { useFocusEffect } from '@react-navigation/native';
import { cloneDeep } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image, ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDarkMode } from 'react-native-dynamic';
import DeviceInfo from 'react-native-device-info';
import HTMLView from 'react-native-htmlview';
import ImageViewer from 'react-native-image-zoom-viewer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import Share from 'react-native-share';
import { Pagination } from 'react-native-snap-carousel';
import StarRating from 'react-native-star-rating';
import { useSelector } from 'react-redux';
import Banner2 from '../../Components/Banner2';
import GradientButton from '../../Components/GradientButton';
import Header from '../../Components/Header';
import HorizontalLine from '../../Components/HorizontalLine';
import { loaderOne } from '../../Components/Loaders/AnimatedLoaderFiles';
import ProductsComp from '../../Components/ProductsComp';
import WrapperContainer from '../../Components/WrapperContainer';
import imagePath from '../../constants/imagePath';
import strings from '../../constants/lang';
import navigationStrings from '../../navigation/navigationStrings';
import actions from '../../redux/actions';
import colors from '../../styles/colors';
import commonStylesFunc, { hitSlopProp } from '../../styles/commonStyles';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
  width
} from '../../styles/responsiveSize';
import { MyDarkTheme } from '../../styles/theme';
import { currencyNumberFormatter } from '../../utils/commonFunction';
import { enums } from '../../utils/enums';
import {
  getColorCodeWithOpactiyNumber,
  getImageUrl, showError,
  showSuccess
} from '../../utils/helperFunctions';
import AddonModal from './AddonModal';
import ListEmptyProduct from './ListEmptyProduct';
import stylesFunc from './styles';

export default function ProductDetail({route, navigation}) {
  console.log('my route', route);
  const theme = useSelector((state) => state?.initBoot?.themeColor);
  const toggleTheme = useSelector((state) => state?.initBoot?.themeToggle);
  const CartItems = useSelector((state) => state?.cart?.cartItemCount);
  const darkthemeusingDevice = useDarkMode();
  const isDarkMode = toggleTheme ? darkthemeusingDevice : theme;
  const {appData, themeColors, themeLayouts, currencies, languages, appStyle} =
    useSelector((state) => state?.initBoot);
  const {productListData} = useSelector((state) => state?.product);
  const fontFamily = appStyle?.fontSizeData;
  const styles = stylesFunc({themeColors, fontFamily});
  const commonStyles = commonStylesFunc({fontFamily});
  const {data} = route.params;

  const [state, setState] = useState({
    slider1ActiveSlide: 0,
    isLoading: true,
    isLoadingB: false,
    isLoadingC: false,
    productId: data?.id,
    productDetailData: null,
    productPriceData: null,
    variantSet: [],
    addonSet: [],
    relatedProducts: [],
    showListOfAddons: false,
    venderDetail: null,
    productTotalQuantity: 0,
    productSku: null,
    productVariantId: null,
    isVisibleAddonModal: false,
    lightBox: false,
    productQuantityForCart: 1,
    showErrorMessageTitle: false,
    typeId: null,
    isProductImageLargeViewVisible: false,
    selectedVariant: null,
    selectedOption: null,
    btnLoader: false,
  });
  //Saving the initial state
  const initialState = cloneDeep(state);
  const userData = useSelector((state) => state?.auth?.userData);
  const dine_In_Type = useSelector((state) => state?.home?.dineInType);
  const updateState = (data) => setState((state) => ({...state, ...data}));
  const {bannerRef} = useRef();
  const {
    productDetailData,
    productPriceData,
    isLoadingC,
    addonSet,
    variantSet,
    showListOfAddons,
    venderDetail,
    productTotalQuantity,
    productSku,
    productVariantId,
    relatedProducts,
    isVisibleAddonModal,
    lightBox,
    productQuantityForCart,
    showErrorMessageTitle,
    typeId,
    isProductImageLargeViewVisible,
    selectedVariant,
    btnLoader,
  } = state;

  const customRight = () => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image source={imagePath.search} />
      </View>
    );
  };

  let plainHtml = productDetailData?.translation[0]?.body_html || null;
  //Naviagtion to specific screen
  const moveToNewScreen =
    (screenName, data = {}) =>
    () => {
      navigation.navigate(screenName, {data});
    };

  // useEffect(() => {
  //   updateState({
  //     productQuantityForCart: !!productDetailData?.minimum_order_count
  //       ? productDetailData?.minimum_order_count
  //       : 1,
  //   });
  // }, [productQuantityForCart]);

  useFocusEffect(
    React.useCallback(() => {
      if (variantSet.length) {
        let variantSetData = variantSet
          .map((i, inx) => {
            let find = i.options.filter((x) => x.value);
            if (find.length) {
              return {
                variant_id: find[0].variant_id,
                optionId: find[0].id,
              };
            }
          })
          .filter((x) => x != undefined);
        console.log(variantSetData, 'variantSetData');
        if (variantSetData.length) {
          getProductDetailBasedOnFilter(variantSetData);
        } else {
          getProductDetail();
        }
      }
    }, []),
  );

  useEffect(() => {
    getProductDetail();
  }, [state.productId, state.isLoadingB]);

  const onShare = () => {
    console.log('onShare', appData);
    if (!!productDetailData?.share_link) {
      let hyperLink = productDetailData?.share_link;
      let options = {url: hyperLink};
      Share.open(options)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
      return;
    }
    alert('link not found');
  };

  const getProductDetail = () => {
    console.log('api hit getProductDetail');
    actions
      .getProductDetailByProductId(
        `/${state.productId}`,
        {},
        {
          code: appData.profile.code,
          currency: currencies.primary_currency.id,
          language: languages.primary_language.id,
        },
      )
      .then((res) => {
        console.log(res.data, 'res getProductDetail');
        updateState({
          isLoading: false,
          isLoadingB: false,
          btnLoader: false,
          productDetailData: res.data.products,
          relatedProducts: res.data.relatedProducts,
          productPriceData: res.data.products.variant[0],
          addonSet: res.data.products.add_on,
          typeId: res.data.products.category.category_detail.type_id,
          venderDetail: res.data.products.vendor,
          productTotalQuantity: res.data.products.variant[0].quantity,
          productVariantId: res.data.products.variant[0].id,
          productSku: res.data.products.sku,
          productQuantityForCart: !!res.data.products?.minimum_order_count
            ? Number(res.data.products?.minimum_order_count)
            : 1,
        });
        if (
          res.data.products.variant_set.length &&
          variantSet &&
          !variantSet.length
        ) {
          updateState({variantSet: res.data.products.variant_set});
        }
      })
      .catch(errorMethod);
  };

  //Get Product detail based on varint selection
  const getProductDetailBasedOnFilter = (variantSetData) => {
    console.log('api hit getProductDetailBasedOnFilter');
    let data = {};
    data['variants'] = variantSetData.map((i) => i.variant_id);
    data['options'] = variantSetData.map((i) => i.optionId);
    actions
      .getProductDetailByVariants(`/${productDetailData.sku}`, data, {
        code: appData.profile.code,
        currency: currencies.primary_currency.id,
        language: languages.primary_language.id,
      })
      .then((res) => {
        console.log(res.data, 'res.data by vendor id ');
        updateState({
          isLoading: false,
          isLoadingB: false,
          isLoadingC: false,
          productDetailData: res.data,
          productPriceData: {
            multiplier: res.data.multiplier,
            price: res.data.price,
          },
          productSku: res.data.sku,
          productVariantId: res.data.id,
          showErrorMessageTitle: false,
          selectedVariant: null,
          btnLoader: false,
        });
      })
      .catch(errorMethod);
  };

  const errorMethod = (error) => {
    if (error?.message?.alert == 1) {
      updateState({
        isLoading: false,
        isLoadingB: false,
        isLoadingC: false,
        btnLoader: false,
      });
      // showError(error?.message?.error || error?.error);
      Alert.alert('', error?.message?.error, [
        {
          text: strings.CANCEL,
          onPress: () => console.log('Cancel Pressed'),
          // style: 'destructive',
        },
        {text: strings.CLEAR_CART2, onPress: () => clearCart()},
      ]);
    } else {
      if (error?.data?.variant_empty) {
        updateState({
          isLoading: false,
          showErrorMessageTitle: true,
          isLoadingB: false,
          isLoadingC: false,
          selectedVariant: null,
          btnLoader: false,
        });
      } else {
        updateState({
          isLoading: false,
          isLoadingB: false,
          isLoadingC: false,
          selectedVariant: null,
          btnLoader: false,
        });
        showError(error?.message || error?.error);
      }
    }
  };

  const errorMethodSecond = (error, addonSet) => {
    console.log(error.message.alert, 'Error>>>>>');

    if (error?.message?.alert == 1) {
      updateState({isLoading: false, isLoadingB: false, isLoadingC: false});
      // showError(error?.message?.error || error?.error);
      Alert.alert('', error?.message?.error, [
        {
          text: strings.CANCEL,
          onPress: () => console.log('Cancel Pressed'),
          // style: 'destructive',
        },
        {text: strings.CLEAR_CART2, onPress: () => clearCart(addonSet)},
      ]);
    } else {
      updateState({isLoading: false, isLoadingB: false, isLoadingC: false});
      showError(error?.message || error?.error);
    }
  };

  const clearCart = (addonSet) => {
    actions
      .clearCart(
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
        // updateState({
        //   cartItems: [],
        //   cartData: {},
        //   isLoadingB: false,
        // });
        // addToCart();
        if (addonSet) {
          _finalAddToCart(addonSet);
        } else {
          addToCart();
        }
        // _finalAddToCart(addonSet);
        showSuccess(res?.message);
      })
      .catch(errorMethod);
  };

  //add Product to wishlist
  const _onAddtoWishlist = (item) => {
    console.log(item, 'itemwishlist');

    if (!!userData?.auth_token) {
      actions
        .updateProductWishListData(
          `/${item.product_id || item.id}`,
          {},
          {
            code: appData?.profile?.code,
            currency: currencies?.primary_currency?.id,
            language: languages?.primary_language?.id,
          },
        )
        .then((res) => {
          showSuccess(res.message);

          if (item.inwishlist) {
            item.inwishlist = null;
            updateState({productDetailData: item});
          } else {
            item.inwishlist = {product_id: item.id};
            updateState({productDetailData: item});
          }
        })
        .catch(errorMethod);
    } else {
      showError(strings.UNAUTHORIZED_MESSAGE);
    }
  };

  useEffect(() => {
    myRef.current.scrollToPosition(1, 0, true);
  }, [state.productId]);

  const selectSpecificOptions = (options, i, inx) => {
    let newArray = cloneDeep(options);
    let modifyVariants = variantSet.map((vi, vnx) => {
      if (vi.variant_type_id == i.variant_id) {
        return {
          ...vi,
          options: newArray.map((j, jnx) => {
            if (j.id == i.id) {
              return {
                ...j,
                value: true,
              };
            }
            return {
              ...j,
              value: false,
            };
          }),
        };
      } else {
        return vi;
      }
    });
    updateState({
      variantSet: modifyVariants,
      selectedOption: i,
    });
  };

  const onSelect = () => {
    if (variantSet.length) {
      let variantSetData = variantSet
        .map((i, inx) => {
          let find = i.options.filter((x) => x.value);
          if (find.length) {
            return {
              variant_id: find[0].variant_id,
              optionId: find[0].id,
            };
          }
        })
        .filter((x) => x != undefined);
      console.log(variantSetData, 'variantSetData callback');
      if (variantSetData.length) {
        updateState({btnLoader: true});
        getProductDetailBasedOnFilter(variantSetData);
      } else {
        getProductDetail();
      }
    }
  };

  const variantSetValue = (item) => {
    const {options, type, variant_type_id} = item;
    console.log('variantSetValuevariantSetValue', variant_type_id);
    if (type == 1) {
      return (
        <View>
          <TouchableOpacity
            onPress={() => updateState({selectedVariant: item})}
            style={{
              ...styles.dropDownStyle,
              backgroundColor: isDarkMode
                ? colors.whiteOpacity22
                : colors.blackOpacity05,
            }}>
            <Text
              style={{
                fontSize: moderateScale(12),
                fontFamily: fontFamily.medium,
                color: isDarkMode ? MyDarkTheme.colors.text : colors.black,
              }}>
              {options.filter((val) => {
                if (val?.value) {
                  return val;
                }
              })[0]?.title || strings.SELECT + ' ' + item?.title}
            </Text>
            <Image source={imagePath.dropDownSingle} />
          </TouchableOpacity>
          {selectedVariant?.variant_type_id == variant_type_id
            ? radioButtonView(options)
            : null}
        </View>
      );
    }
    return (
      <View>
        <TouchableOpacity
          onPress={() => updateState({selectedVariant: item})}
          style={{
            ...styles.dropDownStyle,
            backgroundColor: isDarkMode
              ? colors.whiteOpacity22
              : colors.blackOpacity05,
          }}>
          <Text
            style={{
              fontSize: moderateScale(12),
              fontFamily: fontFamily.medium,
              color: isDarkMode ? MyDarkTheme.colors.text : colors.black,
            }}>
            {options.filter((val) => {
              if (val?.value) {
                return val;
              }
            })[0]?.title || strings.SELECT + ' ' + item?.title}
          </Text>
          <Image source={imagePath.dropDownSingle} />
        </TouchableOpacity>

        {selectedVariant?.variant_type_id == variant_type_id
          ? circularView(options)
          : null}
      </View>
    );
  };

  const radioButtonView = (options) => {
    return (
      <Modal
        key={'1'}
        isVisible
        style={{
          margin: 0,
          justifyContent: 'flex-end',
        }}
        onBackdropPress={() => updateState({selectedVariant: null})}>
        <View
          style={{
            ...styles.modalView,
            backgroundColor: isDarkMode
              ? MyDarkTheme.colors.background
              : colors.white,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontSize: moderateScale(18),
                fontFamily: fontFamily.medium,
                color: isDarkMode ? MyDarkTheme.colors.text : colors.black,
              }}>
              {strings.SELECT} {selectedVariant?.title}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => updateState({selectedVariant: null})}>
              <Image source={imagePath.closeButton} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              ...styles.horizontalLine,
              borderBottomColor: isDarkMode
                ? colors.whiteOpacity22
                : colors.lightGreyBg,
            }}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((i, inx) => {
              return (
                <TouchableOpacity
                  key={inx}
                  // disabled={options && options.length == 1 ? true : false}
                  onPress={() => selectSpecificOptions(options, i, inx)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // marginRight: moderateScale(16),
                    marginBottom: moderateScaleVertical(10),
                  }}>
                  <Image
                    source={
                      i?.value
                        ? imagePath.icActiveRadio
                        : imagePath.icInActiveRadio
                    }
                    style={{
                      tintColor: themeColors.primary_color,
                      marginRight: moderateScale(16),
                    }}
                  />
                  <Text
                    style={{
                      ...styles.variantValue,
                      color: i?.value
                        ? themeColors.primary_color
                        : isDarkMode
                        ? MyDarkTheme.colors.text
                        : colors.blackOpacity43,
                      fontSize: textScale(14),
                      fontFamily: i.value
                        ? fontFamily.bold
                        : fontFamily.regular,
                    }}>
                    {i?.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <GradientButton
            indicator={btnLoader}
            indicatorColor={colors.white}
            colorsArray={[themeColors.primary_color, themeColors.primary_color]}
            textStyle={{
              fontFamily: fontFamily.medium,
              textTransform: 'capitalize',
              color: colors.white,
            }}
            onPress={onSelect}
            btnText={strings.SELECT}
            btnStyle={{
              borderRadius: moderateScale(4),
              height: moderateScale(38),
            }}
          />
        </View>
      </Modal>
    );
  };

  const circularView = (options) => {
    return (
      <Modal
        key={'2'}
        isVisible
        style={{
          margin: 0,
          justifyContent: 'flex-end',
        }}
        onBackdropPress={() => updateState({selectedVariant: null})}>
        <View
          style={{
            ...styles.modalView,
            backgroundColor: isDarkMode
              ? MyDarkTheme.colors.background
              : colors.white,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontSize: moderateScale(18),
                fontFamily: fontFamily.medium,
                color: isDarkMode ? MyDarkTheme.colors.text : colors.black,
              }}>
              {strings.SELECT} {selectedVariant?.title}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => updateState({selectedVariant: null})}>
              <Image source={imagePath.closeButton} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              ...styles.horizontalLine,
              borderBottomColor: isDarkMode
                ? colors.whiteOpacity22
                : colors.lightGreyBg,
            }}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((i, inx) => {
              return (
                <TouchableOpacity
                  key={inx}
                  // disabled={options && options.length == 1 ? true : false}
                  onPress={() => selectSpecificOptions(options, i, inx)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: moderateScale(5),
                    marginBottom: moderateScaleVertical(10),
                  }}
                  activeOpacity={0.8}>
                  <View
                    style={[
                      styles.variantSizeViewTwo,
                      {
                        backgroundColor: colors.white,
                        borderWidth: i?.value ? 1 : 0,

                        borderColor:
                          i?.value &&
                          (i.hexacode == '#FFFFFF' || i.hexacode == '#FFF')
                            ? colors.textGrey
                            : i.hexacode,
                      },
                    ]}>
                    <View
                      style={[
                        styles.variantSizeViewOne,
                        {
                          backgroundColor: i.hexacode,
                          borderWidth:
                            i.hexacode == '#FFFFFF' || i.hexacode == '#FFF'
                              ? StyleSheet.hairlineWidth
                              : 0,
                        },
                      ]}></View>
                  </View>
                  <Text
                    style={{
                      ...styles.variantValue,
                      color: i?.value
                        ? themeColors.primary_color
                        : isDarkMode
                        ? MyDarkTheme.colors.text
                        : colors.blackOpacity43,
                      fontSize: textScale(14),
                      fontFamily: i.value
                        ? fontFamily.bold
                        : fontFamily.regular,
                      marginLeft: moderateScale(8),
                    }}>
                    {i?.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <GradientButton
            indicator={btnLoader}
            indicatorColor={colors.white}
            colorsArray={[themeColors.primary_color, themeColors.primary_color]}
            textStyle={{
              fontFamily: fontFamily.medium,
              textTransform: 'capitalize',
              color: colors.white,
            }}
            onPress={onSelect}
            btnText={strings.SELECT}
            btnStyle={{
              borderRadius: moderateScale(4),
              height: moderateScale(38),
            }}
          />
        </View>
      </Modal>
    );
  };

  const renderVariantSet = ({item, index}) => {
    return (
      <View
        key={String(index)}
        style={{
          flex: 1,
          marginRight: moderateScale(8),
        }}>
        <Text
          style={{
            ...styles.variantLable,
            marginBottom: moderateScale(5),
            color: isDarkMode ? MyDarkTheme.colors.text : colors.black,
          }}>{`${item?.title}`}</Text>
        {item?.options ? variantSetValue(item) : null}
      </View>
    );
  };

  const showAllVariants = () => {
    let variantSetData = cloneDeep(variantSet);
    return (
      <View style={{marginBottom: moderateScaleVertical(16)}}>
        <FlatList
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          numColumns={2}
          data={!!variantSetData ? variantSetData : []}
          renderItem={renderVariantSet}
          keyExtractor={(item) => item?.variant_type_id.toString()}
        />
      </View>
    );
  };

  useEffect(() => {
    if (data?.addonSetData && data?.randomValue) {
      updateState({addonSet: data?.addonSetData});
      setTimeout(() => {
        _finalAddToCart(data?.addonSetData);
      }, 1000);
    }
  }, [data?.addonSetData, data?.randomValue]);

  const _finalAddToCart = (addonSet = addonSet) => {
    const addon_ids = [];
    const addon_options = [];
    addonSet.map((i, inx) => {
      i.setoptions.map((j, jnx) => {
        console.log(j, 'J');
        if (j?.value == true) {
          addon_ids.push(j?.addon_id);
          addon_options.push(j?.id);
        }
      });
    });

    let data = {};
    data['sku'] = productSku;
    data['quantity'] = productQuantityForCart;
    data['product_variant_id'] = productVariantId;
    data['type'] = dine_In_Type;

    if (addonSet && addonSet.length) {
      // console.log(addonSetData, 'addonSetData');
      data['addon_ids'] = addon_ids;
      data['addon_options'] = addon_options;
    }
    console.log(data, 'data for cart');
    updateState({isLoadingC: true, isVisibleAddonModal: false});
    actions
      .addProductsToCart(data, {
        code: appData.profile.code,
        currency: currencies.primary_currency.id,
        language: languages.primary_language.id,
        systemuser: DeviceInfo.getUniqueId(),
      })
      .then((res) => {
        console.log(res, 'res.data');
        actions.cartItemQty(res);

        showSuccess(strings.PRODUCT_ADDED_SUCCESS);

        updateState({isLoadingC: false});
        navigation.goBack();
      })
      .catch((error) => errorMethodSecond(error, addonSet));
  };

  const addToCart = () => {
    {
      addonSet && addonSet.length
        ? updateState({isVisibleAddonModal: true})
        : _finalAddToCart(addonSet);
    }
    // _finalAddToCart()
  };

  const myRef = useRef(null);

  const productIncrDecreamentForCart = (type) => {
    let quantityToIncreaseDecrease = !!productDetailData?.batch_count
      ? Number(productDetailData?.batch_count)
      : 1;
    if (type == 2) {
      let limitOfMinimumQuantity = !!productDetailData?.minimum_order_count
        ? Number(productDetailData?.minimum_order_count)
        : 1;

      if (productQuantityForCart <= limitOfMinimumQuantity) {
      } else {
        updateState({
          productQuantityForCart:
            productQuantityForCart - quantityToIncreaseDecrease,
        });
      }
    } else if (type == 1) {
      if (productQuantityForCart == productTotalQuantity) {
        showError(strings.MAXIMUM_LIMIT_REACHED);
      } else {
        updateState({
          productQuantityForCart:
            productQuantityForCart + quantityToIncreaseDecrease,
        });
      }
    }
  };

  const renderProduct = ({item, index}) => {
    item.showAddToCart = true;
    return (
      <ProductsComp
        item={item}
        onPress={() =>
          navigation.push(navigationStrings.PRODUCTDETAIL, {data: item})
        }
      />
    );
  };

  const setModalVisibleForAddonModal = (visible) => {
    updateState({isVisibleAddonModal: false});
  };

  const onclickBanner = () => {
    updateState({lightBox: true});
  };

  const onImageLargeView = (item) => {
    updateState({
      isProductImageLargeViewVisible: true,
    });
  };

  // load images for zooming effect

  const allImagesArrayForZoom = [];
  productDetailData?.product_media
    ? productDetailData?.product_media?.map((item, index) => {
        return (allImagesArrayForZoom[index] = {
          url: getImageUrl(
            item?.image.path.image_fit,
            item?.image.path.image_path,
            '1000/1000',
          ),
        });
      })
    : getImageUrl(
        productDetailData?.product_media[0]?.image?.path?.image_fit,
        productDetailData?.product_media[0]?.image?.path?.image_path,
        '1000/1000',
      );

  const renderImageZoomingView = () => {
    return (
      <View
        style={{
          height: moderateScaleVertical(height),
          width: moderateScale(width),
        }}>
        <ImageViewer
          renderHeader={() => <View style={{backgroundColor: 'red'}}></View>}
          renderIndicator={(currentIndex, allSize) => (
            <View
              style={{
                position: 'absolute',
                top: 100,
                width: width / 2,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                onPress={() =>
                  updateState({
                    isProductImageLargeViewVisible: false,
                  })
                }>
                <Image
                  style={{
                    tintColor: colors.white,
                    marginHorizontal: moderateScale(20),
                  }}
                  source={imagePath.backArrow}
                />
              </TouchableOpacity>
              <Text style={{color: colors.white}}>
                {currentIndex + '/' + allSize}
              </Text>
            </View>
          )}
          imageUrls={allImagesArrayForZoom}
        />
      </View>
    );
  };

  return (
    <WrapperContainer
      bgColor={isDarkMode ? MyDarkTheme.colors.background : colors.white}
      statusBarColor={colors.white}
      source={loaderOne}
      // isLoadingB={isLoadingC}
    >
      <Header
        leftIcon={
          appStyle?.homePageLayout === 3 ? imagePath.icBackb : imagePath.back
        }
        centerTitle={productDetailData?.translation[0]?.title}
        textStyle={{fontSize: textScale(14)}}
        rightIcon={
          !!data?.showAddToCart
            ? false
            : appStyle?.homePageLayout === 3
            ? imagePath.icSearchb
            : imagePath.search
        }
        onPressRight={() =>
          navigation.navigate(navigationStrings.SEARCHPRODUCTOVENDOR)
        }
        headerStyle={{
          backgroundColor: isDarkMode
            ? MyDarkTheme.colors.background
            : colors.white,
        }}
        isShareIcon={imagePath.icShareb}
        onShare={onShare}
      />

      <KeyboardAwareScrollView ref={myRef} showsVerticalScrollIndicator={false}>
        <View style={{marginHorizontal: moderateScale(16)}}>
          {state.isLoading && <ListEmptyProduct isLoading={state.isLoading} />}

          {!state.isLoading && (
            <>
              {/* //Top section slider */}

              {!!productDetailData?.product_media.length ? (
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: moderateScaleVertical(20),
                    justifyContent: 'space-between',
                  }}>
                  {/* <View style={{ flex: 0.2 }}><Image source={imagePath.fav} /></View> */}
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <Banner2
                      autoPlay={false}
                      resizeMode="contain"
                      bannerRef={bannerRef}
                      bannerData={productDetailData?.product_media}
                      sliderWidth={width}
                      itemWidth={width / 1.1}
                      pagination={false}
                      setActiveState={(index) =>
                        updateState({slider1ActiveSlide: index})
                      }
                      imagestyle={{
                        borderRadius: 8,
                      }}
                      showLightbox={true}
                      cardViewStyle={styles.cardViewStyle}
                      childView={
                        <TouchableOpacity
                          onPress={() => _onAddtoWishlist(productDetailData)}>
                          {!enums.isVendorStandloneApp &&
                          productDetailData?.is_wishlist ? (
                            <View style={{alignSelf: 'flex-end', padding: 8}}>
                              {!!productDetailData?.inwishlist ? (
                                <Image
                                  style={{
                                    tintColor: isDarkMode
                                      ? MyDarkTheme.colors.text
                                      : themeColors.primary_color,
                                  }}
                                  source={imagePath.whiteFilledHeart}
                                />
                              ) : (
                                <Image
                                  style={{
                                    tintColor: isDarkMode
                                      ? MyDarkTheme.colors.text
                                      : themeColors.primary_color,
                                  }}
                                  source={imagePath.heart2}
                                />
                              )}
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      }
                      onPress={onImageLargeView}
                    />

                    <View style={{paddingTop: 5}}>
                      <Pagination
                        dotsLength={productDetailData?.product_media?.length}
                        activeDotIndex={state.slider1ActiveSlide}
                        dotColor={'grey'}
                        dotStyle={[styles.dotStyle]}
                        inactiveDotColor={colors.black}
                        inactiveDotOpacity={0.4}
                        inactiveDotScale={0.8}
                      />
                    </View>
                  </View>
                </View>
              ) : null}

              {/* Product Name and Branc detail */}

              <View style={{marginTop: moderateScaleVertical(10)}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      numberOfLines={2}
                      style={
                        isDarkMode
                          ? [
                              styles.productName,
                              {color: MyDarkTheme.colors.text},
                            ]
                          : styles.productName
                      }>
                      {productDetailData?.translation[0]?.title}
                    </Text>
                    <Text
                      style={{
                        ...styles.productPrice,
                        color: isDarkMode
                          ? MyDarkTheme.colors.text
                          : colors.black,
                      }}>{`${currencies?.primary_currency.symbol} ${(
                      Number(productPriceData?.multiplier) *
                      Number(productPriceData?.price)
                    ).toFixed(2)}`}</Text>
                  </View>
                </View>

                <View style={styles.flexView}>
                  <Text
                    style={{
                      ...commonStyles.mediumFont12,
                      color: isDarkMode
                        ? MyDarkTheme.colors.text
                        : colors.blackOpacity43,
                    }}>
                    {strings.IN}{' '}
                    {
                      productDetailData?.category?.category_detail
                        ?.translation[0]?.name
                    }
                  </Text>

                  {productDetailData?.averageRating !== null && (
                    <View
                      style={{
                        borderWidth: 0.5,
                        alignSelf: 'flex-start',
                        padding: 2,
                        borderRadius: 2,
                        marginVertical: moderateScaleVertical(4),
                        borderColor: colors.yellowB,
                        backgroundColor: colors.yellowOpacity10,
                      }}>
                      <StarRating
                        disabled={false}
                        maxStars={5}
                        rating={Number(
                          productDetailData?.averageRating,
                        ).toFixed(1)}
                        fullStarColor={colors.yellowB}
                        starSize={8}
                        containerStyle={{width: width / 9}}
                      />
                    </View>
                  )}
                </View>

                {productTotalQuantity == 0 && !!typeId && typeId !== 8 && (
                  <View style={{justifyContent: 'center'}}>
                    <Text
                      style={
                        stylesFunc({
                          themeColors,
                          fontFamily,
                          productTotalQuantity,
                        }).productTypeAndBrandValue
                      }>
                      {productDetailData?.has_inventory == 0 ||
                      (!!productTotalQuantity && !!productTotalQuantity != 0) ||
                      (!!typeId && typeId == 8) ||
                      !!productDetailData?.sell_when_out_of_stock
                        ? ''
                        : strings.OUT_OF_STOCK}
                    </Text>
                  </View>
                )}
              </View>
              {/* 
               {!!productDetailData?.delaySlot ?
                    <Text style={{
                      ...commonStyles.mediumFont14Normal,
                      fontSize: textScale(10),
                      textAlign: 'left',
                      color: colors.redB,
                      marginTop: moderateScaleVertical(8)
                    }}>{strings.WE_ARE_NOT_ACCEPTING} {productDetailData?.delaySlot}</Text>
                    : null
                  }            */}

              <HorizontalLine
                lineStyle={{marginVertical: moderateScaleVertical(16)}}
              />

              {/* Product description */}

              {plainHtml != null ? (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    <View>
                      <Text
                        style={
                          isDarkMode
                            ? [
                                styles.descriptiontitle,
                                {color: MyDarkTheme.colors.text},
                              ]
                            : styles.descriptiontitle
                        }>
                        {strings.DESCRIPTION}
                      </Text>

                      <HTMLView
                        value={'<div>' + plainHtml + '</div>'}
                        stylesheet={{div: styles.descriptionStyle}}
                      />
                    </View>
                  </View>
                  <HorizontalLine
                    lineStyle={{marginVertical: moderateScaleVertical(14)}}
                  />
                </>
              ) : null}

              {/* // Product variants */}
              {variantSet && variantSet.length ? showAllVariants() : null}
              {/* {addonSet && addonSet.length ? showAllAddons() : null} */}

              {showErrorMessageTitle ? (
                <Text
                  style={{
                    fontSize: textScale(14),
                    color: colors.redB,
                    fontFamily: fontFamily.medium,
                    marginBottom: moderateScaleVertical(16),
                  }}>
                  {strings.NOVARIANTPRODUCTAVAILABLE}
                </Text>
              ) : null}

              {/* Add to Cart button */}
              {!enums.isVendorStandloneApp &&
                (productDetailData?.has_inventory == 0 ||
                  (!!productTotalQuantity && !!productTotalQuantity != 0) ||
                  (!!typeId && typeId == 8) ||
                  !!productDetailData?.sell_when_out_of_stock) &&
                (!!data?.showAddToCart ? null : showErrorMessageTitle ? null : (
                  <View
                    style={{
                      marginBottom: moderateScaleVertical(25),
                    }}>
                    {Number(productPriceData?.price) !== 0 ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',

                          backgroundColor: isDarkMode
                            ? MyDarkTheme.colors.background
                            : colors.white,
                        }}>
                        <View style={{flex: 0.25}}>
                          <View
                            style={{
                              ...commonStyles.buttonRect,
                              ...styles.incDecBtnStyle,
                              backgroundColor: getColorCodeWithOpactiyNumber(
                                themeColors.primary_color.substr(1),
                                15,
                              ),
                              borderColor: themeColors?.primary_color,
                              height: moderateScale(38),
                            }}
                            // onPress={onPress}
                          >
                            <TouchableOpacity
                              disabled={
                                !productDetailData?.vendor?.show_slot &&
                                !!productDetailData?.vendor?.is_vendor_closed
                              }
                              onPress={() => productIncrDecreamentForCart(2)}
                              hitSlop={hitSlopProp}>
                              <Text
                                style={{
                                  ...commonStyles.mediumFont14,
                                  color: themeColors?.primary_color,
                                  fontFamily: fontFamily.bold,
                                }}>
                                -
                              </Text>
                            </TouchableOpacity>
                            <Text
                              style={{
                                ...commonStyles.mediumFont14,
                                color: isDarkMode
                                  ? MyDarkTheme.colors.text
                                  : colors.black,
                              }}>
                              {/* {productQuantityForCart} */}
                              {productQuantityForCart}
                            </Text>
                            <TouchableOpacity
                              disabled={
                                !productDetailData?.vendor?.show_slot &&
                                !!productDetailData?.vendor?.is_vendor_closed
                              }
                              onPress={() => productIncrDecreamentForCart(1)}
                              hitSlop={hitSlopProp}>
                              <Text
                                style={{
                                  ...commonStyles.mediumFont14,
                                  color: themeColors?.primary_color,
                                  fontFamily: fontFamily.bold,
                                }}>
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={{marginHorizontal: 8}} />
                        <View style={{flex: 0.75}}>
                          <GradientButton
                            indicator={isLoadingC}
                            disabled={
                              !productDetailData?.vendor?.show_slot &&
                              !!productDetailData?.vendor?.is_vendor_closed
                            }
                            indicatorColor={colors.white}
                            colorsArray={[
                              themeColors.primary_color,
                              themeColors.primary_color,
                            ]}
                            textStyle={{
                              fontFamily: fontFamily.medium,
                              textTransform: 'capitalize',
                            }}
                            onPress={addToCart}
                            btnText={`${strings.ADD}  ${
                              currencies?.primary_currency?.symbol
                            } ${currencyNumberFormatter(
                              (
                                Number(productPriceData?.multiplier) *
                                Number(productPriceData?.price) *
                                Number(productQuantityForCart)
                              ).toFixed(2),
                            )}`}
                            btnStyle={{
                              borderRadius: moderateScale(4),
                              height: moderateScale(38),
                              opacity: productDetailData?.vendor?.show_slot
                                ? 1
                                : productDetailData?.vendor?.is_vendor_closed
                                ? 0.3
                                : 1,
                            }}
                          />
                        </View>
                      </View>
                    ) : null}
                    {!productDetailData?.vendor?.show_slot &&
                    !!productDetailData?.vendor?.is_vendor_closed ? (
                      <Text
                        style={{
                          ...commonStyles.regularFont11,
                          color: colors.redB,
                        }}>
                        {strings.VENDOR_NOT_ACCEPTING_ORDERS}
                      </Text>
                    ) : null}
                  </View>
                ))}

              <AddonModal
                productdetail={productDetailData}
                isVisible={isVisibleAddonModal}
                onClose={() => setModalVisibleForAddonModal(false)}
                // onPress={(data) => alert('123')}
                addonSet={addonSet}
                // onPress={currentLocation}
              />
            </>
          )}
        </View>
        {/* related product */}

        <View style={{}}>
          {!!relatedProducts && !!relatedProducts.length && (
            <Text
              style={{
                ...styles.descriptiontitle,
                color: isDarkMode ? MyDarkTheme.colors.text : colors.textGrey,
                marginLeft: moderateScale(16),
              }}>
              {strings.YOUMAYALSO}
            </Text>
          )}
          <FlatList
            data={(!state.isLoading && relatedProducts) || []}
            renderItem={renderProduct}
            keyExtractor={(item, index) => String(index)}
            keyboardShouldPersistTaps="always"
            showsHorizontalScrollIndicator={false}
            style={{flex: 1, marginVertical: moderateScaleVertical(10)}}
            contentContainerStyle={{flexGrow: 1}}
            horizontal
            ItemSeparatorComponent={() => <View style={{width: 10}} />}
            ListHeaderComponent={() => (
              <View style={{marginLeft: moderateScale(8)}} />
            )}
            ListFooterComponent={() => (
              <View style={{marginLeft: moderateScale(8)}} />
            )}
            // ListEmptyComponent={<ListEmptyProduct isLoading={state.isLoading}/>}
          />
        </View>
        <View style={{marginBottom: moderateScale(40)}} />
      </KeyboardAwareScrollView>
      {/* 
      <GradientCartView
          onPress={() => {
            playHapticEffect(hapticEffects.notificationSuccess);
            navigation.navigate(navigationStrings.CART);
          }}
          btnText={
            CartItems && CartItems.data && CartItems.data.item_count
              ? `${CartItems.data.item_count} ${CartItems.data.item_count > 1 ? strings.ITEM : strings.ITEMS
              } | ${currencies.primary_currency.symbol
              }${currencyNumberFormatter(
                Number(CartItems.data.total_payable_amount).toFixed(2),
              )}`
              : ''
          }
          ifCartShow={
            CartItems && CartItems.data && CartItems.data.item_count > 0
              ? true
              : false
          }
          isMenuBtnShow={false}
          // onMenuTap={() => {
          //   playHapticEffect(hapticEffects.impactLight);
          //   updateState({ MenuModalVisible: !MenuModalVisible });
          // }}
        /> */}
      <Modal
        isVisible={isProductImageLargeViewVisible}
        style={{
          height: height,
          width: width,
          margin: 0,
        }}
        animationInTiming={600}>
        {renderImageZoomingView()}
      </Modal>
    </WrapperContainer>
  );
}
const htmlStyle = StyleSheet.create({
  h2: {
    color: '#e5e5e7', // make links coloured pink
  },
});
