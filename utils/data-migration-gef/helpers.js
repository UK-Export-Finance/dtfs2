const { getUnixTime } = require('date-fns');

const convertDateToTimestamp = (v1Date) =>
  getUnixTime(new Date(v1Date));

module.exports = {
  convertDateToTimestamp,
};
