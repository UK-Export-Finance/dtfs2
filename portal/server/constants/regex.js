const { FILE_UPLOAD } = require('./file-upload');

exports.COMPANIES_HOUSE_NUMBER_REGEX = /^(([A-Z]{2}|[A-Z]\d{1}|\d{2})(\d{5,6}|\d{4,5}[A-Z]))$/;

exports.FILE_NAME_REGEX = new RegExp(`.+\\.(${FILE_UPLOAD.ALLOWED_FORMATS.join('|')})$`);

// This is flagged as a dangerous regex but is only used on excel cell addresses and not from user input and so is not vulnerable to a DoS attack
exports.CELL_ADDRESS = /([A-Z]+)(\d+)/;

exports.UKEF_FACILITY_ID_REGEX = /^\d{8,10}$/;

exports.CURRENCY_NUMBER_REGEX = /^\d+(\.\d{1,2})?$/;

exports.EXCHANGE_RATE_REGEX = /^\d+(\.\d+)?$/;
