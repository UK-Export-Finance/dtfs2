const api = require('../api');
const CONSTANTS = require('../../constants');
//
// TODO: do we need to update TFM facilities  as well?
// probably, beacuse when facilities are issued, dates etc can change
//
// what happens to tfm deal when deal/facilities are submitted for a second time? 
// probably need to do 
// const updatedFacility = await api.updateFacility(facilityId, facilityUpdate);

const updatedIssuedFacilities = async (deal) => {
  const modifiedDeal = deal;

  const facilities = [
    ...modifiedDeal.dealSnapshot.bondTransactions.items,
    ...modifiedDeal.dealSnapshot.loanTransactions.items,
  ];

  const bonds = [];
  const loans = [];

  let updatedCount = 0;
  let shouldUpdateCount = 0;

  // mappedDeal.facilities = await Promise.all(deal.facilities.map(async (facilityId) =>
  // api.findOneFacility(facilityId)));

  return new Promise((resolve) => {
    facilities.forEach(async (facility) => {
      const {
        _id: facilityId,
        facilityType,
        facilityStage,
        previousFacilityStage,
      } = facility;

      const shouldChangeStatus = (previousFacilityStage === 'Unissued' && facilityStage === 'Issued');

      if (shouldChangeStatus) {
        shouldUpdateCount += 1;

        const facilityStatusUpdate = CONSTANTS.FACILITIES.FACILITY_STATUS_PORTAL.ACKNOWLEDGED;

        const updatedFacility = await api.updatePortalFacilityStatus(facilityId, facilityStatusUpdate);

        // update deal object to return in response
        if (facilityType === 'bond') {
          bonds.push(updatedFacility);
        } else if (facilityType === 'loan') {
          loans.push(updatedFacility);
        }

        updatedCount += 1;
      } else if (facilityType === 'bond') {
        // update deal object to return in response
        bonds.push(facility);
      } else if (facilityType === 'loan') {
        loans.push(facility);
      }

      if (shouldUpdateCount === updatedCount) {
        modifiedDeal.dealSnapshot.bondTransactions.items = bonds;
        modifiedDeal.dealSnapshot.loanTransactions.items = loans;

        return resolve(modifiedDeal);
      }
      return modifiedDeal;
    });
  });
};


exports.updatedIssuedFacilities = updatedIssuedFacilities;
