const api = require('../api');

const addFacilityCurrencyConversion = async (deal) => {
  const modifiedDeal = deal;
  let facilities = [];

  // TODO we only have this logic because it acts differently in api tests and in real world.
  // real world has snapshot, api test doesn't.
  // get snapshot scenario working in api test, then can be removed

  const dealHasSnapshot = (deal && deal.dealSnapshot);

  if (dealHasSnapshot) {
    facilities = [
      ...modifiedDeal.dealSnapshot.bondTransactions.items,
      ...modifiedDeal.dealSnapshot.loanTransactions.items,
    ];
  } else {
    facilities = [
      ...modifiedDeal.bondTransactions.items,
      ...modifiedDeal.loanTransactions.items,
    ];
  }

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

      if (currency.id !== 'GBP') {
        shouldUpdateCount += 1;
        const currencyExchange = await api.getCurrencyExchangeRate(currency.id, 'GBP');

        const {
          midPrice: exchangeRate,
        } = currencyExchange;

        const facilityUpdate = {
          tfm: {
            ...facility.tfm,
            facilityValueInGBP: Number(facilityValue) * exchangeRate,
          },
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
        if (dealHasSnapshot) {
          modifiedDeal.dealSnapshot.bondTransactions.items = bonds;
          modifiedDeal.dealSnapshot.loanTransactions.items = loans;
        } else {
          modifiedDeal.bondTransactions.items = bonds;
          modifiedDeal.loanTransactions.items = loans;
        }

        return resolve(modifiedDeal);
      }
      return modifiedDeal;
    });
    // return modifiedDeal;
  });
};

exports.addFacilityCurrencyConversion = addFacilityCurrencyConversion;
