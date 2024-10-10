import React, {useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  RefreshControl,
  BackHandler,
} from 'react-native';
import {useState} from 'react';
import WrapperContainer from '../../../Components/WrapperContainer';
import imagePath from '../../../constants/imagePath';
import {
  moderateScale,
  moderateScaleVertical,
  width,
} from '../../../styles/responsiveSize';
import fontFamily from '../../../styles/fontFamily';
import navigationStrings from '../../../navigation/navigationStrings';
import colors from '../../../styles/colors';
import {BarChart} from 'react-native-chart-kit';
import {FlatList} from 'react-native';
import OrderCard from '../../../Components/OrderCard';
import commonStyles from '../../../styles/commonStyles';
import {
  boxWidth,
  customMarginBottom,
  customMarginLeftForBox,
} from '../../../utils/constants/constants';
import Header from '../../../Components/Header';
import {useSelector} from 'react-redux';
import actions from '../../../redux/actions';
import moment from 'moment';
import {
  androidBackButtonHandler,
  showError,
} from '../../../utils/helperFunctions';
import debounce from 'lodash.debounce';
import {cloneDeep, isEmpty} from 'lodash';
import {TouchableOpacity} from 'react-native';
import MonthPicker from 'react-native-month-year-picker';
import Modal from 'react-native-modal';
import SelectVendorListModal from '../../../Components/SelectVendorListModal';
import {loaderOne} from '../../../Components/Loaders/AnimatedLoaderFiles';
import {enums} from '../../../utils/enums';
import strings from '../../../constants/lang';
import DashboardCount from '../../../Components/DashboardCount';
import RejectResonModal from '../../../Components/RejectResonModal';
import {useFocusEffect} from '@react-navigation/native';
import DatePickrModal from '../../../Components/DatePickrModal';
import {retrieveSetupIntent} from '@stripe/stripe-react-native';
import useInterval from '../../../utils/useInterval';
import { string } from 'prop-types';
import { getUserData } from '../../../utils/utils';
import socketServices from '../../../utils/scoketService';

let vendorLimit = 50;

const commonStyle = commonStyles({
  fontFamily,
  buttonTextColor: colors.themeColor2,
});

const RoyoHome = (props) => {
  const {navigation} = props;
  const {storeSelectedVendor} = useSelector((state) => state?.order);
  const {appData, currencies, languages} = useSelector(
    (state) => state.initBoot
  );

  const [state, setState] = useState({
    pageActive: 1,
    limit: 10,
    isLoading: true,
    isRefreshing: false,
    labels: [],
    datasets: [],
    newOrder: [],
    totalRevenue,
    showRevenueDate: false,
    showOrderDate: false,
    revenueDate: new Date(),
    orderDate: new Date(),
    isVendorSelectModal: false,
    sales: [],
    isRejectResonModal: false,
    rejectedOrder: null,
    reason: '',
  });

  const {
    totalRevenue,
    datasets,
    labels,
    pageActive,
    isRefreshing,
    showOrderDate,
    showRevenueDate,
    orderDate,
    revenueDate,
    isVendorSelectModal,
    isLoading,
    sales,
    isRejectResonModal,
    rejectedOrder,
    reason,
  } = state;

  const updateState = (data) => setState((state) => ({...state, ...data}));
  const _onChangeText = (key) => (val) => {
    updateState({[key]: val});
  };
  const [currentVendor, setCurrVendor] = useState(null);
  const [availVendor, setAvailVendor] = useState([]);
  const [ordersCount, setOrdersCount] = useState({
    pending: 0,
    active: 0,
    cancelled: 0,
    delivered: 0,
  });
  const [allNewOrder, setAllNewOrder] = useState([]);
  const [totalOrder, setTotalOrder] = useState(0);
  const vendorPage = useRef(1);
  const vendorLoadMore = useRef(true);

  //reset pagination values
  useEffect(() => {
    const focus = navigation.addListener('focus', () => {
      vendorPage.current = 1;
      vendorLoadMore.current = true;
    });
    const blur = navigation.addListener('blur', () => {
      vendorPage.current = 1;
      vendorLoadMore.current = true;
    });
    return focus, blur;
  }, []);


  
  const getUserDataFromAsyn = async () => {
    let userData =  await getUserData()
     console.log(userData,'userDatauserData>>>>', appData?.profile?.socket_url);
    if (!!userData?.auth_token && !!appData?.profile?.socket_url) {
        socketServices.initializeSocket(appData?.profile?.socket_url);
    }

  }


  useEffect(() => {
    getUserDataFromAsyn()
}, [appData]);

  useEffect(() => {
    fetchAllVendors();
  }, [isRefreshing, currentVendor]);

  const fetchAllVendors = async () => {
    let query = `?limit=${vendorLimit}&page=1`;
    let headers = {
      code: appData?.profile?.code,
      currency: currencies?.primary_currency?.id,
      language: languages?.primary_language?.id,
    };
    try {
      const res = await actions.storeVendors(query, headers);
      console.log('available vendors res', isEmpty(res?.data?.data));
      if (!!res?.data && res?.data?.data?.length > 0) {
        let firstVendor = !!currentVendor ? currentVendor : res?.data?.data[0];

        setAvailVendor(res.data.data);
        setCurrVendor(firstVendor);
        await availVendorCount(firstVendor?.id); //sent vendor id to fetch available vendors
        await getAllVendorOrder(firstVendor?.id); //sent vendor id to fetch selected vendor orders
        _getRevenueDashboardData(firstVendor, new Date(), 0);
        actions.savedSelectedVendor(firstVendor);
        updateState({isRefreshing: false, isLoading: false});
        // _getVendorProfile(firstVendor);
      }
      updateState({isRefreshing: false, isLoading: false});
    } catch (error) {
      console.log('error riased', error);
      updateState({isRefreshing: false, isLoading: false});
      showError(error?.message || error?.error);
    }
  };

  useEffect(() => {
    const apiInterval = setInterval(() => {
      availVendorCount(currentVendor?.id);
      getAllVendorOrder(currentVendor?.id);
    }, 5000);
    return () => {
      clearInterval(apiInterval);
    };
   
  }, [currentVendor]);

  const fetchVendorPagination = async () => {
    let query = `?limit=${vendorLimit}&page=${vendorPage.current}`;
    let headers = {
      code: appData?.profile?.code,
      currency: currencies?.primary_currency?.id,
      language: languages?.primary_language?.id,
    };
    try {
      const res = await actions.storeVendors(query, headers);
      console.log('available vendors res', res?.data?.data);

      if (res?.data?.data?.length == 0) {
        vendorLoadMore.current = false;
      }
      let meregeData =
        vendorPage.current == 1
          ? res?.data?.data
          : [...availVendor, ...res?.data?.data];
      setAvailVendor(meregeData);
      updateState({isRefreshing: false});
    } catch (error) {
      console.log('error riased', error);
    }
  };

  const availVendorCount = async (id) => {
    let headers = {
      code: appData?.profile?.code,
      currency: currencies?.primary_currency?.id,
      language: languages?.primary_language?.id,
    };
    try {
      const res = await actions.vendorOrderCount(`/${id}`, headers);
      console.log('available vendors count res', res.data);
      updateState({isLoading: false});
      setOrdersCount({
        pending: res?.data?.pending_orders,
        active: res?.data?.active_orders,
        cancelled: res?.data?.cancelled_orders,
        delivered: res?.data?.completed_orders,
      });
    } catch (error) {
      updateState({isLoading: false});
      console.log('error riased', error);
      showError(error?.error || error?.message);
    }
  };

  const getAllVendorOrder = async (id) => {
    let query = `/${id}?limit=${10}&page=${1}&type=pending`;
    let headers = {
      code: appData?.profile?.code,
      currency: currencies?.primary_currency?.id,
      language: languages?.primary_language?.id,
    };
    try {
      const res = await actions.allVendorOrders(query, headers);
      console.log('all vendor orders count', res);
      setAllNewOrder(res.data.data);
    } catch (error) {
      console.log('error riased', error);
      showError(error?.error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        androidBackButtonHandler,
      );
      return () => backHandler.remove();
    }, []),
  );

  const toggleRevenueDate = () => {
    updateState({
      showRevenueDate: true,
    });
  };
  const toggleOrderDate =  () => {
    updateState({
      showOrderDate: true,
    });
  };
  const _onBackdropPress = () => {
    updateState({showRevenueDate: false});
  };
  const onChangeOrderDate = (newDate) => {
    console.log(new Date(newDate), 'newDateeee');
    if (newDate) {
      let date = new Date(newDate);
      updateState({
        orderDate: date,
        showOrderDate: false,
      });
      _getRevenueDashboardData(currentVendor, date, 2);
    } else
      updateState({
        showOrderDate: false,
      });
  };
  const onChageRevenueDate = (newDate) => {
    console.log(new Date(newDate), 'newDateeee');
    if (newDate) {
      let date = new Date(newDate);
      updateState({
        revenueDate: date,
        showRevenueDate: false,
      });
      _getRevenueDashboardData(currentVendor, date, 0);
    } else
      updateState({
        showRevenueDate: false,
      });
  };

  const _getRevenueDashboardData = (selectedVendorData, date, ...params) => {
    console.log(params,"paramsparamsparams");
    let data = {};
    data['type'] = 'monthly';
    data['vendor_id'] = selectedVendorData ? selectedVendorData?.id : '';
    data['start_date'] = `${moment(date)
      .startOf('year')
      .format('YYYY')}-${moment(date).startOf('month').format('MM')}-01`;
    data['end_date'] = `${moment(date).startOf('year').format('YYYY')}-${moment(
      date,
    )
      .startOf('month')
      .format('MM')}-${moment(date).endOf('month').format('DD')}`;

    actions
      .getRevenueDashboardData(data, {
        code: appData?.profile?.code,
        currency: currencies?.primary_currency?.id,
        language: languages?.primary_language?.id,
      })
      .then((res) => {
        console.log(res.data.total_order, 'res__getRevnueData>>>dashboard');

        const dates = res.data.dates.map(
          (el) =>
            `${moment(el).startOf('month').format('MMM')}-${el.slice(8, 11)}`,
        );
        // console.log('checking selected vendor data', dates);
        if (res?.data?.dates.length) {
          let totalRevenue = res.data.revenue.reduce(
            (partial_sum, a) => parseFloat(partial_sum) + parseFloat(a),
            parseFloat(0),
          );
            setTotalOrder(res.data.total_order);
     
          updateState({
            isRefreshing: false,
            isLoading: false,
            labels: dates,
            datasets: params[0] == 2 ? datasets : res.data.revenue,
            totalRevenue: totalRevenue,
            sales:
              params[0] == 1
                ? sales
                : res.data.sales.map((el) => el.toString()),
            // totalPendingOrder: res.data.total_pending_order,
            // totalCancelledOrder: res.data.total_rejected_order,
            // totalActiveOrder: res.data.total_active_order,
            // totalCompletedOrder: res.data.total_delivered_order,
          });
        } else {
          let totalRevenue = res.data.revenue.reduce(
            (partial_sum, a) => parseFloat(partial_sum) + parseFloat(a),
            parseFloat(0),
          );
            setTotalOrder(res.data.total_order);
         
          updateState({
            isLoading: false,
            isRefreshing: false,
            labels: dates,
            totalRevenue: totalRevenue,
            datasets: params[0] == 2 ? datasets : res.data.revenue,
            sales:
              params[0] == 1
                ? sales
                : res.data.sales.map((el) => el.toString()),
          });
        }
      })
      .catch(errorMethod);
  };

  //error handling
  const errorMethod = (error) => {
    updateState({
      isLoading: false,
    });
    showError(error?.message || error?.error);
  };

  const barData = {
    labels: labels,
    datasets: [
      {
        data: datasets,
        colors: [
          (opacity = 1) => `rgba(4, 14, 22, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
          (opacity = 1) => `rgba(174, 44, 242, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
          (opacity = 1) => `rgba(7, 14, 242, ${opacity})`,
          (opacity = 1) => `rgba(174, 144, 22, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
          (opacity = 1) => `rgba(174, 44, 242, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
          (opacity = 1) => `rgba(7, 14, 242, ${opacity})`,
        ],
      },
    ],
  };

  const salesBarData = {
    labels: labels,
    datasets: [
      {
        data: sales,
        colors: [
          (opacity = 1) => `rgba(4, 14, 22, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
          (opacity = 1) => `rgba(174, 44, 242, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
          (opacity = 1) => `rgba(7, 14, 242, ${opacity})`,
          (opacity = 1) => `rgba(174, 144, 22, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
          (opacity = 1) => `rgba(174, 44, 242, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
          (opacity = 1) => `rgba(7, 14, 242, ${opacity})`,
        ],
      },
    ],
  };
  const onEndReached = ({distanceFromEnd}) => {
    updateState({pageActive: pageActive + 1});
  };

  const onEndReachedDelayed = debounce(onEndReached, 1000, {
    leading: true,
    trailing: false,
  });

  const chartConfig = {
    barRadius: moderateScale(2.5),
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    fillShadowGradientOpacity: 0,
    fillShadowGradient: colors.black,
    yAxisInterval: 2,
    barPercentage: 0.75,
    decimalPlaces: 0, // optional, defaults to 2dp
    color: (opacity = 1) => `rgba(74, 144, 242, ${opacity})`,
    labelColor: (opacity = 0.61) => `rgba(40, 62, 58, ${opacity})`,
    propsForDots: {
      r: '6',
      strokeWidth: '1',
      stroke: colors.themeColor2,
    },
  };
  const updateOrderStatus = (acceptRejectData, status) => {
    let data = {};
    if (status === 8) {
      data['reject_reason'] = reason;
    }
    data['order_id'] = acceptRejectData?.id;
    data['vendor_id'] = currentVendor?.id;
    data['order_status_option_id'] = status;
    console.log(data, 'data>>>Sending');
    updateState({isLoadingB: true});
    actions
      .updateOrderStatus(data, {
        code: appData?.profile?.code,
        currency: currencies?.primary_currency?.id,
        language: languages?.primary_language?.id,
        // systemuser: DeviceInfo.getUniqueId(),
      })
      .then((res) => {
        if (res && res.status == 'success') {
          getAllVendorOrder(currentVendor.id);
          availVendorCount(currentVendor.id);
        }
      })
      .catch(errorMethod);
  };

  const handleRefresh = () => {
    vendorPage.current = 1;
    vendorLoadMore.current = true;
    updateState({isRefreshing: true});
    updateState({revenueDate: new Date()})
    updateState({orderDate: new Date()})
    
  };

  const _reDirectToVendorList = () => {
    updateState({
      isVendorSelectModal: true,
    });
  };

  const onVendorSelect = (item) => {
    updateState({isVendorSelectModal: false, pageNo: 1});
    setTimeout(() => {
      updateState({isLoading: true});
      setCurrVendor(item);
      availVendorCount(item.id); // by defa
      actions.savedSelectedVendor(item);
    }, 500);
  };

  const BarWidth = () => moderateScale(labels.length * 65);

  const onPressDashboard = (index) => {
    // navigation.navigate(navigationStrings.VENDOR_ORDER, {index: index})
    navigation.navigate(navigationStrings.ROYO_VENDOR_ORDER, {
      screen: navigationStrings.VENDOR_ORDER,
      params: {index: index},
    });
  };
  const onClose = () => {
    updateState({
      isRejectResonModal: false,
    });
  };
  const onRejectPress = (item, status) => {
    updateState({
      isRejectResonModal: true,
      rejectedOrder: item,
      rejectedOrderStatus: status,
    });
  };
  const onSubmit = () => {

    if (reason == '' || isEmpty(reason)) {
       alert('please enter the reason')
       return
    }
    updateOrderStatus(rejectedOrder, 8);
    updateState({
      isRejectResonModal: false,
    });
  };
  const renderNewOrder = ({item, index}) => {
    return (
      <View
        style={{
          marginLeft: customMarginLeftForBox(index),
          flex: 1,
        }}>
        <OrderCard
          onPress={() =>
            navigation.navigate(navigationStrings.ORDER_DETAIL, {
              data: item,
              selectedVendor: currentVendor,
            })
          }
          updateOrderStatus={updateOrderStatus}
          item={item}
          onRejectPress={onRejectPress}
        />
      </View>
    );
  };

  const onEndReachedVendor = () => {
    if (vendorLoadMore.current) {
      vendorPage.current = vendorPage.current + 1;
      fetchVendorPagination();
    }
    console.log('end reached');
  };

  return (
    <WrapperContainer
      bgColor={colors.white}
      statusBarColor={colors.white}
      isLoadingB={isLoading}
      source={loaderOne}>
      <Header
        centerTitle={`${
          !isEmpty(currentVendor) ? `${currentVendor?.name}` : 'Select a vendor'
        } `}
        onPressLeft={() => {
          navigation.navigate(navigationStrings.TAB_ROUTES);
        }}
        noLeftIcon={enums.isVendorStandloneApp}
        leftIcon={imagePath.backRoyo}
        onPressCenterTitle={() => _reDirectToVendorList()}
        onPressImageAlongwithTitle={() => _reDirectToVendorList()}
        imageAlongwithTitle={imagePath.dropdownTriangle}
        showImageAlongwithTitle
        // rightIcon={status ? imagePath.onlineRoyo : imagePath.offlineRoyo}
        // onPressRight={toggleStatus}
      />

      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.themeColor2}
          />
        }
        style={styles.container}
        showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.dashboard}>
            <DashboardCount
              heading={strings.PENDING_ORDERS}
              desc={strings.PENDING_ORDERS}
              count={ordersCount?.pending}
              index={0}
              image={imagePath.timerRoyo}
              onPress={() => onPressDashboard(0)}
            />
            <DashboardCount
              heading={strings.ACTIVE_ORDERS}
              desc={strings.ACTIVE_ORDERS}
              count={ordersCount?.active}
              index={1}
              image={imagePath.activeRoyo}
              onPress={() => onPressDashboard(1)}
            />
            <DashboardCount
              heading={strings.CANCELLED_ORDER}
              desc={strings.ORDER_CANCELLED}
              count={ordersCount?.cancelled}
              index={2}
              image={imagePath.cancelledRoyo}
              onPress={() => onPressDashboard(2)}
            />
            <DashboardCount
              heading={strings.DELIVERED_ORDERS}
              desc={strings.DELIVERED_ORDERS}
              count={ordersCount?.delivered}
              index={3}
              image={imagePath.deliveredRoyo}
              onPress={() => onPressDashboard(3)}
            />
          </View>
{console.log(String(revenueDate).slice(4, 7),'revenueDaterevenueDate')}
          <View style={styles.rowWrapSpace}>
            <View>
              <View style={styles.chartHeader}>
                <Text style={styles.font18Semibold}>{strings.REVENUE}</Text>
                <TouchableOpacity
                  onPress={toggleRevenueDate}
                  style={{flexDirection: 'row'}}>
                  <Text style={{...styles.font14Regular, color: '#2E3E3A5f'}}>
                    {String(revenueDate).slice(4, 7)}{' '}
                    {String(revenueDate).slice(11, 15)}
                  </Text>

                  <Image source={imagePath.dropdownTriangle} />
                </TouchableOpacity>
              </View>
              <View style={{...styles.graphContainer, zIndex: -1}}>
                <View style={styles.graphHeader}>
                  <Text style={{...styles.font13Regular, color: '#2E3E3A5f'}}>
                    {strings.TOTAL_REVENUE}
                  </Text>
                  <Text style={styles.font16Bold}>
                    {currencies?.primary_currency?.symbol}
                    {!!totalRevenue ? Number(totalRevenue).toFixed(2) : 0}
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    withCustomBarColorFromData={true}
                    style={{margin: 0, padding: 0, flex: 1, marginLeft: 0}}
                    // yLabelsOffset={30}
                    data={barData}
                    width={labels.length > 6 ? BarWidth() : boxWidth()}
                    height={moderateScaleVertical(250)}
                    yAxisLabel={currencies?.primary_currency?.symbol}
                    yAxisInterval={2}
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    horizontalLabelRotation={0}
                    withInnerLines={false}
                    showBarTops={false}
                    fromZero={true}
                    flatColor={true}
                  />
                </ScrollView>
              </View>
            </View>
            <View>
              <View style={styles.chartHeader}>
                <Text style={styles.font18Semibold}>{strings.ORDERS}</Text>
                <TouchableOpacity
                  onPress={toggleOrderDate}
                  style={{flexDirection: 'row'}}>
                  <Text style={{...styles.font14Regular, color: '#2E3E3A5f'}}>
                    {String(orderDate).slice(4, 7)}{' '}
                    {String(orderDate).slice(11, 15)}
                  </Text>
                  <Image source={imagePath.dropdownTriangle} />
                </TouchableOpacity>
              </View>
              <View style={styles.graphContainer}>
                <View style={styles.graphHeader}>
                  <Text style={styles.font13Regular}>
                    {strings.TOTAL_ORDER_PLACED}
                  </Text>
                  <Text style={styles.font16Bold}>{totalOrder}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    withCustomBarColorFromData={true}
                    data={salesBarData}
                    width={labels.length > 6 ? BarWidth() : boxWidth()}
                    height={moderateScaleVertical(220)}
                    yAxisLabel=""
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    horizontalLabelRotation={0}
                    withInnerLines={false}
                    showBarTops={false}
                    fromZero={true}
                    flatColor={true}
                  />
                </ScrollView>
              </View>
            </View>
          </View>

          {/* new Order */}
          <View>
            <Text
              style={{
                ...styles.font18Semibold,
                marginVertical: moderateScaleVertical(16),
              }}>
              {strings.RECENTORDERS}
            </Text>
            <FlatList
              onEndReached={onEndReachedDelayed}
              onEndReachedThreshold={0.5}
              data={allNewOrder}
              showsVerticalScrollIndicator={false}
              bounces={false}
              numColumns={width > 600 ? 2 : 1}
              ListEmptyComponent={() => {
                return (
                  <View style={styles.emptyCartBody}>
                    <Image source={imagePath.emptyCartRoyo} />
                  </View>
                );
              }}
              renderItem={renderNewOrder}
              keyExtractor={(item, key) => key.toString()}
            />
          </View>
        </View>
      </ScrollView>
      <Modal
        isVisible={isVendorSelectModal}
        style={{
          margin: 0,
        }}>
        <View style={{flex: 1, backgroundColor: colors.white}}>
          <SelectVendorListModal
            vendorList={availVendor}
            onCloseModal={() => updateState({isVendorSelectModal: false})}
            onVendorSelect={onVendorSelect}
            selectedVendor={currentVendor}
            onEndReachedVendor={onEndReachedVendor}
          />
        </View>
      </Modal>

      {!!(showRevenueDate || showOrderDate) && (
        <DatePickrModal
          onBackdropPress={_onBackdropPress}
          isVisible={showRevenueDate || showOrderDate}
          showOrderDate={showOrderDate}
          showRevenueDate={showRevenueDate}
          onChangeOrderDate={onChangeOrderDate}
          onChageRevenueDate={onChageRevenueDate}
          revenueDate={revenueDate}
          orderDate={orderDate}
        />
      )}

      {/* <Modal
        onBackdropPress={() =>
          updateState({showRevenueDate: false,})
        }
        isVisible={showRevenueDate || showOrderDate}
        style={{
          margin: 0,
          justifyContent: 'flex-end',
        }}>
        <View style={{}}>
          {showRevenueDate && (
            <MonthPicker
              onChange={onChageRevenueDate}
              value={revenueDate}
              minimumDate={new Date(1999, 5)}
              maximumDate={new Date(2025, 5)}
              // locale="ko"
            />
          )}
          {showOrderDate && (
            <MonthPicker
              onChange={onChangeOrderDate}
              value={orderDate}
              minimumDate={new Date(1999, 5)}
              maximumDate={new Date(2025, 5)}
              // locale="ko"
            />
          )}
        </View>
      </Modal> */}
      {!!isRejectResonModal && (
        <RejectResonModal
          isVisible={isRejectResonModal}
          onClose={onClose}
          onSubmit={onSubmit}
          onChangeText={_onChangeText('reason')}
        />
      )}
    </WrapperContainer>
  );
};

export default React.memo(RoyoHome);

const styles = StyleSheet.create({
  font14Regular: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: '#2E3E3A6d',
  },
  font18Semibold: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    color: '#2E3E3A',
  },
  font16Bold: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.themeColor2,
    marginVertical: moderateScaleVertical(4),
  },
  font13Regular: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: '#2E3E3A5f',
  },
  container: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScaleVertical(24),
    marginBottom: customMarginBottom(18, 86),
    backgroundColor: 'transparent',
    backfaceVisibility: 'hidden',
  },
  dashboardImage: {
    shadowColor: 'rgba(242,96,97,0.23)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    flexShrink: 1,
    shadowRadius: 3.84,

    elevation: 19,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScaleVertical(18),
  },
  royoShop: {
    ...commonStyle.regularFont16,
    color: colors.black,
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.themeColor2,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(8),
    borderRadius: moderateScale(28),
  },

  indicator: {
    width: moderateScale(17),
    height: moderateScale(17),
    borderRadius: moderateScale(70),
    backgroundColor: colors.white,
    marginLeft: moderateScale(8),
  },
  warningBox: {
    marginBottom: moderateScaleVertical(16),
    flexDirection: 'row',
    paddingVertical: moderateScaleVertical(16),
    backgroundColor: '#D8D8D81f',
    width: width - moderateScale(30),
    borderRadius: moderateScale(5),
    paddingHorizontal: moderateScale(15),
  },
  btnContainer: {
    backgroundColor: colors.white,
    width: '100%',
    borderColor: colors.themeColor2,
  },
  btnText: {
    ...commonStyle.mediumFont16,
    color: colors.themeColor2,
  },
  emptyText: {
    ...commonStyle.mediumFont16,
    color: colors.black,
    marginVertical: moderateScaleVertical(40),
    textAlign: 'center',
  },
  span: {
    color: '#0091ff',
  },
  dashboard: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: moderateScaleVertical(16),
  },
  dashboardBox: {
    width: width > 600 ? width / 4.5 : width / 2.25,
    backgroundColor: '#F3F9F7',
    padding: moderateScale(16),
    borderRadius: moderateScaleVertical(6),
    marginBottom: moderateScaleVertical(16),
  },
  graphContainer: {
    padding: moderateScale(15),
    borderWidth: 1,
    borderRadius: moderateScale(6),
    borderColor: 'rgba(151,151,151,0.15)',
    marginBottom: moderateScaleVertical(16),
  },
  graphHeader: {
    backgroundColor: '#F3F9F7',
    padding: moderateScaleVertical(16),
    borderRadius: moderateScaleVertical(5),
    marginBottom: moderateScaleVertical(16),
  },

  rowWrapSpace: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: moderateScaleVertical(16),
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  emptyCartBody: {
    flex: 1,
    justifyContent: 'center',
    height: 400,
    alignItems: 'center',
  },
});
