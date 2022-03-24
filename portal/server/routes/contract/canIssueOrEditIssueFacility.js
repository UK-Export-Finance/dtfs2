const canIssueOrEditIssueFacility = (userRoles, deal, facility) => {
  const isMaker = userRoles.includes('maker');

  const {
    submissionType,
    status: dealStatus,
    details,
  } = deal;

  const {
    submissionDate,
  } = details;

  const dealHasBeenSubmitted = submissionDate;

  const {
    status: facilityStatus,
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
                                    && (acceptedByUkefDealStatus || dealStatus === 'Further Maker\'s input required'));

  const allowedBondFacilityStage = facility.facilityStage === 'Unissued'
                                   || (facility.facilityStage === 'Issued' && !facility.issueFacilityDetailsSubmitted);

  const allowedLoanFacilityStage = facility.facilityStage === 'Conditional'
                                   || (facility.facilityStage === 'Unconditional' && !facility.issueFacilityDetailsSubmitted);

  const allowedFacilityStage = (allowedLoanFacilityStage || allowedBondFacilityStage);

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

module.exports = canIssueOrEditIssueFacility;
