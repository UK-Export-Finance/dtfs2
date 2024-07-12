/*
  "guaranteeExpiryDate"       Facility cover end date, maps to expirationDate
  "amount"                    Maximum liability when making an amendment, maps to targetAmount
  */

const { to2Decimals } = require('../../helpers/currency');

const facilityCovenantAmend = (amendment) => {
  try {
    const { facilityGuaranteeDates: { guaranteeExpiryDate } = {}, amount } = amendment; // (guaranteeExpiryDate is actually facility.tfm.facilityGuaranteeDates.guaranteeExpiryDate, but assume this is different for amendments)
    return {
      targetAmount: amount ? to2Decimals(amount) : undefined,
      expirationDate: guaranteeExpiryDate,
    };
  } catch (error) {
    console.error('Unable to map facility covenant amendment. %o', error);
    return {};
  }
};

module.exports = facilityCovenantAmend;
