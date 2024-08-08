import { to2Decimals } from '../../helpers/currency';

export const facilityCovenantAmend = (amendment) => {
  try {
    const { amount, facilityGuaranteeDates } = amendment;
    const record = {};

    if (!amount && !facilityGuaranteeDates) {
      throw new Error('Either amount or facilityGuaranteeDates.guaranteeExpiryDate is required.');
    }

    if (amount) {
      record.targetAmount = to2Decimals(amount);
    }

    if (facilityGuaranteeDates) {
      record.expirationDate = facilityGuaranteeDates.guaranteeExpiryDate;
    }

    // Return amended FCR
    return record;
  } catch (error) {
    console.error('Unable to map facility covenant record %o', error);
    return {};
  }
};
