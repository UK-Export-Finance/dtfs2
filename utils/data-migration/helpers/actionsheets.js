/**
 * Action Sheets (XLXS) helper functions
 */

const excel = require('xlsx');

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
    const cells = Object.values(match);
    return cells[cell];
  }
  return null;
};

module.exports = {
  open,
  get,
};
