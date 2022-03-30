const canIssueOrEditIssueFacility = require('./canIssueOrEditIssueFacility');

const dealWithCanIssueFacilityFlags = (userRoles, deal) => {
  const modifiedDeal = deal;

  modifiedDeal.facilities.map((f) => {
    const facility = f;

    if (canIssueOrEditIssueFacility(userRoles, deal, facility)) {
      facility.canIssueOrEditIssueFacility = true;
    }

    return facility;
  });

  modifiedDeal.bonds = modifiedDeal.facilities.filter((facility) => facility.type === 'Bond');
  modifiedDeal.loans = modifiedDeal.facilities.filter((facility) => facility.type === 'Loan');

  return modifiedDeal;
};

module.exports = dealWithCanIssueFacilityFlags;
