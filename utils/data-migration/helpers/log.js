const fs = require('fs');
const moment = require('moment');

const logData = {
  success: [],
  errors: {},
};

const logFolder = './logs';
let filename;

const init = (prefix) => {
  filename = `${logFolder}/${prefix}-log_${moment().format('YYYY-MM-DD_HH-mm-ss')}`;
  if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder);
  }
  return filename;
};

const saveToFile = () => {
  fs.writeFileSync(filename, JSON.stringify(logData, null, 4));
};

const addError = (v1Id, msg) => {
  if (!logData.errors[v1Id]) {
    logData.errors[v1Id] = [];
  }
  logData.errors[v1Id].push(msg);
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
  get,
  saveToFile,
  getSuccessCount,
};
