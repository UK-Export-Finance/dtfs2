const fs = require('fs');
const { format } = require('date-fns');

const logData = {
  success: [],
  errors: {},
  warnings: {},
};

const logFolder = './logs';
let filename;

const init = (prefix) => {
  filename = `${logFolder}/${prefix}-log_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`;
  if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder);
  }
  return filename;
};

const saveToFile = () => {
  const orderErrorKeys = Object.keys(logData.errors).sort();
  const orderWarningsKeys = Object.keys(logData.warnings).sort();

  const orderedErrors = {};
  const orderedWarnings = {};

  orderErrorKeys.forEach((key) => {
    orderedErrors[key] = logData.errors[key];
  });

  orderWarningsKeys.forEach((key) => {
    orderedWarnings[key] = logData.warnings[key];
  });

  const orderedData = {
    errors: orderedErrors,
    warnings: orderedWarnings,
    success: logData.success.sort(),
  };

  fs.writeFileSync(filename, JSON.stringify(orderedData, null, 4));
};

const addError = (v1Id, msg) => {
  if (!logData.errors[v1Id]) {
    logData.errors[v1Id] = [];
  }
  logData.errors[v1Id].push(msg);
  console.error(msg);
  saveToFile();
};

const addWarning = (v1Id, msg) => {
  if (!logData.warnings[v1Id]) {
    logData.warnings[v1Id] = [];
  }
  logData.warnings[v1Id].push(msg);
  saveToFile();
};

const addSuccess = (v1Id) => {
  logData.success.push(v1Id);
  saveToFile();
};

const getSuccessCount = () => Object.keys(logData.success).length;

const get = () => logData;

module.exports = {
  init,
  addError,
  addSuccess,
  addWarning,
  get,
  saveToFile,
  getSuccessCount,
};
