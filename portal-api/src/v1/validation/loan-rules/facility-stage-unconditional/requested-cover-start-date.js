const moment = require('moment');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const {
  dateHasSomeValues,
  dateIsInTimeframe,
  dateValidationText,
} = require('../../fields/date');
const { formattedTimestamp } = require('../../../facility-dates/timestamp');

module.exports = (submittedValues, deal, errorList) => {
  const newErrorList = errorList;

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = submittedValues;

  const requestedCoverStartDateTimestamp = formattedTimestamp(submittedValues.requestedCoverStartDate);

  // EC 15 is: 'Cover Start Date is no more than three months from the date of submission'
  const eligibilityCriteria15 = deal.eligibility.criteria.find((c) => c.id === 15);
  const canEnterDateGreaterThan3Months = eligibilityCriteria15 && eligibilityCriteria15.answer === false;

  const dealHasBeenSubmitted = deal.details.submissionDate;

  if (requestedCoverStartDateTimestamp) {
    const nowDate = moment().startOf('day');

    if (!dealHasBeenSubmitted) {
      if (moment(requestedCoverStartDateTimestamp).isBefore(nowDate)) {
        newErrorList.requestedCoverStartDate = {
          text: 'Requested Cover Start Date must be on the application submission date or in the future',
          order: orderNumber(newErrorList),
        };
      } else if (!canEnterDateGreaterThan3Months) {
        const MAX_MONTHS_FROM_NOW = 3;

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
      }
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
