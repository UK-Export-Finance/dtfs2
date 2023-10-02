const { FILE_UPLOAD } = require('./file-upload');

exports.COMPANIES_HOUSE_NUMBER_REGEX = /^(([A-Z]{2}|[A-Z]\d{1}|\d{2})(\d{5,6}|\d{4,5}[A-Z]))$/;

exports.FILE_NAME_REGEX = new RegExp(`.+\\.(${FILE_UPLOAD.ALLOWED_FORMATS.join('|')})$`);

exports.CELL_ADDRESS_REGEX = /^([A-Z]+)(\d+)$/;

exports.UKEF_FACILITY_ID_REGEX = /^\d{8,10}$/;

exports.CURRENCY_NUMBER_REGEX = /^\d+(\.\d{1,2})?$/;

exports.EXCHANGE_RATE_REGEX = /^\d+(\.\d+)?$/;
