const canAmendFacility = require('./canAmendFacility');
const canIssueOrEditIssueFacility = require('./canIssueOrEditIssueFacility');

const dealWithFacilityFlags = (userRoles, deal) => {
  const modifiedDeal = deal;

  const bonds = modifiedDeal.bondTransactions.items;
  const loans = modifiedDeal.loanTransactions.items;

  bonds.map((b) => {
    const bond = b;

    bond.canIssueOrEditIssueFacility = canIssueOrEditIssueFacility(userRoles, deal, b);
    bond.canAmendFacility = canAmendFacility(userRoles, deal);

    return bond;
  });

  loans.map((l) => {
    const loan = l;
    loan.canIssueOrEditIssueFacility = canIssueOrEditIssueFacility(userRoles, deal, l);
    loan.canAmendFacility = canAmendFacility(userRoles, deal);

    return loan;
  });

  return modifiedDeal;
};

module.exports = dealWithFacilityFlags;
