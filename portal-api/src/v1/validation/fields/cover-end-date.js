const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const {
  dateHasAllValues,
  dateValidationText,
} = require('./date');

const { SUBMISSION_TYPE } = require('../../../constants/deal');
const { DEAL_STATUS } = require('../../../constants/facilities');

const isValidForValidation = (deal, submittedValues) => {
  const { submissionType } = deal;
  const { status } = submittedValues;

  if ((submissionType === SUBMISSION_TYPE.AIN || submissionType === SUBMISSION_TYPE.MIN) && status === DEAL_STATUS.ACKNOWLEDGED) {
    return false;
  }
  return true;
};

module.exports = (submittedValues, deal, errorList) => {
  const newErrorList = errorList;
  const {
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
  } = submittedValues;

  if (isValidForValidation(deal, submittedValues)) {
    if (dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
      const formattedDate = `${coverEndDateYear}-${coverEndDateMonth}-${coverEndDateDay}`;
      const nowDate = moment().format('YYYY-MM-DD');

      if (moment(formattedDate).isBefore(nowDate)) {
        newErrorList.coverEndDate = {
          text: 'Cover End Date must be today or in the future',
          order: orderNumber(newErrorList),
        };
      }
    } else if (!dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
      newErrorList.coverEndDate = {
        text: dateValidationText(
          'Cover End Date',
          coverEndDateDay,
          coverEndDateMonth,
          coverEndDateYear,
        ),
        order: orderNumber(newErrorList),
      };
    }
  }

  return newErrorList;
};
