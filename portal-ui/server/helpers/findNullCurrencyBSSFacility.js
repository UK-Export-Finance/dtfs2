/**
 * Returns BSS facilities with null currency where the currencySameAsSupplyContractCurrency is true
 * @param {object[]} facilities - array of all facilities (bonds or loans)
 * @returns {object[]} array of facilities with null currency where the currencySameAsSupplyContractCurrency is true
 */
export const findNullCurrencyBSSFacility = (facilities) =>
  facilities.filter(({ currencySameAsSupplyContractCurrency, currency }) => currencySameAsSupplyContractCurrency === 'true' && currency === null);
