const dealHasIssuedFacilitiesToSubmit = (deal) => {
  const facilitiesToSubmit = deal.facilities.filter((facility) => {
    if (facility.issueFacilityDetailsProvided === true
      && !facility.issueFacilityDetailsSubmitted
      && facility.status !== 'Ready for check'
      && facility.status !== 'Submitted') {
      return facility;
    }

    if (facility.issueFacilityDetailsSubmitted
        && facility.status === 'Maker\'s input required') {
      return facility;
    }
    return null;
  });

  if (facilitiesToSubmit.length > 0) {
    return true;
  }

  return false;
};

module.exports = dealHasIssuedFacilitiesToSubmit;
