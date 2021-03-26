const api = require('../api');

const convertDealCurrencies = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    tfm,
    dealSnapshot,
  } = deal;

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    submissionDetails,
  } = dealSnapshot;

  const {
    supplyContractCurrency: contractCurrency,
    supplyContractValue: contractValue,
  } = submissionDetails;

  if (contractCurrency && contractCurrency.id !== 'GBP') {
    const currencyExchange = await api.getCurrencyExchangeRate(contractCurrency.id, 'GBP');

    const {
      midPrice: exchangeRate,
    } = currencyExchange;

    const strippedContractValue = Number(contractValue.replace(/,/g, ''));

    const supplyContractValueInGBP = strippedContractValue * exchangeRate;

    const dealUpdate = {
      tfm: {
        ...tfm,
        supplyContractValueInGBP,
      },
    };


    const updatedDeal = await api.updateDeal(dealId, dealUpdate);

    return updatedDeal;
  }

  return deal;
};

module.exports.convertDealCurrencies = convertDealCurrencies;
