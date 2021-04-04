const api = require('../api');
const CONSTANTS = require('../../constants');

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

      // bond facility is either Unissued or Issued.
      // loan facility is either Conditional or Unconditional
      const shouldChangeStatus = ((previousFacilityStage === 'Unissued' && facilityStage === 'Issued')
        || (previousFacilityStage === 'Conditional' && facilityStage === 'Unconditional'));


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
