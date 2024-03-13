const CONSTANTS = require('../../constants');

const overrideFacilitiesIfAmendmentsInProgress = (facilities, amendments) => {
    // set each facility's hasAmendmentInProgress to true if it has an amendment in progress
    if (Array.isArray(amendments) && amendments?.length > 0) {
      return facilities.map((facility) => {
        const modifiedFacility = facility;
        // eslint-disable-next-line no-restricted-syntax
        for (const amendment of amendments) {
          const amendmentIsInProgress = amendment.status === CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;
          if (amendmentIsInProgress && (amendment.facilityId === facility.facilityId)) {
            modifiedFacility.hasAmendmentInProgress = true;
            break;
          }
        }
        return modifiedFacility;
      })
    }
    return facilities;
}

module.exports = { overrideFacilitiesIfAmendmentsInProgress };