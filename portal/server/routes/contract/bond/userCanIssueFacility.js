const userCanIssueFacility = (user, deal, bond) => {
  const isMaker = user.roles.includes('maker');

  const {
    status,
    submissionType,
  } = deal.details;

  if (isMaker
    && (status === 'Acknowledged by UKEF' || status === 'Ready for Checker\'s approval')
    && (submissionType === 'Automatic Inclusion Notice' || submissionType === 'Manual Inclusion Notice')
    && bond.bondStage === 'Unissued'
    && !bond.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

export default userCanIssueFacility;
