const canIssueFacility = (userRoles, deal, facility) => {
  const isMaker = userRoles.includes('maker');

  const {
    status,
    submissionType,
  } = deal.details;

  const allowedDealStatus = (status === 'Acknowledged by UKEF'
                            || status === 'Accepted by UKEF (with conditions)'
                            || status === 'Accepted by UKEF (without conditions)'
                            || status === 'Ready for Checker\'s approval');

  const allowedDealSubmissionType = (submissionType === 'Automatic Inclusion Notice' || submissionType === 'Manual Inclusion Notice');

  const allowedLoanFacilityStage = facility.facilityStage === 'Conditional';
  // TODO: rename bondStage to facilityStage
  const allowedBondFacilityStage = facility.bondStage === 'Unissued';
  const allowedFacilityStage = (allowedLoanFacilityStage || allowedBondFacilityStage);

  if (isMaker
    && allowedDealStatus
    && allowedDealSubmissionType
    && allowedFacilityStage
    && !facility.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

export default canIssueFacility;
