const userCanIssueFacility = (user, deal, facility) => {
  const isMaker = user.roles.includes('maker');

  const {
    status,
    submissionType,
  } = deal.details;

  const allowedDealStatus = (status === 'Acknowledged by UKEF' || status === 'Ready for Checker\'s approval');
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

export default userCanIssueFacility;
