import { to2Decimals } from '../../helpers/currency';

export const facilityCovenantAmend = (amendment) => {
  try {
    const { amount, facilityGuaranteeDates } = amendment;

    const mappedResponse = {};
    if (!amount && !facilityGuaranteeDates) {
      throw new Error('Either amount or facilityGuaranteeDates.guaranteeExpiryDate is required.');
    }

    if (amount) {
      mappedResponse.targetAmount = to2Decimals(amount);
    }

    if (facilityGuaranteeDates) {
      mappedResponse.expirationDate = facilityGuaranteeDates.guaranteeExpiryDate;
    }

    return mappedResponse;
  } catch (error) {
    console.error('Unable to map facility covenant record. %o', error);
    return {};
  }
};
