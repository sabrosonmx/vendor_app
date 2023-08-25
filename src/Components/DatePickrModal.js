import { Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Modal from 'react-native-modal';
// import MonthPicker from 'react-native-month-year-picker';
import colors from '../styles/colors';
// import DatePicker from 'react-native-modern-datepicker';
import MonthPicker from 'react-native-month-picker';
import { moderateScaleVertical } from '../styles/responsiveSize';
const DatePickrModal = (
    {
        onBackdropPress=()=>{},
       
        showRevenueDate=false,
        showOrderDate=false,
        onChangeOrderDate=()=>{},
        onChageRevenueDate=()=>{},
        revenueDate={revenueDate},
        orderDate={orderDate}
    }
) => {
  return (
   
        <View 
          style={{
            marginBottom: Platform.OS==='ios'? moderateScaleVertical(100):0
          }}
        >
        {showRevenueDate && (
               <MonthPicker
               selectedBackgroundColor={colors.themeColor2}
               selectedDate={revenueDate}
               onMonthChange={selectedDate => onChageRevenueDate(selectedDate)}
             />
         
          )}
           {showOrderDate && (
               <MonthPicker
               selectedBackgroundColor={colors.themeColor2}
               selectedDate={revenueDate}
               onMonthChange={selectedDate => onChangeOrderDate(selectedDate)}
             />
         
          )}
      
        </View>
     
  )
}

export default React.memo(DatePickrModal)

const styles = StyleSheet.create({})