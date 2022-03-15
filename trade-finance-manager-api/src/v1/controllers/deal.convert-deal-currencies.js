const api = require('../api');

const convertDealCurrencies = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    _id: dealId,
    dealCurrency,
    dealValue,
    tfm,
  } = deal;

  if (dealCurrency && dealCurrency.id !== 'GBP') {
    const currencyExchange = await api.getCurrencyExchangeRate(dealCurrency.id, 'GBP');

    let dealUpdate = {};

    if (currencyExchange.err) {
      dealUpdate = {
        tfm: {
          ...tfm,
          supplyContractValueInGBP: 'ERR_CURRENCY_EXCHANGE',
        },
      };
    } else {
      const {
        midPrice: exchangeRate,
      } = currencyExchange;

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

    const updatedDeal = await api.updateDeal(dealId, dealUpdate);

    return {
      ...deal,
      tfm: updatedDeal.tfm,
    };
  }

  return deal;
};

module.exports.convertDealCurrencies = convertDealCurrencies;
