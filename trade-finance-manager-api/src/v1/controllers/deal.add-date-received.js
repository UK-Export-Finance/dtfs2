const moment = require('moment');
const api = require('../api');

const generateDateFromSubmissionDate = (submissionDate) => {
  const utc = moment(parseInt(submissionDate, 10));
  const localisedTimestamp = utc.tz('Europe/London');

  return localisedTimestamp.format('DD-MM-YYYY');
};

const addDealDateReceived = async (deal) => {
  if (!deal) {
    return false;
  }

  const { dealSnapshot, tfm } = deal;

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    details,
  } = dealSnapshot;

  const { submissionDate } = details;

  const dateReceived = generateDateFromSubmissionDate(submissionDate);

  const dealUpdate = {
    tfm: {
      ...tfm,
      dateReceived,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return updatedDeal;
};

module.exports = {
  generateDateFromSubmissionDate,
  addDealDateReceived,
};
