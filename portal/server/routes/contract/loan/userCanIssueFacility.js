const userCanIssueFacility = (user, deal, loan) => {
  const isMaker = user.roles.includes('maker');

  const {
    status,
    submissionType,
  } = deal.details;

  if (isMaker
    && (status === 'Acknowledged by UKEF' || status === 'Ready for Checker\'s approval')
    && (submissionType === 'Automatic Inclusion Notice' || submissionType === 'Manual Inclusion Notice')
    && loan.facilityStage === 'Conditional'
    && !loan.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

export default userCanIssueFacility;
