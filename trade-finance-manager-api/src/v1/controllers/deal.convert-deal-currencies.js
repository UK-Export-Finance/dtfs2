const api = require('../api');

const convertDealCurrencies = async (deal, auditDetails) => {
  if (!deal) {
    return false;
  }

  const { _id: dealId, dealCurrency, dealValue, tfm } = deal;

  if (dealCurrency && dealCurrency.id !== 'GBP') {
    const currencyExchange = await api.getCurrencyExchangeRate(dealCurrency.id, 'GBP');

    let dealUpdate = {};

    if (currencyExchange.error) {
      dealUpdate = {
        tfm: {
          ...tfm,
          supplyContractValueInGBP: 'ERR_CURRENCY_EXCHANGE',
        },
      };
    } else {
      const { exchangeRate } = currencyExchange;

      const strippedDealValue = Number(dealValue.replace(/,/g, ''));

      // TODO: DTFS2-4704 - rename supplyContractValueInGBP to dealValueInGBP
      const supplyContractValueInGBP = strippedDealValue * exchangeRate;

      dealUpdate = {
        tfm: {
          ...tfm,
          supplyContractValueInGBP,
        },
      };
    }

    const updatedDeal = await api.updateDeal({ dealId, dealUpdate, auditDetails });

    return {
      ...deal,
      tfm: updatedDeal.tfm,
    };
  }

  return deal;
};

module.exports.convertDealCurrencies = convertDealCurrencies;
