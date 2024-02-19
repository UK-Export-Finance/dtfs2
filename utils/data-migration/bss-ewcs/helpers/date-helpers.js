const moment = require('moment');

// TODO: DTFS2-7000 - remove moment from this function
const convertV1Date = (v1DateString) => (v1DateString && moment(v1DateString).utc().valueOf().toString());

module.exports = {
  convertV1Date,
};
