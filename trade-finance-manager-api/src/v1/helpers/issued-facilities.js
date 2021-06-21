const isIssued = require('./is-issued');

const mapFacility = (facility) => facility.facilitySnapshot || facility;

const issuedFacilities = (dealSnapshot) => {
  const { bondTransactions, loanTransactions } = dealSnapshot;

  return {
    issuedBonds: bondTransactions.items.map(mapFacility).filter((bond) => isIssued(bond)),
    unissuedBonds: bondTransactions.items.map(mapFacility).filter((bond) => !isIssued(bond)),
    issuedLoans: loanTransactions.items.map(mapFacility).filter((loan) => isIssued(loan)),
    unissuedLoans: loanTransactions.items.map(mapFacility).filter((loan) => !isIssued(loan)),
  };
};

module.exports = { issuedFacilities };
