import { View, Text, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import WrapperContainer from '../../../Components/WrapperContainer'
import { useDarkMode } from 'react-native-dynamic';
import { useSelector } from 'react-redux';
import { MyDarkTheme } from '../../../styles/theme';
import colors from '../../../styles/colors';
import { loaderOne } from '../../../Components/Loaders/AnimatedLoaderFiles';
import Header from '../../../Components/Header';
import imagePath from '../../../constants/imagePath';
import strings from '../../../constants/lang';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import fontFamily from '../../../styles/fontFamily';
import Modal from 'react-native-modal';
import { height, moderateScale, moderateScaleVertical, textScale, width } from '../../../styles/responsiveSize';

import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import actions from '../../../redux/actions';
import { showError } from '../../../utils/helperFunctions';
import { isEmpty } from 'lodash';
import { color } from 'react-native-reanimated';
import * as RNLocalize from 'react-native-localize';
import * as moments from 'moment-timezone'


export default function VendorScheduling() {
    LocaleConfig.locales['es'] = {

        monthNames: [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre'
        ],
        monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
        dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        dayNamesShort: ['Dom',
            'Lun',
            'Mar',
            'Mie',
            'Jue',
            'Vie',
            'Sab'],
        today: "Hoy"
    };

    LocaleConfig.locales['en'] = {
        monthNames: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ],

        monthNamesShort: ['Jan', 'Feb', 'March', 'Avril', 'May', 'June', 'July.', 'Aug', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
        today: "Today"
    };
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
    const { storeSelectedVendor } = useSelector((state) => state?.order);
    const darkthemeusingDevice = useDarkMode();
    const isDarkMode = themeToggle ? darkthemeusingDevice : themeColor;
    const [isSlotModal, setSlotModal] = useState(false)
    const [selectDays, setSelectDays] = useState([])
    const [startTime, setStartTime] = useState('00:00')
    const [endTime, setEndTime] = useState('00:30')
    const [slotData, setSlotData] = useState([])
    const [slotDateData, setSlotDateData] = useState([])
    const [singleSlotData, setSingleSlotData] = useState({})
    const [isDatePicker, setIsDatePicker] = useState(false)
    const [markedDate, setMarkedDate] = useState('')
    const [isDatePickerStart, setIsDatePickerStart] = useState(false)
    // const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(moment().tz(RNLocalize.getTimeZone()))
    const [selectSlotType, setSelectSlotType] = useState(2)
    let data = [{ id: 2, tittle: !isEmpty(singleSlotData) ? `${strings.EDIT_FOR_ALL} ${moment(selectedDate).lang(languages?.primary_language?.sort_code).format('ddd')}` : strings.DAY }, { id: 1, tittle: strings.DATE }]
    console.log(singleSlotData, "***********")

    let weekdays = [
        { id: 1, tittle: strings.SUNDAY },
        { id: 2, tittle: strings.MONDAY },
        { id: 3, tittle: strings.TUESDAY },
        { id: 4, tittle: strings.WEDNESDAY },
        { id: 5, tittle: strings.THURSDAY },
        { id: 6, tittle: strings.FRIDAY },
        { id: 7, tittle: strings.SATURDAY },
    ]

    console.log(languages, 'languageslanguages')
    useEffect(() => {
        getVendorsSlots()
    }, [])

    console.log(selectDays, 'selectDaysselectDays')
    LocaleConfig.defaultLocale = languages.primary_language.sort_code;


    const currentDate = new Date();

// Add one day to the current date

const minimumDate = currentDate.setDate(currentDate.getDate() + 1);
// Now, currentDate contains the date one day in the future
console.log('Current Date + 1 Day:', minimumDate);

    const getVendorsSlots = (day) => {

        console.log(day, 'dayday')
     
        let inputDate = day?.dateString
        console.log(inputDate, 'datedatedate inputDate')

        var date = day ? !!inputDate ? new Date(inputDate) : new Date(day) : new Date()
        console.log(date.toDateString(), 'datedateasdasdf');
        // ***********************************************


        var mexicoTimeZone = RNLocalize.getTimeZone(); // Central Time zone
        var dateWithTimeZone;

        if (day) {
            dateWithTimeZone = !!inputDate ? moment.tz(inputDate, mexicoTimeZone) : moment.tz(day, mexicoTimeZone);
        } else {
            dateWithTimeZone = moment.tz(mexicoTimeZone);
        }
        console.log(date,'ksdfgislfilsegr');
        // alert(date,)
        var formattedDate = dateWithTimeZone.toISOString(); 
        // return alert(formattedDate)
    
        //  ****************************************************
        console.log(new Date(), 'datedatedate')
        setMarkedDate(inputDate || moment(formattedDate).format('YYYY-MM-DD'))
        setSelectedDate(date)
        // const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
      
        var dayOfWeek = dateWithTimeZone.format('ddd, YYYY-MM-DD, h:mm:ss A'); // Format the date
     
   
        let data = dayOfWeek?.split(',')[0]

        var dayWeek
        switch (data) {
            case "Sun": dayWeek = 1
                break;

            case "Mon": dayWeek = 2
                break;
            case "Tue": dayWeek = 3
                break;
            case "Wed": dayWeek = 4
                break;
            case "Thu": dayWeek = 5
                break;
            case "Fri": dayWeek = 6
                break;
            case "Sat": dayWeek = 7
                break;
        }

        let queryData = `?vendor_id=${storeSelectedVendor?.id}&date=${moment(formattedDate).format('YYYY-MM-DD')}&day=${dayWeek}`
        console.log(queryData, 'ldfsdfgoshfgos');
       

        let headers = {
            code: appData?.profile?.code,
            currency: currencies?.primary_currency?.id,
            language: languages?.primary_language?.id,
        };
        actions.getVendorSlot(queryData, {}, headers)
            .then((res) => {
                console.log(res, 'sreerseserse', isEmpty(res?.data?.slot_dates), isEmpty(res?.data?.slots))
                if (!isEmpty(res?.data?.slots) || !isEmpty(res?.data?.slot_dates)) {
                    console.log('hihihihihi')
                    setSlotData(res?.data?.slots)
                    setSlotDateData(res?.data?.slot_dates)
                }
                else {
                    console.log(!!day?.dateString, 'hihihihihi111')
                    if (!!day?.dateString) {
                        setSlotModal(true)
                        setSlotData([])
                    }
                    else {
                        setSlotModal(false)
                        setSlotData([])
                    }
                }
            })
            .catch((err) => console.log(err, 'errerererrer'))
    }
    console.log(slotData, 'slotdatatadat')
    const onDateSet = (val) => {

        // if (isDatePickerStart) {
        //     setStartTime(val)
        //     setIsDatePickerStart(false)
        // }
        // else{

        setSelectedDate(val)
        setIsDatePicker(false)
        // }
    };


    console.log(storeSelectedVendor, 'storeSelectedVendorstoreSelectedVendor')
    const addVendorSlots = () => {
        if (startTime > endTime) {
            // console.log("sdkljf;", startTime, endTime)
            return
        }
        if (!isEmpty(singleSlotData)) {
            var date = new Date(selectedDate)

            const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
            var dayWeek = 1
            switch (dayOfWeek) {
                case "Sun": dayWeek = 1
                    break;

                case "Mon": dayWeek = 2
                    break;
                case "Tue": dayWeek = 3
                    break;
                case "Wed": dayWeek = 4
                    break;
                case "Thu": dayWeek = 5
                    break;
                case "Fri": dayWeek = 6
                    break;
                case "Sat": dayWeek = 7
                    break;
            }
            let data = {
                "vendor_id": storeSelectedVendor?.id,
                "start_time": startTime,
                "end_time": endTime,
                "slot_type_edit": selectSlotType == 1 ? 'date' : "day",
                "slot_type": ["delivery"],
                "slot_date": selectSlotType == 1 && moment(selectedDate).format('YYYY-MM-DD'),
                "edit_type": !singleSlotData?.day ? 'day' : "date",
                "edit_day": singleSlotData?.days?.day ? singleSlotData?.days?.day : selectSlotType == 1 ? '' : dayWeek,
                "edit_type_id": singleSlotData?.id,
                "slot_day_id": !!singleSlotData?.days?.id ? singleSlotData?.days?.id : ''
            }
            console.log(data, 'datadatadata')
            let headers = {
                code: appData?.profile?.code,
                currency: currencies?.primary_currency?.id,
                language: languages?.primary_language?.id,
            };
            actions.updateVendorSlot(data, headers)
                .then((res) => {
                    console.log(res, 'rseresrsrereer')
                    setSlotModal(false)
                    setStartTime('00:00')
                    setEndTime('00:00')
                    setSelectDays([])
                    setSelectSlotType(2)
                    setSingleSlotData({})
                    getVendorsSlots(selectedDate)
                })
                .catch((err) => console.log(err, 'erhgkrekuyg'))
        }
        else {
            if (isEmpty(selectDays) && selectSlotType == 2) {
                showError('Please Select Days')
                return
            }
            let data = {
                "vendor_id": storeSelectedVendor?.id,
                "start_time": startTime,
                "end_time": endTime,
                "stot_type": selectSlotType == 1 ? 'date' : "day",
                "slot_type": ["delivery"],
                "week_day": selectSlotType == 2 ? selectDays : '',
                "slot_date": selectSlotType == 1 ? moment(selectedDate).format('YYYY-MM-DD') : ''
            }
            console.log(data, 'datadatadata')
            let headers = {
                code: appData?.profile?.code,
                currency: currencies?.primary_currency?.id,
                language: languages?.primary_language?.id,
            };
            actions.addVendorSlot(data, headers)
                .then((res) => {
                    console.log(res, 'rseresrsrereer')
                    setSlotModal(false)
                    setStartTime('00:00')
                    setEndTime('00:00')
                    setSelectDays([])
                    setSelectSlotType(2)
                    setSingleSlotData({})
                    getVendorsSlots(selectedDate)
                })
                .catch((err) => console.log(err, 'erhgkrekuyg'))
        }
    }
    const deleteVendorSlot = () => {
        console.log(singleSlotData, 'singleSlotData')
        let data = {
            "slot_day_id": singleSlotData?.days?.id,
            "vendor_id": storeSelectedVendor?.id,
            "slot_id": singleSlotData?.id,
            "slot_type": selectSlotType == 2 ? 'day' : "date",
            "old_slot_type": !singleSlotData?.day ? 'date' : "day",
            "slot_date": !!singleSlotData?.specific_date ? singleSlotData?.specific_date : ''
        }
        console.log(data, 'datadatadata')
        let headers = {
            code: appData?.profile?.code,
            currency: currencies?.primary_currency?.id,
            language: languages?.primary_language?.id,
        };
        actions.deleteVendorSlot(data, headers)
            .then((res) => {
                console.log(res, 'rseresrsrereer')
                setSlotModal(false)
                getVendorsSlots(selectedDate)
                setSingleSlotData({})
            })
            .catch((err) => console.log(err, 'erhgkrekuyg'))
    }

    console.log(selectedDate, 'selectedDateselectedDate')
    return (
        <WrapperContainer
            bgColor={
                isDarkMode ? MyDarkTheme.colors.background : colors.white
            }
            statusBarColor={colors.white}
            source={loaderOne}
        // isLoadingB={isLoading}
        >
            <Header
                rightViewStyle={{ flex: 0.1 }}
                leftIcon={imagePath.icBackb}
                centerTitle={strings.VENDOR_SCHEDULING}
                righttextview={{ flex: 0.28 }}
                headerStyle={
                    {

                        shadowColor: colors.greyColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 1,
                        shadowRadius: 4,
                        backgroundColor: colors.white,
                        elevation: 8,
                        backgroundColor: isDarkMode ? MyDarkTheme.colors.background : colors.white
                    }
                }
            />

            <Calendar
                current={new Date()}
                minDate={new Date()}
                onDayPress={getVendorsSlots}
                // onDayLongPress={getVendorsSlots}
                markedDates={{
                    [markedDate]: {
                        selected: true,
                        disableTouchEvent: true,
                        selectedColor: themeColors.primary_color,
                        selectedTextColor: colors.white,
                    },
                }}
                theme={{
                    arrowColor: themeColors.primary_color,
                    textDayFontFamily: fontFamily.medium,
                    textMonthFontFamily: fontFamily.medium,
                    textDayHeaderFontFamily: fontFamily.bold,
                }}
            />

            {!isEmpty(slotData) ? slotData.map((item, inx) => {
                console.log(item, 'itemitemitem')
                return (
                    <View style={{ backgroundColor: colors?.lightGreyBorder, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} >
                        <Text style={{ padding: moderateScale(5) }}> {strings.Slot} {inx + 1} : {item?.start_time} - {item?.end_time}</Text>
                        {/* <Text> </Text> */}
                        <TouchableOpacity onPress={() => {
                            setSlotModal(true)
                            setSingleSlotData(item)
                            setSelectSlotType(2)
                            setStartTime(item?.start_time)
                            setEndTime(item?.end_time)
                        }}>

                            <Image source={imagePath?.edit1Royo} style={{ marginHorizontal: moderateScale(20) }} />
                        </TouchableOpacity>
                    </View>
                )
            }) : <></>}



            {!isEmpty(slotDateData) ? slotDateData.map((item, inx) => {
                console.log(item, 'itemitemitem')
                return (
                    <TouchableOpacity style={{ backgroundColor: colors?.lightGreyBorder, flexDirection: "row", justifyContent: "space-between" }} onPress={() => {
                        setSlotModal(true)
                        setSingleSlotData(item)
                        // setSelectSlotType(1)
                        setSelectedDate(item?.specific_date)
                        setStartTime(item?.start_time)
                        setEndTime(item?.end_time)
                    }}>
                        <Text style={{ padding: moderateScale(5) }}>   {strings.Slot} {!isEmpty(slotData) ? slotData.length + inx + 1 : inx + 1} : {item?.start_time} - {item?.end_time}</Text>
                        {/* <Text> </Text> */}
                        <TouchableOpacity onPress={() => {
                            setSlotModal(true)
                            setSingleSlotData(item)
                            setSelectSlotType(1)
                            setStartTime(item?.start_time)
                            setSelectedDate(item?.specific_date)
                            setEndTime(item?.end_time)
                        }}>

                            <Image source={imagePath?.edit1Royo} style={{ marginHorizontal: moderateScale(20) }} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )
            }) : <></>}
            {(!isEmpty(slotData) || !isEmpty(slotDateData)) && <TouchableOpacity style={{
                backgroundColor: themeColors.primary_color,
                padding: moderateScale(5),
                borderRadius: moderateScale(5),
                margin: moderateScale(20),
                // flex:0.5
                width: width / 3.5
            }} onPress={() => setSlotModal(true)}>
                <Text style={{ color: 'white', textAlign: "center" }}>{strings?.ADD_SLOT}</Text>
            </TouchableOpacity>}
            <Modal isVisible={isSlotModal} avoidKeyboard onBackdropPress={() => setSlotModal(false)}>
                <View style={{ margin: moderateScale(10), backgroundColor: 'white', borderRadius: moderateScale(15) }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", margin: moderateScale(10) }}>
                        <View>
                            <Text style={{
                                paddingTop: moderateScaleVertical(10),
                                fontFamily: fontFamily?.medium,
                                marginHorizontal: moderateScale(10),
                                fontSize: textScale(16)
                            }}>
                                {strings.Slot}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            setSlotModal(false)
                            setSingleSlotData({})
                            setSelectDays([])
                            setSelectSlotType(2)

                        }}>
                            <Image source={imagePath?.cross} />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={{
                            // paddingTop: moderateScaleVertical(10),
                            fontFamily: fontFamily?.regular,
                            marginHorizontal: moderateScale(10),
                            fontSize: textScale(14)
                        }}>
                            {strings?.START_TIME}
                        </Text>
                        <TextInput placeholder='00:00' style={{
                            borderWidth: .5,
                            marginHorizontal: moderateScale(10),
                            borderRadius: moderateScale(10),
                            marginVertical: moderateScaleVertical(5)
                        }} value={startTime}
                            onChangeText={(text) => setStartTime(text)} />
                        {/* <TouchableOpacity style={{
                            borderWidth: .5,
                            marginHorizontal: moderateScale(10),
                            borderRadius: moderateScale(10),
                            marginVertical: moderateScaleVertical(5),
                            height: moderateScale(40)
                        }} onPress={() => {
                            setIsDatePicker(true)
                            setIsDatePickerStart(true)
                        }
                        }>
                            <Text style={{ padding: moderateScale(10) }}> {startTime ? moment(startTime).format('hh:mm') : '00:00'}</Text>

                        </TouchableOpacity> */}
                    </View>
                    <View>

                        <Text style={{
                            // paddingTop: moderateScaleVertical(10),
                            fontFamily: fontFamily?.regular,
                            marginHorizontal: moderateScale(10),
                            fontSize: textScale(14)
                        }}>
                            {strings?.END_TIME}
                        </Text>
                        <TextInput placeholder='00:30' style={{
                            borderWidth: .5,
                            marginHorizontal: moderateScale(10),
                            borderRadius: moderateScale(10),
                            marginVertical: moderateScaleVertical(5)
                        }}
                            value={endTime}
                            onChangeText={(text) => setEndTime(text)}
                        />
                    </View>
                    <View>

                        <Text style={{
                            // paddingTop: moderateScaleVertical(10),
                            fontFamily: fontFamily?.regular,
                            margin: moderateScale(10),
                            fontSize: textScale(14)
                        }}>
                            {strings.SLOTS_FOR}
                        </Text>
                        {data.map((item, inx) => {
                            console.log(item, "*(**(*(*(*(*(*(*(*")
                            return (
                                <TouchableOpacity style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginHorizontal: moderateScale(10)
                                }}
                                    onPress={() => setSelectSlotType(item?.id)}
                                >
                                    <Image source={selectSlotType == item?.id ? imagePath?.radioActive : imagePath?.radioInActive} style={{
                                        height: moderateScale(15),
                                        width: moderateScale(15)
                                    }} />
                                    <Text style={{
                                        fontFamily: fontFamily?.regular,
                                        marginHorizontal: moderateScale(10),
                                        fontSize: textScale(14)
                                    }}>{item?.tittle}</Text>
                                </TouchableOpacity>)
                        })}
                    </View>
                    {selectSlotType == 2 ?
                        isEmpty(singleSlotData) ? <View>

                            <Text style={{
                                // paddingTop: moderateScaleVertical(10),
                                fontFamily: fontFamily?.regular,
                                marginHorizontal: moderateScale(10),
                                fontSize: textScale(14)
                            }}>
                                {strings.SELECT_DAYS_OF_WEEK}
                            </Text>
                            {
                                isEmpty(singleSlotData) && weekdays.map((item, inx) => {
                                    return (
                                        <TouchableOpacity style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginHorizontal: moderateScale(10)
                                        }}
                                            onPress={() => {
                                                let cloneArray = [...selectDays]
                                                cloneArray?.includes(item?.id)
                                                    ? cloneArray.splice(cloneArray.indexOf(item?.id), 1)
                                                    : cloneArray.push(item?.id)
                                                setSelectDays(cloneArray)
                                            }

                                            }
                                        >
                                            <Image source={selectDays.includes(item?.id) ? imagePath?.check : imagePath?.unCheck} style={{
                                                height: moderateScale(15),
                                                width: moderateScale(15)
                                            }} />
                                            <Text style={{
                                                fontFamily: fontFamily?.regular,
                                                marginHorizontal: moderateScale(10),
                                                fontSize: textScale(14)
                                            }}>{item?.tittle}</Text></TouchableOpacity>
                                    )
                                })
                            }

                        </View> : <></> : <View>

                            <Text style={{
                                // paddingTop: moderateScaleVertical(10),
                                fontFamily: fontFamily?.regular,
                                marginHorizontal: moderateScale(10),
                                fontSize: textScale(14)
                            }}>
                                {strings.SLOT_DATE}
                            </Text>
                            <TouchableOpacity style={{
                                borderWidth: .5,
                                marginHorizontal: moderateScale(10),
                                borderRadius: moderateScale(10),
                                marginVertical: moderateScaleVertical(5),
                                height: moderateScale(40)
                            }} onPress={() => setIsDatePicker(true)}>
                                <Text style={{ padding: moderateScale(10) }}> {markedDate ? markedDate : 'Select Date'}</Text>

                            </TouchableOpacity>
                        </View>
                    }
                    {console.log(selectedDate,'ccz')}
                    {!isEmpty(singleSlotData) ? <TouchableOpacity style={{
                        padding: moderateScale(10),
                        borderRadius: moderateScale(10),
                        borderColor: colors?.redB,
                        backgroundColor: colors?.redB,
                        borderWidth: 1, margin: moderateScale(10)
                    }}
                        onPress={deleteVendorSlot}>
                        <Text style={{ fontSize: textScale(15), color: 'white' }}>{strings.DELETE_STORE}</Text>
                    </TouchableOpacity> : <></>}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", margin: moderateScale(15) }}>
                        <TouchableOpacity style={{
                            paddingHorizontal: moderateScale(30),
                            borderRadius: moderateScale(20),
                            borderColor: colors?.grayOpacity51,
                            backgroundColor: colors?.borderLight,
                            justifyContent: "center"
                        }}
                            onPress={() => {
                                setSlotModal(false)
                                setStartTime('00:00')
                                setEndTime('00:00')
                                setSelectDays([])
                                setSelectSlotType(2)
                                setSingleSlotData({})
                            }}>
                            <Text style={{ textAlign: 'center', fontSize: textScale(15) }}>{strings.CLOSES}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            padding: moderateScale(20),
                            borderRadius: moderateScale(20),
                            borderColor: colors?.blueB,
                            borderWidth: 1
                        }}
                            onPress={addVendorSlots}
                        >
                            <Text style={{ fontSize: textScale(15) }}>{strings.SAVE}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>
            {!!isDatePicker && <DatePicker
                title={strings.SELECT_DATE}
                open={isDatePicker}
                mode={"date"}
                minimumDate={new Date(minimumDate)}
                modal
                locale={
                    languages?.primary_language?.sort_code
                        ? languages?.primary_language?.sort_code
                        : "en"
                }

                textColor={isDarkMode ? colors.black : colors.blackB}
                theme='light'
                date={selectedDate}
                style={{
                    width: width - 20,
                    height: height / 4.4,
                }}
                cancelText={strings.CANCEL}
                confirmText={strings.CONFIRM}
                onConfirm={date => onDateSet(date)}
                onCancel={() => setIsDatePicker(false)}
            />
            }
            {/* {!!isDatePickerStart && <DatePicker
                open={isDatePickerStart}
                mode={"time"}
                // minimumDate={new Date()}
                modal
                locale={
                    languages?.primary_language?.sort_code
                        ? languages?.primary_language?.sort_code
                        : "en"
                }

                textColor={isDarkMode ? colors.black : colors.blackB}
                date={startTime}
                style={{
                    width: width - 20,
                    height: height / 4.4,
                }}
                onConfirm={date => onDateSet(date)}
                onCancel={() => setIsDatePickerStart(false)}
            />} */}

        </WrapperContainer >
    )
}