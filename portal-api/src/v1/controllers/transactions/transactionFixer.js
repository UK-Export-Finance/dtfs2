const { isSuperUser } = require('../../users/checks');
const bondFixer = require('./bondFixer');
const loanFixer = require('./loanFixer');

const bankInternalRefName = 'bankInternalRefName';
const TRANSACTION_STAGE = 'transaction.transactionStage';
const TRANSACTION_DEAL_CREATED = 'details.created';
const DEAL_ID = '_id';
const DEAL_STATUS = 'status';
const DEAL_PREVIOUS_STATUS = 'details.previousStatus';
const TRANSACTION_PREVIOUS_COVER_START_DATE = 'transaction.previousCoverStartDate';
const DEAL_BANK = 'bank.id';
const UKEF_DEAL_ID = 'details.ukefDealId';
const DEAL_SUBMISSION_TYPE = 'submissionType';
const SUBMISSION_SUPPLIER_NAME = 'submissionDetails.supplier-name';
const FILTER_SEARCH = 'filterSearch';

const constructor = (user, filters) => {
  const bondFix = bondFixer(filters);
  const loanFix = loanFixer(filters);

  const transactionsQuery = () => {
    const listOfMongoQueryElements = filters.reduce((listSoFar, filter) => {
      const filterField = Object.keys(filter)[0];// only expecting one entry/block

      if (FILTER_SEARCH === filterField) {
        const bondMatchesOnUkefFacilityId = { 'bondTransactions.items': { $elemMatch: { ukefFacilityId: { $regex: `^${filter[FILTER_SEARCH]}`, $options: 'i' } } } };
        const loanMatchesOnUkefFacilityId = { 'loanTransactions.items': { $elemMatch: { ukefFacilityId: { $regex: `^${filter[FILTER_SEARCH]}`, $options: 'i' } } } };

        const bondMatchesOnUniqueIdNum = { 'bondTransactions.items': { $elemMatch: { uniqueIdentificationNumber: { $regex: `^${filter[FILTER_SEARCH]}`, $options: 'i' } } } };
        const loanMatchesOnBankRefNum = { 'loanTransactions.items': { $elemMatch: { bankReferenceNumber: { $regex: `^${filter[FILTER_SEARCH]}`, $options: 'i' } } } };

        return listSoFar.concat([{
          $or: [
            bondMatchesOnUkefFacilityId,
            bondMatchesOnUniqueIdNum,
            loanMatchesOnUkefFacilityId,
            loanMatchesOnBankRefNum,
          ],
        }]);
      }

      if (TRANSACTION_STAGE === filterField) {
        let bondMatchesOnFacilityStage = {};
        let loanMatchesOnFacilityStage = {};
        if (filter[filterField] === 'issued_unconditional') {
          bondMatchesOnFacilityStage = { 'bondTransactions.items': { $elemMatch: { facilityStage: 'Issued' } } };
          loanMatchesOnFacilityStage = { 'loanTransactions.items': { $elemMatch: { facilityStage: 'Unconditional' } } };
        }
        if (filter[filterField] === 'unissued_conditional') {
          bondMatchesOnFacilityStage = { 'bondTransactions.items': { $elemMatch: { facilityStage: 'Unissued' } } };
          loanMatchesOnFacilityStage = { 'loanTransactions.items': { $elemMatch: { facilityStage: 'Conditional' } } };
        }
        return listSoFar.concat([{ $or: [bondMatchesOnFacilityStage, loanMatchesOnFacilityStage] }]);
      }

      if (TRANSACTION_DEAL_CREATED === filterField) {
        const dealWithinSpecifiedRange = { 'details.created': filter[filterField] };

        return listSoFar.concat([dealWithinSpecifiedRange]);
      }

      if (DEAL_ID === filterField) {
        const deal = { _id: filter[filterField] };

        return listSoFar.concat([deal]);
      }
      if (DEAL_STATUS === filterField) {
        const dealwithStatus = { status: filter[filterField] };

        return listSoFar.concat([dealwithStatus]);
      }
      if (DEAL_PREVIOUS_STATUS === filterField) {
        const dealwithStatus = { previousStatus: filter[filterField] };

        return listSoFar.concat([dealwithStatus]);
      }
      if (DEAL_BANK === filterField) {
        const dealwithStatus = { 'bank.id': filter[filterField] };

        return listSoFar.concat([dealwithStatus]);
      }
      if (UKEF_DEAL_ID === filterField) {
        const dealwithStatus = { 'details.ukefDealId': { $regex: filter[filterField], $options: 'i' } };

        return listSoFar.concat([dealwithStatus]);
      }
      if (bankInternalRefName === filterField) {
        const dealwithSupplyID = { bankInternalRefName: { $regex: filter[filterField], $options: 'i' } };
        return listSoFar.concat([dealwithSupplyID]);
      }
      if (SUBMISSION_SUPPLIER_NAME === filterField) {
        const dealwithSupplyID = { 'submissionDetails.supplier-name': { $regex: filter[filterField], $options: 'i' } };

        return listSoFar.concat([dealwithSupplyID]);
      }
      if (DEAL_SUBMISSION_TYPE === filterField) {
        const deal = { submissionType: filter[filterField] };

        return listSoFar.concat([deal]);
      }
      if (TRANSACTION_PREVIOUS_COVER_START_DATE === filterField) {
        // bad. this should really respect what we're passing in but i don't have time to unpick how we're dealing with
        // the operations and values; the only reason we ever use this filter is to filter out nulls and
        // there's going to be more hacking needed in the bond/loan fixers so..
        //  i just don't see a quick way of doing this well.
        const bondMatchesOnPreviousCoverStartDate = { 'bondTransactions.items': { $elemMatch: { previousCoverStartDate: { $ne: null } } } };
        const loanMatchesOnPreviousCoverStartDate = { 'loanTransactions.items': { $elemMatch: { previousCoverStartDate: { $ne: null } } } };
        return listSoFar.concat([{ $or: [bondMatchesOnPreviousCoverStartDate, loanMatchesOnPreviousCoverStartDate] }]);
      }

      return listSoFar;
    }, []);

    if (!isSuperUser(user)) {
      listOfMongoQueryElements.push({ 'bank.id': { $eq: user.bank.id } });
    }

    if (listOfMongoQueryElements.length === 1) {
      return listOfMongoQueryElements[0];
    } if (listOfMongoQueryElements.length > 1) {
      return {
        $and: listOfMongoQueryElements,
      };
    }

    return {};
  };

  const filteredTransactions = (deal) => {
    // if we're explicitly filtering out bonds:
    //  - default to an empty list of bonds, avoid having to think about edge cases
    // if we're not explicitly filtering bonds out
    //  - use our bondFix toolkit to get the list of bonds it's legit to display
    const bonds = bondFix.shouldReturnBonds() ? bondFix.filteredBondsFor(deal) : [];
    // same for loans
    const loans = loanFix.shouldReturnLoans() ? loanFix.filteredLoansFor(deal) : [];

    return bonds.concat(loans);
  };

  return {
    transactionsQuery,
    filteredTransactions,
  };
};

module.exports = constructor;
