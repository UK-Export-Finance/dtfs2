const api = require('../api');
const dateHelpers = require('../../utils/date');

const convertDealCurrencies = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    _id: dealId,
    dealCurrency,
    dealValue,
    submissionDate,
    tfm,
  } = deal;

  if (dealCurrency && dealCurrency.id !== 'GBP') {
    const historicDate = dateHelpers.formatDate(Number(submissionDate));
    const currencyExchange = await api.getCurrencyExchangeRate(dealCurrency.id, 'GBP', historicDate);

    if (currencyExchange) {
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
          historicExchangeRate,
        } = currencyExchange;

        const strippedDealValue = Number(dealValue.replace(/,/g, ''));

        // TODO: DTFS2-4704 - rename supplyContractValueInGBP to dealValueInGBP
        const supplyContractValueInGBP = strippedDealValue * exchangeRate;

        dealUpdate = {
          tfm: {
            ...tfm,
            supplyContractValueInGBP,
            dataMigration: {
              modifiedExchangeRate: exchangeRate,
              exchangeRate: historicExchangeRate,
            },
          },
        };
      }

      const updatedDeal = await api.updateDeal(dealId, dealUpdate);

      return {
        ...deal,
        tfm: updatedDeal.tfm,
      };
    }
  }

  return deal;
};

module.exports.convertDealCurrencies = convertDealCurrencies;
