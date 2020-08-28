const canIssueFacility = (userRoles, deal, facility) => {
  const isMaker = userRoles.includes('maker');

  const {
    status: dealStatus,
    submissionType,
    submissionDate,
  } = deal.details;

  const dealHasBeenSubmitted = submissionDate;

  const {
    status: facilityStatus,
    previousFacilityStage,
  } = facility;

  if (dealStatus === 'Ready for Checker\'s approval'
    || facilityStatus === 'Ready for check'
    || facilityStatus === 'Submitted'
    || facilityStatus === 'Acknowledged') {
    return false;
  }

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

  // TODO
  // repeated Acknowledged by UKEF condition... not covered in test coverage
  // could be simplified
  const allowedDealAndFacilityStatus = (
    (dealStatus === 'Acknowledged by UKEF' || facilityStatus === 'Maker\'s input required')
    || (dealStatus === 'Acknowledged by UKEF' && facilityStatus === 'Not started')
    || (acceptedByUkefDealStatus && (facilityStatus === 'Maker\'s input required' || facilityStatus === 'Not started' || facilityStatus === 'Completed'))
    || (dealStatus === 'Further Maker\'s input required' && facilityStatus === 'Not started')
    || (dealStatus === 'Further Maker\'s input required' && facilityStatus === 'Completed')
  );

  const isAllowedDealAndFacilityStatus = ((allowedDealAndFacilityStatus
                                                && allowedDealSubmissionType)
                                                || isMiaDealInAllowedStatus);

  if (isMaker
    && dealHasBeenSubmitted
    && isAllowedDealAndFacilityStatus
    && allowedFacilityStage) {
    return true;
  }

  return false;
};

export default canIssueFacility;
