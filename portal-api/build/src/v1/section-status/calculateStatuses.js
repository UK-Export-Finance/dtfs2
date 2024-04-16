"use strict";
const { addAccurateStatusesToBonds } = require('./bonds');
const { addAccurateStatusesToLoans } = require('./loans');
const aboutSupplyContractStatus = require('./aboutSupplyContractStatus');
module.exports = (deal, validationErrors) => (Object.assign(Object.assign({}, deal), { bondTransactions: addAccurateStatusesToBonds(deal), loanTransactions: addAccurateStatusesToLoans(deal), submissionDetails: Object.assign(Object.assign({}, deal.submissionDetails), { status: aboutSupplyContractStatus(deal.submissionDetails, validationErrors.submissionDetailsErrors) }) }));
