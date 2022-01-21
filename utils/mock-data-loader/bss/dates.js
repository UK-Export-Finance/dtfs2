const {
  add,
  format,
  getTime,
} = require('date-fns');

const nowTimestamp = Date.now();

const twoMonthsFromNow = add(new Date(), {
  months: 2,
});

const threeMonthsFromNow = add(new Date(), {
  months: 3,
});

const twoMonths = {
  day: format(twoMonthsFromNow, 'dd'),
  month: format(twoMonthsFromNow, 'MM'),
  year: format(twoMonthsFromNow, 'yyyy'),
};

const threeMonths = {
  day: format(threeMonthsFromNow, 'dd'),
  month: format(threeMonthsFromNow, 'MM'),
  year: format(threeMonthsFromNow, 'yyyy'),
};

const twoMonthsTimestamp = getTime(twoMonthsFromNow);

module.exports = {
  nowTimestamp,
  twoMonths,
  twoMonthsTimestamp,
  threeMonths,
};
