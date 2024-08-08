const facilityGuaranteeAmend = (amendment) => {
  try {
    const { amount, facilityGuaranteeDates } = amendment;
    const record = {};

    if (!amount && !facilityGuaranteeDates) {
      throw new Error('Either amount or facilityGuaranteeDates.guaranteeExpiryDate is required.');
    }

    if (amount) {
      record.guaranteedLimit = amount;
    }

    if (facilityGuaranteeDates) {
      record.expirationDate = facilityGuaranteeDates.guaranteeExpiryDate;
    }

    // Return amended FGR
    return record;
  } catch (error) {
    console.error('Unable to map facility guarantee amendment. %o', error);
    return {};
  }
};

module.exports = facilityGuaranteeAmend;
