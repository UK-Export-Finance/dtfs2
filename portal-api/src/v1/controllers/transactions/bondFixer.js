const GRAPHQL_FILTER_BY_TRANSACTION_TYPE = 'transaction.transactionType';
const TRANSACTION_PREV_COVER_START_DATE = 'transaction.previousCoverStartDate';
const TRANSACTION_STAGE = 'transaction.transactionStage';
const FILTER_SEARCH = 'filterSearch';

const DISPLAY_BONDS = ['bond', 'all'];
const transactionStageMapping = {
  unissued_conditional: 'Unissued',
  issued_unconditional: 'Issued',
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

  const shouldReturnBonds = () => {
    // if we're not trying to filter on transaction type, carry on..
    if (!keyFields.filterByTransactionType) {
      return true;
    }

    // if we are: check to see if bonds are in or out..
    return DISPLAY_BONDS.includes(keyFields.filterByTransactionType);
  };

  const filteredBondsFor = (deal) => {
    // 1. get a list of bonds out of the deal
    // 2. .filter to get rid of anything that doesn't match the provided filters
    // 3. .map to put what's left into the format expected by our dashboard+graphQL

    const bonds = deal.bondTransactions && deal.bondTransactions.items ? deal.bondTransactions.items : [];

    return bonds.filter((bond) => {
      if (keyFields.filterByTransactionStage && bond.facilityStage !== keyFields.filterByTransactionStage) {
        return false;
      }

      if (keyFields.search) {
        const regex = new RegExp(`^${keyFields.search}`, 'i');
        const ukefFacilityId = Array.isArray(bond.ukefFacilityId) ? bond.ukefFacilityId[0] : bond.ukefFacilityId;

        const matchesUKEFId = ukefFacilityId && ukefFacilityId.match(regex);
        const matchesUniqueId = bond.uniqueIdentificationNumber && bond.uniqueIdentificationNumber.match(regex);
        if (!matchesUniqueId && !matchesUKEFId) return false;
      }

      if (keyFields.filterByBankFacilityId) {
        const regex = new RegExp(`^${keyFields.filterByBankFacilityId}`, 'i');
        if (bond.uniqueIdentificationNumber && !bond.uniqueIdentificationNumber.match(regex)) {
          return false;
        }
      }

      if (keyFields.filterByUkefFacilityId) {
        const regex = new RegExp(`^${keyFields.filterByUkefFacilityId}`, 'i');
        const ukefFacilityId = Array.isArray(bond.ukefFacilityId) ? bond.ukefFacilityId[0] : bond.ukefFacilityId;
        if (ukefFacilityId && !ukefFacilityId.match(regex)) {
          return false;
        }
      }

      if (keyFields.onlyShowNotNullPrevCoverStartDate) {
        if (!bond.previousCoverStartDate) {
          return false;
        }
      }

      return true; // the filter should reject things that don't fit; if we reach here we have not rejected this record.
    }).map((bond) => ({
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
      transaction_id: bond._id,
      bankFacilityId: bond.uniqueIdentificationNumber,
      ukefFacilityId: bond.ukefFacilityId,
      transactionType: 'bond',
      value: bond.value,
      currency: bond.currency,
      transactionStage: bond.facilityStage,
      createdDate: bond.createdDate,
      lastEdited: bond.lastEdited,
      issuedDate: bond.issuedDate,
      endDate: bond.endDate,
      maker: deal.maker ? `${deal.maker.firstname || ''} ${deal.maker.surname || ''}` : '',
      checker: deal.details.checker ? `${deal.details.checker.firstname || ''} ${deal.details.checker.surname || ''}` : '',
      issueFacilityDetailsSubmitted: bond.issueFacilityDetailsSubmitted,
      requestedCoverStartDate: bond.requestedCoverStartDate,
      previousCoverStartDate: bond.previousCoverStartDate,
      dateOfCoverChange: bond.dateOfCoverChange,
      issuedFacilitySubmittedToUkefTimestamp: bond.issuedFacilitySubmittedToUkefTimestamp,
      issuedFacilitySubmittedToUkefBy: bond.issuedFacilitySubmittedToUkefBy ? `${bond.issuedFacilitySubmittedToUkefBy.firstname || ''} ${bond.issuedFacilitySubmittedToUkefBy.surname || ''}` : '',
    }));
  };

  return {
    shouldReturnBonds,
    filteredBondsFor,
  };
};

module.exports = constructor;
