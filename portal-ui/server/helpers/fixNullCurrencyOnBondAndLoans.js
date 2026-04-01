import { findNullCurrencyBSSFacility } from './findNullCurrencyBSSFacility';
import api from '../api';
import postToApi from './postToApi';

/**
 * Fixes null currency on BSS bonds and loans by updating them with the supply contract currency
 * Used to fix an issue where some facilities have currency as null as facility was created before supply contract currency was completed
 * finds all bonds and loans with null currency where currencySameAsSupplyContractCurrency is true
 * updates those facilities with the supply contract currency
 * sends update request to the API for each facility that needs to be updated
 * @param {object[]} bonds - array of bond facilities
 * @param {object[]} loans - array of loan facilities
 * @param {object} supplyContractCurrency - the supply contract currency
 * @param {string} dealId - the deal ID
 * @param {string} userToken - the user token
 */
export const fixNullCurrencyOnBondAndLoans = async (bonds, loans, supplyContractCurrency, dealId, userToken) => {
  if (loans?.length) {
    const nullCurrencyLoans = findNullCurrencyBSSFacility(loans);

    if (nullCurrencyLoans?.length) {
      for (const loan of nullCurrencyLoans) {
        const facilityId = loan._id || loan.facilityId;
        const update = { currency: supplyContractCurrency };
        await postToApi(api.updateLoan(dealId, facilityId, update, userToken));
      }
    }
  }

  if (bonds?.length) {
    const nullCurrencyBonds = findNullCurrencyBSSFacility(bonds);

    if (nullCurrencyBonds?.length) {
      for (const bond of nullCurrencyBonds) {
        const facilityId = bond._id || bond.facilityId;
        const update = { currency: supplyContractCurrency };
        await postToApi(api.updateBond(dealId, facilityId, update, userToken));
      }
    }
  }
};
