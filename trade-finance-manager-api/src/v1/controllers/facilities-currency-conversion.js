const api = require('../api');
const calculateUkefExposure = require('../helpers/calculateUkefExposure');

const addFacilityCurrencyConversion = async (deal) => {
  const modifiedDeal = deal;

  const { submissionDate } = deal.dealSnapshot.details;

  const facilities = [
    ...modifiedDeal.dealSnapshot.bondTransactions.items,
    ...modifiedDeal.dealSnapshot.loanTransactions.items,
  ];

  const bonds = [];
  const loans = [];

  let updatedCount = 0;

  return new Promise((resolve) => {
    facilities.forEach(async (facility) => {
      const {
        _id: facilityId,
        currency,
        facilityValue,
        facilityType,
        coveredPercentage,
        ukefExposure,
      } = facility;

      let facilityUpdate;

      if (currency && currency.id !== 'GBP') {
        const currencyExchange = await api.getCurrencyExchangeRate(currency.id, 'GBP');

        const {
          midPrice: exchangeRate,
        } = currencyExchange;

        const strippedFacilityValue = Number(facilityValue.replace(/,/g, ''));

        const facilityValueInGBP = strippedFacilityValue * exchangeRate;

        facilityUpdate = {
          facilityValueInGBP,
          ...calculateUkefExposure(facilityValueInGBP, coveredPercentage),
        };
      } else {
        facilityUpdate = {
          ukefExposure,
          ukefExposureCalculationTimestamp: submissionDate,
        };
      }

      const updatedFacility = await api.updateFacility(facilityId, facilityUpdate);
      updatedCount += 1;

      // update deal object to return in response
      if (facilityType === 'bond') {
        bonds.push(updatedFacility);
      } else if (facilityType === 'loan') {
        loans.push(updatedFacility);
      }

      if (updatedCount === facilities.length) {
        modifiedDeal.dealSnapshot.bondTransactions.items = bonds;
        modifiedDeal.dealSnapshot.loanTransactions.items = loans;

        return resolve(modifiedDeal);
      }
      return modifiedDeal;
    });
  });
};


exports.addFacilityCurrencyConversion = addFacilityCurrencyConversion;
