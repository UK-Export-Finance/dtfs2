const api = require('../api');

const addFacilityCurrencyConversion = async (deal) => {
  const modifiedDeal = deal;
  let facilities = [];

  facilities = [
    ...modifiedDeal.dealSnapshot.bondTransactions.items,
    ...modifiedDeal.dealSnapshot.loanTransactions.items,
  ];

  const bonds = [];
  const loans = [];

  let shouldUpdateCount = 0;
  let updatedCount = 0;

  return new Promise((resolve) => {
    facilities.forEach(async (facility) => {
      const {
        _id: facilityId,
        currency,
        facilityValue,
        facilityType,
      } = facility;

      if (currency && currency.id !== 'GBP') {
        shouldUpdateCount += 1;
        const currencyExchange = await api.getCurrencyExchangeRate(currency.id, 'GBP');

        const {
          midPrice: exchangeRate,
        } = currencyExchange;

        const facilityUpdate = {
          facilityValueInGBP: Number(facilityValue) * exchangeRate,
        };

        const updatedFacility = await api.updateFacility(facilityId, facilityUpdate);

        // update deal object to return in response
        if (facilityType === 'bond') {
          bonds.push(updatedFacility);
        } else if (facilityType === 'loan') {
          loans.push(updatedFacility);
        }

        updatedCount += 1;
      } else if (facilityType === 'bond') {
        bonds.push(facility);
      } else if (facilityType === 'loan') {
        loans.push(facility);
      }

      if (updatedCount === shouldUpdateCount) {
        modifiedDeal.dealSnapshot.bondTransactions.items = bonds;
        modifiedDeal.dealSnapshot.loanTransactions.items = loans;

        return resolve(modifiedDeal);
      }
      return modifiedDeal;
    });
  });
};

exports.addFacilityCurrencyConversion = addFacilityCurrencyConversion;
