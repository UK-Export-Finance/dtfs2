/**
 * Action Sheets (XLXS) helper functions
 */

const excel = require('xlsx');

const sheet = 'Action Sheet';

const open = (file) => {
  try {
    const actionsheet = excel.readFile(file);
    const data = excel.utils.sheet_to_json(actionsheet.Sheets[sheet]);
    return Promise.resolve(data);
  } catch (e) {
    return Promise.reject(new Error(`🚩 Unable to parse the action sheet ${file} ${e}`));
  }
};

const cell = (row, column) => {

};

module.exports = {
  open,
  cell,
};
