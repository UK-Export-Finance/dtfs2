const { to2Decimals } = require('../../helpers/currency');

const facilityCovenantAmend = (amendment) => {
  try {
    const { amount, facilityGuaranteeDates } = amendment;
    const record = {};

    if (!amount && !facilityGuaranteeDates?.guaranteeExpiryDate) {
      throw new Error('Invalid argument set provided');
    }

    if (amount) {
      record.targetAmount = to2Decimals(amount);
    }

    if (facilityGuaranteeDates?.guaranteeExpiryDate) {
      record.expirationDate = facilityGuaranteeDates.guaranteeExpiryDate;
    }

    // Return amended FCR
    return record;
  } catch (error) {
    console.error('Unable to map facility covenant record %o', error);
    return {};
  }
};

module.exports = facilityCovenantAmend;
