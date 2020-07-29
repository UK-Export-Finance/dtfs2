const moment = require('moment');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { updateLoanInDeal } = require('./loans.controller');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');
const { hasValue } = require('../../utils/string');

// TODO: extract to common/generic directory
const formattedTimestamp = (timestamp, userTimezone) => {
  const targetTimezone = userTimezone;
  const utc = moment(parseInt(timestamp, 10));
  const localisedTimestamp = utc.tz(targetTimezone);
  const formatted = localisedTimestamp.format();
  return formatted;
};

// TODO: extract to common/generic directory
const createTimestamp = (submittedValues, fieldName) => {
  const day = submittedValues[`${fieldName}-day`];
  const month = submittedValues[`${fieldName}-month`];
  const year = submittedValues[`${fieldName}-year`];

  const momentDate = moment().set({
    date: Number(day),
    month: Number(month) - 1, // months are zero indexed
    year: Number(year),
  });

  return moment(momentDate).utc().valueOf().toString();
};

// TODO: extract to common facility directory
const getRequestedCoverStartDateValues = (loan) => {
  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = loan;

  return {
    requestedCoverStartDateDay,
    requestedCoverStartDateMonth,
    requestedCoverStartDateYear,
  };
};

// TODO: extract to common facility directory
const hasAllRequestedCoverStartDateValues = (loan) => {
  const {
    requestedCoverStartDateDay,
    requestedCoverStartDateMonth,
    requestedCoverStartDateYear,
  } = getRequestedCoverStartDateValues(loan);

  const hasRequestedCoverStartDate = (hasValue(requestedCoverStartDateDay)
                                      && hasValue(requestedCoverStartDateMonth)
                                      && hasValue(requestedCoverStartDateYear));

  if (hasRequestedCoverStartDate) {
    return true;
  }

  return false;
};

// TODO: extract to common facility directory
const updateRequestedCoverStartDate = (loan) => {
  // if we have all requestedCoverStartDate fields (day, month and year)
  // delete these and use UTC timestamp in a single requestedCoverStartDate property.
  const modifiedLoan = loan;

  if (hasAllRequestedCoverStartDateValues(loan)) {
    const {
      requestedCoverStartDateDay,
      requestedCoverStartDateMonth,
      requestedCoverStartDateYear,
    } = getRequestedCoverStartDateValues(loan);

    const momentDate = moment().set({
      date: Number(requestedCoverStartDateDay),
      month: Number(requestedCoverStartDateMonth) - 1, // months are zero indexed
      year: Number(requestedCoverStartDateYear),
    });
    modifiedLoan.requestedCoverStartDate = moment(momentDate).utc().valueOf().toString();

    delete modifiedLoan['requestedCoverStartDate-day'];
    delete modifiedLoan['requestedCoverStartDate-month'];
    delete modifiedLoan['requestedCoverStartDate-year'];
  }
  return modifiedLoan;
};

exports.updateLoanIssueFacility = async (req, res) => {
  const {
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const loan = deal.loanTransactions.items.find((l) =>
        String(l._id) === loanId); // eslint-disable-line no-underscore-dangle

      if (!loan) {
        return res.status(404).send();
      }

      let modifiedLoan = {
        _id: loanId,
        ...loan,
        ...req.body,
      };

      modifiedLoan.issuedDate = createTimestamp(req.body, 'issuedDate');

      let formattedRequestedCoverStartDate;
      if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
        modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
        // formatted moment date for date comparison validation
        formattedRequestedCoverStartDate = formattedTimestamp(modifiedLoan.requestedCoverStartDate, req.user.timezone);
      }

      const validationErrors = loanIssueFacilityValidationErrors(
        modifiedLoan,
        // formatted moment dates for date comparison validation
        formattedTimestamp(deal.details.submissionDate, req.user.timezone),
        formattedTimestamp(modifiedLoan.issuedDate, req.user.timezone),
        formattedRequestedCoverStartDate,
      );

      if (validationErrors.count === 0) {
        modifiedLoan.facilityIssued = true;
      }

      const updatedLoan = await updateLoanInDeal(req.params, req.user, deal, modifiedLoan);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          validationErrors,
          loan: updatedLoan,
        });
      }

      return res.status(200).send(updatedLoan);
    }
    return res.status(404).send();
  });
};
