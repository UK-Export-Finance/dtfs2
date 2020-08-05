const { isSuperUser } = require('../../users/checks');
const bondFixer = require('./bondFixer');
const loanFixer = require('./loanFixer');

const BANKFACILITYID = 'transaction.bankFacilityId';
const UKEFFACILITYID = 'transaction.ukefFacilityId';
const DEAL_CREATED = 'transaction.deal_created';
const DEAL_ID = '_id';
const DEAL_STATUS = 'details.status';
const TRANSACTION_STATUS = 'transaction.transactionStage';

const constructor = (user, filters) => {
  const bondFix = bondFixer(filters);
  const loanFix = loanFixer(filters);

  const transactionsQuery = () => {
    const listOfMongoQueryElements = filters.reduce((listSoFar, filter) => {
      const filterField = Object.keys(filter)[0];// only expecting one entry/block
      console.log(filterField);
      console.log(filter[filterField]);
      if (BANKFACILITYID === filterField) {
        const bondMatchesOnUniqueIdNum = { 'bondTransactions.items': { $elemMatch: { uniqueIdentificationNumber: new RegExp(`^${filter[filterField]}`) } } };
        const loanMatchesOnBankRefNum = { 'loanTransactions.items': { $elemMatch: { bankReferenceNumber: new RegExp(`^${filter[filterField]}`) } } };
        return listSoFar.concat([{ $or: [bondMatchesOnUniqueIdNum, loanMatchesOnBankRefNum] }]);
      }

      if (UKEFFACILITYID === filterField) {
        const bondMatchesOnUniqueIdNum = { 'bondTransactions.items': { $elemMatch: { ukefFacilityID: new RegExp(`^${filter[filterField]}`) } } };
        const loanMatchesOnBankRefNum = { 'loanTransactions.items': { $elemMatch: { ukefFacilityID: new RegExp(`^${filter[filterField]}`) } } };

        return listSoFar.concat([{ $or: [bondMatchesOnUniqueIdNum, loanMatchesOnBankRefNum] }]);
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
      /* 
      if (TRANSACTION_STATUS === filterField) {
        const bondMatchesOnStatus = { 'bondTransactions.items': { $elemMatch: { facilityStage: 'Unconditional' } } };
        const loanMatchesOnStatus = { 'loanTransactions.items': { $elemMatch: { facilityStage: 'Unissued' } } };
        
        return listSoFar.concat([{ $or: [bondMatchesOnStatus, loanMatchesOnStatus] }]);
      }
      */

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
