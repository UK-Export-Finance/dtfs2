const GRAPHQL_FILTER_BY_TRANSACTION_TYPE = 'transaction.transactionType';
const BANKFACILITYID = 'transaction.bankFacilityId';
const UKEFFACILITYID = 'transaction.ukefFacilityId';
const TRANSACTION_STAGE = 'transaction.transactionStage';

const DISPLAY_LOANS = ['loan', 'all'];
const transactionStageMapping = {
  unissued_conditional: 'Conditional',
  issued_unconditional: 'Unconditional',
};

const fixTransactionStage = (stage) => transactionStageMapping[stage];

const constructor = (listOfFilters) => {
  // probably inefficient, but for the sake of my sanity, calling out
  //  all the fields we're interested in for easy reference later

  const keyFields = {};
  listOfFilters.filter((filter) => {
    const filterField = Object.keys(filter)[0]; // only expecting one field/block

    if (GRAPHQL_FILTER_BY_TRANSACTION_TYPE === filterField) {
      keyFields.filterByTransactionType = filter[GRAPHQL_FILTER_BY_TRANSACTION_TYPE];
    }

    if (BANKFACILITYID === filterField) {
      keyFields.filterByBankFacilityId = filter[BANKFACILITYID];
    }

    if (UKEFFACILITYID === filterField) {
      keyFields.filterByUkefFacilityId = filter[UKEFFACILITYID];
    }

    if (TRANSACTION_STAGE === filterField) {
      keyFields.filterByTransactionStage = fixTransactionStage(filter[TRANSACTION_STAGE]);
    }

    return true; // lint made me
  });

  const shouldReturnLoans = () => {
    // if we're not trying to filter on transaction type, carry on..
    if (!keyFields.filterByTransactionType) {
      return true;
    }

    // if we are: check to see if loans are in or out..
    return DISPLAY_LOANS.includes(keyFields.filterByTransactionType);
  };

  const filteredLoansFor = (deal) => {
    // 1. get a list of loans out of the deal
    // 2. .filter to get rid of anything that doesn't match the provided filters
    // 3. .map to put what's left into the format expected by our dashboard+graphQL

    const loans = deal.loanTransactions && deal.loanTransactions.items ? deal.loanTransactions.items : [];

    return loans.filter((loan) => {
      if (keyFields.filterByTransactionStage && loan.facilityStage !== keyFields.filterByTransactionStage) {
        return false;
      }

      if (keyFields.filterByBankFacilityId) {
        const regex = new RegExp(`^${keyFields.filterByBankFacilityId}`);
        if (!loan.bankReferenceNumber || !loan.bankReferenceNumber.match(regex)) {
          return false;
        }
      }

      if (keyFields.filterByUkefFacilityId) {
        const regex = new RegExp(`^${keyFields.filterByUkefFacilityId}`);
        if (!loan.ukefFacilityID || !loan.ukefFacilityID.match(regex)) {
          return false;
        }
      }

      return true;
    }).map((loan) => ({
      // map whatever's still left into the generic schema that graphQL is expecting..
      deal_id: deal._id, // eslint-disable-line no-underscore-dangle
      deal_status: deal.details.status,
      deal_supplierName: deal.submissionDetails['supplier-name'],
      deal_bankSupplyContractID: deal.details.bankSupplyContractID,
      deal_ukefDealId: deal.details.ukefDealId,
      deal_owningBank: deal.details.owningBank.name,
      deal_created: deal.details.created,
      deal_submissionDate: deal.details.submissionDate,
      transaction_id: loan._id, // eslint-disable-line no-underscore-dangle
      bankFacilityId: loan.bankReferenceNumber,
      ukefFacilityId: loan.ukefFacilityID,
      transactionType: 'loan',
      facilityValue: loan.facilityValue,
      currency: loan.currency,
      transactionStage: loan.facilityStage,
      issuedDate: loan.issuedDate,
      createdDate: loan.createdDate,
      lastEdited: loan.lastEdited,
      endDate: loan.endDate,
      maker: deal.details.maker ? `${deal.details.maker.firstname || ''} ${deal.details.maker.surname || ''}` : '',
      checker: deal.details.checker ? `${deal.details.checker.firstname || ''} ${deal.details.checker.surname || ''}` : '',
      issueFacilityDetailsSubmitted: loan.issueFacilityDetailsSubmitted,
    }));
  };

  return {
    shouldReturnLoans,
    filteredLoansFor,
  };
};

module.exports = constructor;
