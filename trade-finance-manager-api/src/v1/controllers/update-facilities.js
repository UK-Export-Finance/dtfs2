const api = require('../api');
const convertFacilityCurrency = require('./convert-facility-currency');
const getFacilityExposurePeriod = require('./get-facility-exposure-period');
const DEFAULTS = require('../defaults');
// const getFacilityPremiumSchedule = require('./get-facility-premium-schedule');
const getGuaranteeDates = require('../helpers/get-guarantee-dates');

const updateFacilities = async (deal) => {
  // Create deep clone
  const modifiedDeal = JSON.parse(JSON.stringify(deal));

  const {
    submissionDate: dealSubmissionDate,
  } = deal.dealSnapshot.details;

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
        facilityType,
      } = facility;

      const facilityGuaranteeDates = getGuaranteeDates(facility, dealSubmissionDate);

      const facilityCurrencyConversion = await convertFacilityCurrency(facility, dealSubmissionDate);
      const facilityExposurePeriod = await getFacilityExposurePeriod(facility);
      // const facilityPremiumSchedule = await getFacilityPremiumSchedule(
      //   facility,
      //   facilityExposurePeriod,
      //   facilityGuaranteeDates,
      // );


      // TODO
      // exposure period is not in unit test
      const facilityUpdate = {
        ...facilityCurrencyConversion,
        ...facilityExposurePeriod,
        facilityGuaranteeDates,
        riskProfile: DEFAULTS.FACILITY_RISK_PROFILE,
        // premiumSchedule: facilityPremiumSchedule,
      };
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


exports.updateFacilities = updateFacilities;
