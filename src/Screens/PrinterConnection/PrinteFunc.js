import {
  BluetoothEscposPrinter,
  BluetoothManager,
} from '@brooons/react-native-bluetooth-escpos-printer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {appData, language} from './PrinterScreen';
import actions from '../../redux/actions';
import BackgroundService from 'react-native-background-actions';
import {getItem} from '../../utils/utils';
import strings from '../../constants/lang';
import moment from 'moment';
import SunmiPrinter from '@heasy/react-native-sunmi-printer';
import {isSunmiPrinterConnected} from '../../utils/helperFunctions';
const fs = RNFetchBlob.fs;

export let arr = [];
export let canEnablePrinter = true;
const deviceTimezone = moment.tz.guess();
/** @function : Get Details of order for print bills */
const _getOrderDetails = async _data => {
  let appData_ = {};
  let language_ = {};

  if (appData?.appData) {
    appData_ = appData;
  } else {
    appData_ = await getItem('appData');
  }

  if (language) {
    language_ = language;
  } else {
    language_ = await getItem('language');
  }

  console.log('check app data >>>>', JSON.stringify(_data));
  return new Promise((resolve, reject) => {
    let data = {};
    data['order_id'] = _data.id;
    // data['order_id'] = 424;
    console.log('check AppCode profile data >>>>', appData?.appData);
    actions
      .getOrderDetailForBilling(data, {
        // code: '245bae',
        code: appData_?.appData.profile?.code,
        currency: 1,
        language: language_ ? language_?.primary_language?.id : 148,
      })
      .then(res => {
        if (res?.data) {
          resolve(res?.data);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

/** @function : Queuing the jobs for printing in sequence */
export const StartPrinting = _data => {
  isSunmiPrinterConnected()
    .then(res => {
      console.log(res, 'dhdhdhdhhd');
      if (Platform.OS === 'android' && res) {
        console.log('check start printing >>>>', _data);
        arr.push(_data);
        if (canEnablePrinter) {
          console.log('check start printing >>>> 1');
          initPrinter(_data);
        }
      }
    })
    .catch(err => {
      console.log(err, 'errerrsunmi');
    });
};

/** @function : Start Printing Loop for all queued jobs */
export const initPrinter = _data => {
  console.log('check start printing >>>> 2', arr[0]);
  canEnablePrinter = false;

  _getOrderDetails(arr[0])
    .then(async res => {
      const version = await SunmiPrinter.getPrinterVersion();
      console.log(version, 'testversionversionversion');
      if (!!version) {
        console.log('printRecieptWithSunmi');
        printRecieptWithSunmi(res, _data).then(() => {
          arr.shift();
          setTimeout(() => {
            if (arr.length > 0) {
              initPrinter();
            } else {
              canEnablePrinter = true;
            }
          }, 2000);
        });
      } else {
        console.log('printReciept');
        printReciept(res).then(() => {
          arr.shift();
          setTimeout(() => {
            if (arr.length > 0) {
              initPrinter();
            } else {
              canEnablePrinter = true;
            }
          }, 2000);
        });
      }
    })
    .catch(err => {
      console.log('check catch block >>>', err);
      canEnablePrinter = true;
    });
};

/** @function : Get Image and convert into Base64 for print on bill */
function getBase64Image(img) {
  let imagePath = null;
  return new Promise(resolve => {
    RNFetchBlob.config({
      fileCache: true,
    })
      .fetch('GET', img)
      // the image is now dowloaded to device's storage
      .then(resp => {
        // the image path you can use it directly with Image component
        imagePath = resp.path();
        return resp.readFile('base64');
      })
      .then(base64Data => {
        // here's base64 encoded image
        // remove the file from storage
        resolve({url: imagePath, base64String: base64Data});
        // return fs.unlink(imagePath);
      });
  });
}

const base64Logo = '';

export const printReciept = async data => {
  console.log('check notifications length >>>> 8', data);
  return new Promise((resolve, reject) => {
    const detail = data;
    BluetoothManager.checkBluetoothEnabled().then(
      async enabled => {
        let total_amt = 0;
        await detail.vendors[0].products.forEach(async el => {
          total_amt = total_amt + el.quantity * el.price;
        });

        console.log('check start printing >>>> 4');
        const isConnected = await BluetoothManager.getConnectedDeviceAddress();
        console.log(
          'check start printing >>>> 5',
          isConnected,
          '>>>>>>>',
          enabled,
        );
        if (enabled && isConnected) {
          console.log('check start printing >>>> 6');
          try {
            await BluetoothEscposPrinter.printerInit();

            const base64Data = await getBase64Image(
              `${detail.admin_profile.logo.image_fit}200/200${detail.admin_profile.logo.image_path}`,
            );

            await BluetoothEscposPrinter.printPic(base64Data.base64String, {
              width: 200,
              left: 0,
            });
            await fs.unlink(base64Data.url);
            await BluetoothEscposPrinter.printText(
              `\r\n\ ${detail.order_number}\r\n\r\n`,
              {
                encoding: 'GBK',
                codepage: 0,
                widthtimes: 1.5,
                heigthtimes: 1.5,
                fonttype: 1,
              },
            );
            // await BluetoothEscposPrinter.printText(`${detail.vendors[0].vendor.name}\r\n\r\n\r\n`, {
            //   encoding: 'GBK',
            //   codepage: 0,
            //   widthtimes: 1.5,
            //   heigthtimes: 1.5,
            //   fonttype: 1
            // });
            await BluetoothEscposPrinter.printerAlign(
              BluetoothEscposPrinter.ALIGN.CENTER,
            );
            await BluetoothEscposPrinter.printText(
              `${strings.ORDER_DETAILS}\r\n\r\n`,
              {
                encoding: 'GBK',
                codepage: 0,
                widthtimes: 0.5,
                heigthtimes: 0.5,
                fonttype: 1,
              },
            );

            await BluetoothEscposPrinter.printerAlign(
              BluetoothEscposPrinter.ALIGN.LEFT,
            );

            if (detail.scheduled_date_time !== null) {
              await BluetoothEscposPrinter.printText(
                `${strings.CUSTOMER}: ${`${detail.user.name}`}\r\n${
                  strings.ORDER_PLACE_ON
                }: ${`${moment(detail.created, 'DD-MM-YYYY hh:mm').format(
                  'DD-MM-YYYY [at] hh:mm A',
                )}`}\r\n${strings.TOBE_PREPARED}: ${moment(
                  detail.scheduled_date_time,
                  'DD-MM-YYYY hh:mm',
                ).format(
                  'DD-MM-YYYY [at] hh:mm A',
                )}\r\n\r\n${detail.luxury_option.title.toUpperCase()}\r\n${
                  detail.address ? detail.address.address : ''
                }\r\n----------------------------------------------\r\n`,
                {},
              );
            } else {
              await BluetoothEscposPrinter.printText(
                `${strings.CUSTOMER}: ${`${detail.user.name}`}\r\n${
                  strings.ORDER_PLACE_ON
                }: ${`${moment(detail.created, 'DD-MM-YYYY hh:mm').format(
                  'DD-MM-YYYY [at] hh:mm A',
                )}`}\r\n\r\n${detail.luxury_option.title.toUpperCase()}\r\n${
                  detail.address ? detail.address.address : ''
                }\r\n----------------------------------------------\r\n`,
                {},
              );
            }

            await BluetoothEscposPrinter.setBlob(8);
            await BluetoothEscposPrinter.printerAlign(
              BluetoothEscposPrinter.ALIGN.CENTER,
            );
            /** Create Column **/
            let columnWidths = [30, 13];
            await BluetoothEscposPrinter.printColumn(
              columnWidths,
              [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.RIGHT,
              ],
              [`${strings.ITEM}`, strings.AMOUNT],
              {},
            );

            /** Add Items **/
            await detail.vendors[0].products.forEach(async el => {
              const title =
                el.pvariant.title && el.pvariant.title !== null
                  ? `${el.product_name}(${el.pvariant.title})`
                  : `${el.product_name}`;
              // const title = `${el.product_name}`
              BluetoothEscposPrinter.printColumn(
                columnWidths,
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                [
                  `${el.quantity} X ${title}`,
                  JSON.stringify(el.quantity * el.price),
                ],
                {},
              );

              /** Add ons If available **/
              if (el.addon.length > 0) {
                let arr = el.addon.map(el => el.option.title);
                arr = '(' + arr.join(',') + ')';
                BluetoothEscposPrinter.printColumn(
                  columnWidths,
                  [
                    BluetoothEscposPrinter.ALIGN.LEFT,
                    BluetoothEscposPrinter.ALIGN.RIGHT,
                  ],
                  [arr, ''],
                  {},
                );
              }
              await BluetoothEscposPrinter.printText('\r\n', {});
            });

            await BluetoothEscposPrinter.printText(
              '\r\n----------------------------------------------\r\n',
              {},
            );

            await BluetoothEscposPrinter.printColumn(
              [16, 11, 9, 10],
              [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.CENTER,
                BluetoothEscposPrinter.ALIGN.RIGHT,
              ],
              [
                `${strings.TOTAL}`,
                JSON.stringify(detail.item_count),
                ' ',
                JSON.stringify(total_amt) + '\r\n',
              ],
              {},
            );

            await BluetoothEscposPrinter.printColumn(
              [25, 20],
              [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.RIGHT,
              ],
              [
                `${strings.DELIVERY_FEE}`,
                `${detail.total_delivery_fee.toString()}` + '\r\n',
              ],
              {},
            );

            await BluetoothEscposPrinter.printColumn(
              [15, 30],
              [
                BluetoothEscposPrinter.ALIGN.LEFT,
                BluetoothEscposPrinter.ALIGN.RIGHT,
              ],
              [
                `${strings.DISCOUNT}`,
                `-${detail.total_discount.toString()}` + '\r\n',
              ],
              {},
            );

            if (!(detail.vendors.length > 1)) {
              await BluetoothEscposPrinter.printColumn(
                [15, 30],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                [
                  `${strings.LOYALTY}`,
                  `-${detail.loyalty_amount_saved.toString()}` + '\r\n',
                ],
                {},
              );

              await BluetoothEscposPrinter.printColumn(
                [15, 30],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                [`${strings.TAXES_FEES}`, detail.taxable_amount + '\r\n'],
                {},
              );

              await BluetoothEscposPrinter.printColumn(
                [15, 30],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                [`${strings.PAID_AMOUNT}`, detail.payable_amount + '\r\n'],
                {},
              );
            }

            await BluetoothEscposPrinter.printText(
              `----------------------------------------------\r\n\n${strings.WELCOME_NEXT_TIME}\r\n\r\n\r\n\r\n\n`,
              {},
            );

            await BluetoothEscposPrinter.cutOnePoint();

            console.log('check start printing >>>> 9');
            setTimeout(() => {
              resolve(true);
            }, 1000);
          } catch (e) {
            alert(e.message || 'ERROR');
            console.log('check start printing >>>> 12', e);
          }
        } else {
          canEnablePrinter = true;
          // alert(strings.SOMETHING_WENT_WRONG_PRINTER_MSG);
          AsyncStorage.getItem('BleDevice').then(res => {
            console.log(
              'checking ble device storage data >>>',
              JSON.parse(res),
            );
            if (res !== null) {
              BluetoothManager.disconnect(JSON.parse(res).boundAddress).then(
                async s => {
                  AsyncStorage.removeItem('BleDevice');
                  BackgroundService.stop();
                },
              );
            }
          });
        }
      },
      err => {
        console.log(err);
        console.log('check start printing >>>> 11', err);
      },
    );
  }).catch(err => console.log('check start printing >>>>>> 12', err));
};

export const printRecieptWithSunmi = async (data, _data) => {
  console.log(
    'check notifications length >>>> sunmi',
    _data?.instruction,
    data,
    _data,
  );
  return new Promise(async (resolve, reject) => {
    const detail = data;
    let total_amt = 0;
    await detail.vendors[0].products.forEach(async el => {
      total_amt = total_amt + el.quantity * el.price;
    });

    console.log('check start printing >>>> 6');
    try {
      const base64Data = await getBase64Image(
        `${detail.admin_profile.logo.image_fit}200/200${detail.admin_profile.logo.image_path}`,
      );
      //set aligment: 0-left,1-center,2-right
      SunmiPrinter.setAlignment(1);
      SunmiPrinter.printBitmap(base64Data.base64String, 200);
      // await SunmiPrinter.printPic(base64Data.base64String, {
      //   width: 200,
      //   left: 0,
      // });
      console.log('base64Database64Data', base64Data);
      // await fs.unlink(base64Data.url);.
      moment.locale('en');
      SunmiPrinter.setFontSize(22);
      SunmiPrinter.printOriginalText(
        `\r\n\n${_data?.restaurant_name}\n${`${moment
          .utc(_data.date_time, 'DD-MMM-YYYY HH:mm A')
          .tz(deviceTimezone)
          .format('DD-MMM, YYYY HH:mm A')}`}\n${detail.order_number}`,
      );

      SunmiPrinter.setFontSize(22);
      SunmiPrinter.setAlignment(1);

      // SunmiPrinter.printOriginalText(`\r\n───────────────────\r\n`);
      SunmiPrinter.printOriginalText(`\n───────────────────────────────\n`);

      SunmiPrinter.setFontSize(27);
      SunmiPrinter.setAlignment(1);
      SunmiPrinter.printOriginalText(`${strings.CUSTOMER}:\r\n`);

      SunmiPrinter.setFontSize(27);
      SunmiPrinter.setAlignment(1);
      SunmiPrinter.printOriginalText(
        `${detail.user.name}\n${detail.user.phone_number}\n`,
      );

      SunmiPrinter.setFontSize(22);
      SunmiPrinter.setAlignment(1);
      let itemText = detail.vendors[0].products.length > 1 ? 'items' : 'item';
      SunmiPrinter.printOriginalText(
        `\n${detail?.payment_option_title}\n${detail.vendors[0].products.length} ${itemText}\n`,
      );

      // await SunmiPrinter.setFontSize(20);
      // await SunmiPrinter.setAlignment(1);
      // await SunmiPrinter.printOriginalText(`\n${strings.ORDER_PLACE_ON}:\r\n${moment(detail.created, 'DD-MM-YYYY hh:mm').format(
      //   'YYYY-MM-DD hh:mm A',
      // )}\r\n`);
      // SunmiPrinter.printOriginalText(`───────────────────\n\n`);
      SunmiPrinter.printOriginalText(`\n───────────────────────────────\n`);
      // await SunmiPrinter.setFontSize(25);
      // await SunmiPrinter.setAlignment(1);
      // await SunmiPrinter.printOriginalText(
      //   `\r\n\r\n${strings.ORDER_DETAILS}\r\n`,
      // );

      // await SunmiPrinter.setAlignment(0);

      if (detail.scheduled_date_time !== null) {
        // await SunmiPrinter.printOriginalText(
        //   `${strings.CUSTOMER}: ${`${detail.user.name}`}\r\n${
        //     strings.ORDER_PLACE_ON
        //   }: ${`${moment(detail.created, 'DD-MM-YYYY hh:mm').format(
        //     'YYYY-MM-DD [at] hh:mm A',
        //   )}`}\r\n${strings.TOBE_PREPARED}: ${moment(
        //     detail.scheduled_date_time,
        //     'DD-MM-YYYY hh:mm',
        //   ).format(
        //     'YYYY-MM-DD [at] hh:mm A',
        //   )}\r\n\r\n${detail.luxury_option.title.toUpperCase()}\r\n${
        //     detail.address ? detail.address.address : ''
        //   }\r\n----------------------------------------------\r\n`,
        // );
        // await SunmiPrinter.printOriginalText(
        //   `${strings.CUSTOMER}: ${`${detail.user.name}`}\r\n${
        //     strings.ORDER_PLACE_ON
        //   }: ${`${moment(detail.created, 'DD-MM-YYYY hh:mm').format(
        //     'YYYY-MM-DD [at] hh:mm A',
        //   )}`}\r\n${strings.TOBE_PREPARED}: ${moment(
        //     detail.scheduled_date_time,
        //     'DD-MM-YYYY hh:mm',
        //   ).format(
        //     'YYYY-MM-DD [at] hh:mm A',
        //   )}\r\n\r\n${detail.luxury_option.title.toUpperCase()}\r\n${
        //     detail.address ? detail.address.address : ''
        //   }\r\n----------------------------------------------\r\n`,
        // );
      } else {
        // await SunmiPrinter.printOriginalText(
        //   `${strings.CUSTOMER}: ${`${detail.user.name}`}\r\n${
        //     strings.ORDER_PLACE_ON
        //   }: ${`${moment(detail.created, 'DD-MM-YYYY hh:mm').format(
        //     'YYYY-MM-DD [at] hh:mm A',
        //   )}`}\r\n\r\n${detail.luxury_option.title.toUpperCase()}\r\n${
        //     detail.address ? detail.address.address : ''
        //   }\r\n----------------------------------------------\r\n`,
        // );
      }

      SunmiPrinter.setAlignment(1);
      SunmiPrinter.setFontSize(21);

      SunmiPrinter.setFontWeight(true);
      /** Create Column **/
      let columnAliment = [0, 1, 2];
      let columnWidth = [25, 1, 10];
      /** Add Items **/
      // Function to format and print text in columns
      const printColumns = async data => {
        data.forEach(async row => {
          const paddedRow = row.map((item, index) =>
            padText(item, columnWidth[index]),
          );
          await SunmiPrinter.printColumnsText(
            paddedRow,
            columnWidth,
            columnAlignment,
          );
        });
      };
      var listArr = [];
      detail.vendors[0].products.forEach(async el => {
        // const title =
        //   el.pvariant.title && el.pvariant.title !== null
        //     ? `${el.product_name}(${el.pvariant.title})`
        //     : `${el.product_name}`;
        const title = `${el.product_name}`;

        listArr.push([
          'price',
          el.image_base64,
          `${_data.symbol}${JSON.stringify(el.quantity * el.price)}`,
        ]);
        listArr.push([
          `${el.quantity} X ${title}`,
          '',
          `${_data.symbol}${JSON.stringify(el.quantity * el.price)}`,
        ]);
        SunmiPrinter.printColumnsText(
          [
            `${el.quantity} X ${title}`,
            '',
            `${_data.symbol} ${JSON.stringify(el.quantity * el.price)}`,
          ],
          columnWidth,
          columnAliment,
        );
        // await SunmiPrinter.printColumnsText(
        //   ['', '', JSON.stringify(el.quantity * el.price)],
        //   columnWidth,
        //   columnAliment,
        // );

        SunmiPrinter.setFontSize(18);

        /** Add ons If available **/
        if (el.addon.length > 0) {
          el.addon.map(el => {
            console.log(el, 'el.addonel.addon1111');
            SunmiPrinter.printOriginalText(el.option.title);
            SunmiPrinter.printOriginalText('\n');
            // SunmiPrinter.printColumnsText(
            //   [el.option.title],
            //   columnWidth,
            //   columnAliment,
            // );
          });
          // arr = '(' + arr.join(',') + ')';
          // arr.map((item)=>{

          // })
          //  SunmiPrinter.printColumnsText(
          //   [arr, '', ''],
          //   columnWidth,
          //   columnAliment,
          // );
          // listArr.push([arr, '', '']);
        }
        SunmiPrinter.setFontSize(22);
        SunmiPrinter.setAlignment(1);
        SunmiPrinter.printOriginalText('\n');
      });
      SunmiPrinter.printOriginalText(`───────────────────────────────\n`);
      if (!!_data?.instruction && _data?.instruction != '') {
        SunmiPrinter.setFontSize(22);
        SunmiPrinter.setAlignment(1);
        // SunmiPrinter.printOriginalText(`───────────────────────────────\n`);
        SunmiPrinter.printOriginalText(`───────────────────────────────\n`);

        SunmiPrinter.setFontSize(22);
        SunmiPrinter.setAlignment(1);
        SunmiPrinter.printOriginalText(
          `${_data?.instruction}\n`,
        );
        SunmiPrinter.printOriginalText(`───────────────────────────────\n\n`);
      } else {
        SunmiPrinter.setFontSize(22);
        SunmiPrinter.setAlignment(1);

        // SunmiPrinter.printOriginalText(`\n───────────────────────────────\n`);

        // SunmiPrinter.printOriginalText(`\n───────────────────\n`);
      }

      // await SunmiPrinter.setFontSize(20);
      // for (var i in listArr) {
      //   console.log(listArr[i]);
      //   console.log(columnWidth);
      //   console.log(columnAliment);
      //   if (listArr[i][0] === 'price') {
      //     // await SunmiPrinter.setAlignment(0);
      //     // await SunmiPrinter.printBitmap(
      //     //   listArr[i][1],
      //     //   100 /*width*/,
      //     //   100 /*height*/,
      //     // );
      // await SunmiPrinter.setAlignment(1);
      // await SunmiPrinter.printOriginalText(listArr[i][2]);
      //   } else {
      //     await SunmiPrinter.printOriginalText('\r\n\r');
      //     await SunmiPrinter.printColumnsText(
      //       listArr[i],
      //       columnWidth,
      //       columnAliment,
      //     );
      //     await SunmiPrinter.printOriginalText('\r\n\r');
      //   }
      // }
      // await SunmiPrinter.setFontSize(25);
      // await SunmiPrinter.printOriginalText('\r\n----------------\r\n');
      SunmiPrinter.setAlignment(1);
      SunmiPrinter.setFontSize(21);
      SunmiPrinter.printColumnsText(
        [`${strings.TOTAL}`, '', `${_data.symbol}${JSON.stringify(total_amt)}`],
        columnWidth,
        columnAliment,
      );
      SunmiPrinter.printColumnsText(
        [
          `${strings.DELIVERY_FEE}`,
          '',
          `${_data?.symbol}${Number(detail?.total_delivery_fee).toFixed(2)}`,
        ],
        columnWidth,
        columnAliment,
      );

      SunmiPrinter.printColumnsText(
        [
          `${strings.DISCOUNT}`,
          '',
          `-${_data?.symbol}${Number(detail?.total_discount).toFixed(2)}`,
        ],
        columnWidth,
        columnAliment,
      );

      if (!(detail?.vendors?.length > 1)) {
        SunmiPrinter.printColumnsText(
          [
            `${strings.TAXES_FEES}`,
            '',
            `${_data?.symbol}${Number(detail?.taxable_amount).toFixed(2)}`,
          ],
          columnWidth,
          columnAliment,
        );
        SunmiPrinter.printColumnsText(
          [
            `${strings.PAID_AMOUNT}`,
            '',
            `${_data?.symbol}${Number(detail?.payable_amount).toFixed(2)}`,
          ],
          columnWidth,
          columnAliment,
        );
      }
      SunmiPrinter.setAlignment(1);
      SunmiPrinter.setFontSize(22);
      // SunmiPrinter.printOriginalText(`\n───────────────────\n`);
      SunmiPrinter.printOriginalText(`\───────────────────────────────\n`);
      SunmiPrinter.printOriginalText('\n\n');
      // console.log('check start printing >>>> 9');
      setTimeout(() => {
        resolve(true);
      }, 1000);
    } catch (e) {
      alert(e.message || 'ERROR');
      console.log('check start printing >>>> 12', e);
    }
  }).catch(err => console.log('check start printing >>>>>> 12', err));
};
