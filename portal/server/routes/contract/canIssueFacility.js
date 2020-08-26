const canIssueFacility = (userRoles, deal, facility) => {
  const isMaker = userRoles.includes('maker');

  const {
    status: dealStatus,
    submissionType,
  } = deal.details;

  const {
    status: facilityStatus,
    previousFacilityStage,
  } = facility;

  const acceptedByUkefDealStatus = (dealStatus === 'Accepted by UKEF (with conditions)'
    || dealStatus === 'Accepted by UKEF (without conditions)');

  const allowedDealSubmissionType = (submissionType === 'Automatic Inclusion Notice'
                                    || submissionType === 'Manual Inclusion Notice');

  const isMiaDealInAllowedStatus = (submissionType === 'Manual Inclusion Application'
                                    && acceptedByUkefDealStatus);

  const allowedBondFacilityStage = facility.bondStage === 'Unissued'
                                   || (facility.bondStage === 'Issued' && (previousFacilityStage === 'Unissued' || previousFacilityStage === 'Issued'));

  const allowedLoanFacilityStage = facility.facilityStage === 'Conditional'
                                   || (facility.facilityStage === 'Unconditional' && (previousFacilityStage === 'Conditional' || previousFacilityStage === 'Unconditional'));

  const allowedFacilityStage = (allowedLoanFacilityStage || allowedBondFacilityStage);

  const allowedDealAndFacilityStatus = (
    (dealStatus === 'Acknowledged by UKEF' || facilityStatus === 'Maker\'s input required')
    || (dealStatus === 'Acknowledged by UKEF' && facilityStatus === 'Not started')
    || (dealStatus === 'Further Maker\'s input required' && facilityStatus === 'Not started')
  );

  const isAllowedDealAndFacilityStatus = ((allowedDealAndFacilityStatus
                                                && allowedDealSubmissionType)
                                                || isMiaDealInAllowedStatus);

  if (isMaker
    && isAllowedDealAndFacilityStatus
    && allowedFacilityStage
    && !facility.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

export default canIssueFacility;
