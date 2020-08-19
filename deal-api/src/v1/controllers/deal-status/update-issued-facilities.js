const $ = require('mongo-dot-notation');
const CONSTANTS = require('../../../constants');

const updateIssuedFacilities = async (
  collection,
  deal,
  updateIssuedFacilitiesCoverStartDates = false,
  newStatus,
) => {
  const updatedDeal = deal;

  const fromStatus = deal.details.status;

  const dealStatusAllowsIssuedFacilitiesStatusChanges = (fromStatus && fromStatus !== 'Draft');

  const update = (facilities) => {
    const arr = facilities;

    arr.forEach((f) => {
      const facility = f;
      const {
        facilityStage,
        previousFacilityStage,
        bondStage,
      } = facility;

      const shouldUpdateLoan = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.CONDITIONAL
        || (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.UNCONDITIONAL
          && previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.CONDITIONAL));

      const shouldUpdateBond = (facility.bondStage === CONSTANTS.FACILITIES.BOND_STAGE.UNISSUED
        || (facility.bondStage === CONSTANTS.FACILITIES.BOND_STAGE.ISSUED
          && previousFacilityStage === CONSTANTS.FACILITIES.BOND_STAGE.UNISSUED));

      const shouldUpdateStatus = (facility.issueFacilityDetailsStarted
                                  && dealStatusAllowsIssuedFacilitiesStatusChanges
                                  && newStatus.length);

      if (shouldUpdateLoan || shouldUpdateBond) {
        if (facility.issueFacilityDetailsProvided && !facility.issueFacilityDetailsSubmitted) {
          if (shouldUpdateStatus) {
            facility.status = newStatus;
          }

          // TODO: rework this when we rename bondStage to facilityStage
          if (facilityStage) {
            facility.previousFacilityStage = facility.facilityStage;
            facility.facilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.UNCONDITIONAL;
          } else if (bondStage) {
            facility.previousFacilityStage = facility.bondStage;
            facility.bondStage = CONSTANTS.FACILITIES.BOND_STAGE.ISSUED;
          }
        } else if (shouldUpdateStatus) {
          // update all issued facilities regardless of if they've been submitted or have completed all required fields.
          facility.status = newStatus;
        }

        if (updateIssuedFacilitiesCoverStartDates
          && !facility.requestedCoverStartDate
          && facility.issuedDate) {
          facility.requestedCoverStartDate = facility.issuedDate;
        }
      }
      return facility;
    });
    return arr;
  };

  if (updatedDeal.loanTransactions.items.length > 0) {
    updatedDeal.loanTransactions.items = update(updatedDeal.loanTransactions.items);
  }

  if (updatedDeal.bondTransactions.items.length > 0) {
    updatedDeal.bondTransactions.items = update(updatedDeal.bondTransactions.items);
  }

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: deal._id }, // eslint-disable-line no-underscore-dangle
    $.flatten(updatedDeal),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

module.exports = updateIssuedFacilities;
