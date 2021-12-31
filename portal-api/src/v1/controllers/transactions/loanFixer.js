const GRAPHQL_FILTER_BY_TRANSACTION_TYPE = 'transaction.transactionType';
const TRANSACTION_PREV_COVER_START_DATE = 'transaction.previousCoverStartDate';
const TRANSACTION_STAGE = 'transaction.transactionStage';
const FILTER_SEARCH = 'filterSearch';
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

    if (FILTER_SEARCH === filterField) {
      keyFields.search = filter[FILTER_SEARCH];
    }

    if (TRANSACTION_STAGE === filterField) {
      keyFields.filterByTransactionStage = fixTransactionStage(filter[TRANSACTION_STAGE]);
    }

    if (TRANSACTION_PREV_COVER_START_DATE === filterField) {
      keyFields.onlyShowNotNullPrevCoverStartDate = true;
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

      if (keyFields.search) {
        const regex = new RegExp(`^${keyFields.search}`, 'i');
        const ukefFacilityId = Array.isArray(loan.ukefFacilityId) ? loan.ukefFacilityId[0] : loan.ukefFacilityId;

        const matchesUKEFId = ukefFacilityId && ukefFacilityId.match(regex);
        const matchesBankRefNum = loan.bankReferenceNumber && loan.bankReferenceNumber.match(regex);
        if (!matchesBankRefNum && !matchesUKEFId) return false;
      }

      if (keyFields.filterByBankFacilityId) {
        const regex = new RegExp(`^${keyFields.filterByBankFacilityId}`, 'i');
        if (loan.bankReferenceNumber && !loan.bankReferenceNumber.match(regex)) {
          return false;
        }
      }

      if (keyFields.filterByUkefFacilityId) {
        const regex = new RegExp(`^${keyFields.filterByUkefFacilityId}`, 'i');
        const ukefFacilityId = Array.isArray(loan.ukefFacilityId) ? loan.ukefFacilityId[0] : loan.ukefFacilityId;
        if (ukefFacilityId && !ukefFacilityId.match(regex)) {
          return false;
        }
      }

      if (keyFields.onlyShowNotNullPrevCoverStartDate) {
        if (!loan.previousCoverStartDate) {
          return false;
        }
      }

      return true; // all the filters should remove anything that needs removing so if we reach here -> true.
    }).map((loan) => ({
      // map whatever's still left into the generic schema that graphQL is expecting..
      deal_id: deal._id,
      deal_status: deal.status,
      deal_supplierName: deal.submissionDetails['supplier-name'],
      deal_bankInternalRefName: deal.bankInternalRefName,
      deal_ukefDealId: deal.details.ukefDealId,
      deal_bank: deal.bank.name,
      deal_created: deal.details.created,
      deal_submissionDate: deal.details.submissionDate,
      deal_submissionType: deal.submissionType,
      transaction_id: loan._id,
      bankFacilityId: loan.bankReferenceNumber,
      ukefFacilityId: loan.ukefFacilityId,
      transactionType: 'loan',
      value: loan.value,
      currency: loan.currency,
      transactionStage: loan.facilityStage,
      issuedDate: loan.issuedDate,
      createdDate: loan.createdDate,
      lastEdited: loan.lastEdited,
      endDate: loan.endDate,
      maker: deal.details.maker ? `${deal.details.maker.firstname || ''} ${deal.details.maker.surname || ''}` : '',
      checker: deal.details.checker ? `${deal.details.checker.firstname || ''} ${deal.details.checker.surname || ''}` : '',
      issueFacilityDetailsSubmitted: loan.issueFacilityDetailsSubmitted,
      requestedCoverStartDate: loan.requestedCoverStartDate,
      previousCoverStartDate: loan.previousCoverStartDate,
      dateOfCoverChange: loan.dateOfCoverChange,
      issuedFacilitySubmittedToUkefTimestamp: loan.issuedFacilitySubmittedToUkefTimestamp,
      issuedFacilitySubmittedToUkefBy: loan.issuedFacilitySubmittedToUkefBy ? `${loan.issuedFacilitySubmittedToUkefBy.firstname || ''} ${loan.issuedFacilitySubmittedToUkefBy.surname || ''}` : '',
    }));
  };

  return {
    shouldReturnLoans,
    filteredLoansFor,
  };
};

module.exports = constructor;
