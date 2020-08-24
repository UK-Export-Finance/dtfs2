const canIssueFacility = (userRoles, deal, facility) => {
  const isMaker = userRoles.includes('maker');

  const {
    status,
    submissionType,
  } = deal.details;

  const {
    previousFacilityStage,
  } = facility;

  const acceptedByUkefDealStatus = (status === 'Accepted by UKEF (with conditions)'
    || status === 'Accepted by UKEF (without conditions)');

  const allowedDealStatus = (status === 'Acknowledged by UKEF'
                            || acceptedByUkefDealStatus
                            || status === 'Ready for Checker\'s approval'
                            || status === 'Further Maker\'s input required');

  const allowedDealSubmissionType = (submissionType === 'Automatic Inclusion Notice'
                                    || submissionType === 'Manual Inclusion Notice');

  const isMiaDealInAllowedStatus = (submissionType === 'Manual Inclusion Application'
                                    && (acceptedByUkefDealStatus || status === 'Ready for Checker\'s approval'));

  const allowedBondFacilityStage = facility.bondStage === 'Unissued'
                                   || (facility.bondStage === 'Issued' && (previousFacilityStage === 'Unissued' || previousFacilityStage === 'Issued'));

  const allowedLoanFacilityStage = facility.facilityStage === 'Conditional'
                                   || (facility.facilityStage === 'Unconditional' && (previousFacilityStage === 'Conditional' || previousFacilityStage === 'Unconditional'));

  const allowedFacilityStage = (allowedLoanFacilityStage || allowedBondFacilityStage);

  const isAllowedDealStatusAndSubmissionType = ((allowedDealStatus
                                                && allowedDealSubmissionType)
                                                || isMiaDealInAllowedStatus);

  if (isMaker
    && isAllowedDealStatusAndSubmissionType
    && allowedFacilityStage
    && !facility.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

export default canIssueFacility;
