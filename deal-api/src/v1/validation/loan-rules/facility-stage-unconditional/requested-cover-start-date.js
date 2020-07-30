const moment = require('moment');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const {
  dateHasAllValues,
  dateHasSomeValues,
  dateIsInTimeframe,
  dateValidationText,
} = require('../../fields/date');
const { formattedTimestamp } = require('../../../section-dates/requested-cover-start-date');

module.exports = (submittedValues, errorList) => {
  const newErrorList = errorList;

  const requestedCoverStartDateTimestamp = formattedTimestamp(submittedValues.requestedCoverStartDate);

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = submittedValues;

  if (requestedCoverStartDateTimestamp) {
    const MAX_MONTHS_FROM_NOW = 3;
    const nowDate = moment().startOf('day');

    const day = moment(requestedCoverStartDateTimestamp).format('DD');
    const month = moment(requestedCoverStartDateTimestamp).format('MM');
    const year = moment(requestedCoverStartDateTimestamp).format('YYYY');

    if (!dateIsInTimeframe(
      day,
      month,
      year,
      nowDate,
      moment(nowDate).add(MAX_MONTHS_FROM_NOW, 'months'),
    )) {
      newErrorList.requestedCoverStartDate = {
        text: `Requested Cover Start Date must be between ${moment().format('Do MMMM YYYY')} and ${moment(nowDate).add(MAX_MONTHS_FROM_NOW, 'months').format('Do MMMM YYYY')}`,
        order: orderNumber(newErrorList),
      };
    }

    if (moment(requestedCoverStartDateTimestamp).isBefore(nowDate)) {
      newErrorList.requestedCoverStartDate = {
        text: 'Requested Cover Start Date must be today or in the future',
        order: orderNumber(newErrorList),
      };
    }
  } else if (!requestedCoverStartDateTimestamp && dateHasSomeValues(
    requestedCoverStartDateDay,
    requestedCoverStartDateMonth,
    requestedCoverStartDateYear,
  )) {
    newErrorList.requestedCoverStartDate = {
      text: dateValidationText(
        'Requested Cover Start Date',
        requestedCoverStartDateDay,
        requestedCoverStartDateMonth,
        requestedCoverStartDateYear,
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
