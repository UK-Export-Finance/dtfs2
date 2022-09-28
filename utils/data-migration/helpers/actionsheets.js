/**
 * Action Sheets (XLXS) helper functions
 */
const excel = require('xlsx');
const CONSTANTS = require('../constant');
const {
  getEpoch,
  getStringTimestamp,
  excelDateToISODateString
} = require('./date');

const actionSheet = 'Action Sheet';

/**
 * Returns data from the action sheet in `JSON` format for interested sheet.
 * @param {String} URI Action sheet location. Relative path or absolute path using file:\\ protocol.
 * @param {String} Sheet Interested sheet to parse data from, `Action Sheet` set as a default sheet.
 * @returns {Promise} Action sheet data as a `Resolve` otherwise `Reject` with error.
 */
const open = (uri, sheet = actionSheet) => {
  try {
    const actionsheet = excel.readFile(uri);
    const data = excel.utils.sheet_to_json(actionsheet.Sheets[sheet]);
    return Promise.resolve(data);
  } catch (e) {
    return Promise.reject(new Error(`🚩 Unable to parse the action sheet ${uri} ${e}`));
  }
};

/**
 * Format's raw value parsed from the action sheet to TFM compliant value
 * @param {String} lookup Lookup text
 * @param {String} value Parsed value from the action sheet
 * @returns {String} TFM compliant value
 */
const format = (lookup, value) => {
  if (lookup && value) {
    if (lookup === 'Credit Rating Code') {
      return CONSTANTS.DEAL.CREDIT_RATING[value] ?? value;
    }
    if (lookup === 'Loss Given Default') {
      /**
       * Convert Loss Given Default from `0.5` to `50`
       * due Macro disabled during data fetch from action sheets.
       * */
      return typeof value === 'number' ? value * 100 : value;
    }

    if (lookup === 'Banks Fees') {
      /**
       * ConvertBanks Fees from `0.5` to `50`
       * due Macro disabled during data fetch from action sheets.
       * */
      return typeof value === 'number' ? value * 100 : value;
    }

    if (lookup === 'Guarantee Expiry') {
      /**
       * ConvertBanks Guarantee Expiry from `excel timestamp` to `timestamp`
       * due Macro disabled during data fetch from action sheets.
       * */
      return typeof value === 'number' ? getStringTimestamp(excelDateToISODateString(value)) : value;
    }

    if (lookup === 'Anticipated Issue') {
      /**
       * ConvertBanks Guarantee Issue from `excel timestamp` to `timestamp`
       * due Macro disabled during data fetch from action sheets.
       * */
      return typeof value === 'number' ? getEpoch(excelDateToISODateString(value)) : value;
    }
  }

  return value;
};

/**
 * Returns data from interested cell parsed from the action sheet.
 * @param {Object} data JSON data object parsed from the action sheet
 * @param {Array} search Search list array
 * @returns {String} Matched data otherwise `null`
 */
const get = (data, search) => {
  if (data.length > 0 && search.length > 0) {
    const lookup = search[1];
    const cell = search[2];

    const match = data.find((row) => Object.values(row).includes(lookup));
    if (match) {
      const cells = Object.values(match);
      const value = cells[cell];

      return format(lookup, value);
    }
  }
  return null;
};

module.exports = {
  open,
  get,
};
