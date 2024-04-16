"use strict";
const tslib_1 = require("tslib");
const { findOneCurrency } = require('../controllers/currencies.controller');
const getCurrencyObject = (currencyCode) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield findOneCurrency(currencyCode);
    const { text, id, currencyId } = data;
    return {
        text,
        id,
        currencyId,
    };
});
const handleTransactionCurrencyFields = (dealSection, deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const modifiedSection = dealSection;
    let supplyContractCurrencyCodeId;
    if (deal.submissionDetails.supplyContractCurrency) {
        supplyContractCurrencyCodeId = deal.submissionDetails.supplyContractCurrency.id;
    }
    const { currencySameAsSupplyContractCurrency, currency: currencyCode, } = modifiedSection;
    if (currencySameAsSupplyContractCurrency && currencySameAsSupplyContractCurrency === 'true') {
        // remove any 'currency is NOT the same' specific values
        modifiedSection.currency = null;
        modifiedSection.conversionRate = null;
        modifiedSection['conversionRateDate-day'] = null;
        modifiedSection['conversionRateDate-month'] = null;
        modifiedSection['conversionRateDate-year'] = null;
        if (supplyContractCurrencyCodeId) {
            modifiedSection.currency = yield getCurrencyObject(supplyContractCurrencyCodeId);
        }
    }
    else if (currencyCode) {
        // currencyCode can be a single string (from form),
        // or an object with ID, if has been previously submitted.
        const actualCurrencyCode = currencyCode.id ? currencyCode.id : currencyCode;
        modifiedSection.currency = yield getCurrencyObject(actualCurrencyCode);
    }
    return modifiedSection;
});
module.exports = {
    getCurrencyObject,
    handleTransactionCurrencyFields,
};
