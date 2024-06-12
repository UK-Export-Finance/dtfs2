const { FILE_UPLOAD } = require('./file-upload');

exports.FILE_NAME_REGEX = new RegExp(`.+\\.(${FILE_UPLOAD.ALLOWED_FORMATS.join('|')})$`);

exports.CELL_ADDRESS_REGEX = /^([A-Z]+)(\d+)$/;

// Due to excel truncating leading 0s the facility ID can be between 8 and 10 characters
exports.UKEF_FACILITY_ID_REGEX = /^\d{8,10}$/;

exports.CURRENCY_NUMBER_REGEX = /^\d+(\.\d{1,2})?$/;

exports.EXCHANGE_RATE_REGEX = /^\d+(\.\d+)?$/;
