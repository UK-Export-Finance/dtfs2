const moment = require('moment');

const convertV1Date = (v1DateString) => (v1DateString && moment(v1DateString).utc().valueOf().toString());

module.exports = {
  convertV1Date,
};
