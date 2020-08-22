const { isSuperUser } = require('../../users/checks');
const bondFixer = require('./bondFixer');
const loanFixer = require('./loanFixer');

const BANKSUPPLYCONTRACTID = 'details.bankSupplyContractID';
const TRANSACTION_STAGE = 'transaction.transactionStage';
const DEAL_CREATED = 'details.created';
const DEAL_ID = '_id';
const DEAL_STATUS = 'details.status';
const DEAL_PREVIOUS_STATUS = 'details.previousStatus';
const DEAL_BANK = 'details.owningBank.id';
const UKEF_DEAL_ID = 'details.ukefDealId';
const DEAL_SUBMISSION_TYPE = 'details.submissionType';
const SUBMISSION_SUPPLIER_NAME = 'submissionDetails.supplier-name';
const FILTER_SEARCH = 'filterSearch';

const constructor = (user, filters) => {
  const bondFix = bondFixer(filters);
  const loanFix = loanFixer(filters);

  const transactionsQuery = () => {
    const listOfMongoQueryElements = filters.reduce((listSoFar, filter) => {
      const filterField = Object.keys(filter)[0];// only expecting one entry/block

      if (FILTER_SEARCH === filterField) {
        const bondMatchesOnUkefFacilityId = { 'bondTransactions.items': { $elemMatch: { ukefFacilityID: new RegExp(`^${filter[FILTER_SEARCH]}`, 'i') } } };
        const loanMatchesOnUkefFacilityId = { 'loanTransactions.items': { $elemMatch: { ukefFacilityID: new RegExp(`^${filter[FILTER_SEARCH]}`, 'i') } } };

        const bondMatchesOnUniqueIdNum = { 'bondTransactions.items': { $elemMatch: { uniqueIdentificationNumber: new RegExp(`^${filter[FILTER_SEARCH]}`, 'i') } } };
        const loanMatchesOnBankRefNum = { 'loanTransactions.items': { $elemMatch: { bankReferenceNumber: new RegExp(`^${filter[FILTER_SEARCH]}`, 'i') } } };

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
          bondMatchesOnFacilityStage = { 'bondTransactions.items': { $elemMatch: { bondStage: 'Issued' } } };
          loanMatchesOnFacilityStage = { 'loanTransactions.items': { $elemMatch: { facilityStage: 'Unconditional' } } };
        }
        if (filter[filterField] === 'unissued_conditional') {
          bondMatchesOnFacilityStage = { 'bondTransactions.items': { $elemMatch: { bondStage: 'Unissued' } } };
          loanMatchesOnFacilityStage = { 'loanTransactions.items': { $elemMatch: { facilityStage: 'Conditional' } } };
        }
        return listSoFar.concat([{ $or: [bondMatchesOnFacilityStage, loanMatchesOnFacilityStage] }]);
      }

      if (DEAL_CREATED === filterField) {
        const dealWithinSpecifiedRange = { 'details.created': filter[filterField] };

        return listSoFar.concat([dealWithinSpecifiedRange]);
      }

      if (DEAL_ID === filterField) {
        const deal = { _id: filter[filterField] };

        return listSoFar.concat([deal]);
      }
      if (DEAL_STATUS === filterField) {
        const dealwithStatus = { 'details.status': filter[filterField] };

        return listSoFar.concat([dealwithStatus]);
      }
      if (DEAL_PREVIOUS_STATUS === filterField) {
        const dealwithStatus = { 'details.previousStatus': filter[filterField] };

        return listSoFar.concat([dealwithStatus]);
      }
      if (DEAL_BANK === filterField) {
        const dealwithStatus = { 'details.owningBank.id': filter[filterField] };

        return listSoFar.concat([dealwithStatus]);
      }
      if (UKEF_DEAL_ID === filterField) {
        const dealwithStatus = { 'details.ukefDealId': { $regex: filter[filterField], $options: 'i' } };

        return listSoFar.concat([dealwithStatus]);
      }
      if (BANKSUPPLYCONTRACTID === filterField) {
        const dealwithSupplyID = { 'details.bankSupplyContractID': { $regex: filter[filterField], $options: 'i' } };
        return listSoFar.concat([dealwithSupplyID]);
      }
      if (SUBMISSION_SUPPLIER_NAME === filterField) {
        const dealwithSupplyID = { 'submissionDetails.supplier-name': { $regex: filter[filterField], $options: 'i' } };

        return listSoFar.concat([dealwithSupplyID]);
      }
      if (DEAL_SUBMISSION_TYPE === filterField) {
        const deal = { 'details.submissionType': filter[filterField] };

        return listSoFar.concat([deal]);
      }

      return listSoFar;
    }, []);


    if (!isSuperUser(user)) {
      listOfMongoQueryElements.push({ 'details.owningBank.id': { $eq: user.bank.id } });
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
