const GRAPHQL_FILTER_BY_TRANSACTION_TYPE = 'transaction.transactionType';
const BANKFACILITYID = 'transaction.bankFacilityId';

// the rules
// this means that our filter is going to:
// 1) consider transaction.transactionStage as 'special' and not to be handled by mongo
// 2) understand that when it's asked to do things wih transaction.transactionStage it should look at loan.loanStage
// 3) understand that when asked to filter on 'unissued_conditional' that means 'Conditional' in the case of loans
const loanFilterMappings = {
  'transaction.transactionStage': {
    loanStage: {
      unissued_conditional: 'Conditional',
      issued_unconditional: 'Unconditional',
    },
  },
};

//------
// helper methods for getting the things we need out of the rules ^^
//------

// .. so we can easily strip these out of our filters before we go to mongo...
const listOfGraphQlFiltersToTreatSpeciallyForLoans = () => Object.keys(loanFilterMappings);

// turn the generic fieldname that graphQL acknowledges into the equivalent fieldname in a loan object.
// eg. "transaction.transactionStage" -> "loanStage"
const loanMapField = (fieldToMap) => {
  if (loanFilterMappings[fieldToMap]) {
    return Object.keys(loanFilterMappings[fieldToMap])[0];
  }
  return null;
};

// sorry, i know this is a stupid signature and shows that my OO is all over the shop, but in a rush...
// i think the problem is that i'm asking the question a bit upsidedown.. but..
// get the value the filter should really be asking for..
//  gives the value our filter is actually going to match against, rather than the generic term in graphQL
//  eg. "unissued_conditional" -> "Conditional"
const loanMapFilterValue = (graphQlField, loanField, valueAsProvidedInFilter) => {
  const mapping = loanFilterMappings[graphQlField][loanField];
  return mapping[valueAsProvidedInFilter];
};


// the actual thing we use in transaction.controller
//  calling this a constructor because if it looks like a duck and quacks like a duck...
//  it returns a set of methods that do the things we need to do in order to do the filtering,
//  in terms that are relevant at controller level...
//   ie. the filter object that has been passed into the controller
//       + a deal that we want to return 0+ loans from, so we can serve them up via the API
// and, based on 'stuff that is special about loans' we need to be able to:
// 1) list all the fields that should be stripped out of the graphQL filters before we try to query mongo
//        - generically the case for any filter we're trying to handle manually
// 2) make a true/false statement on whether we're interested in loans or not
//        - special case for "transaction.transaction_type"; we might be able to skip all this and return []
// 3) provide an array of "all loans that match the filter criteria"
//        - harder than it sounds. the generic case for things that obey 'the rules' at the top of the file...
const constructor = (graphQLFilters) => {
  // we don't want mongo to be thinking about 'transaction_type', or any of the fields in 'the rules'
  const listOfGraphQLFiltersThatAreNotMeantForMongo = () => [
    GRAPHQL_FILTER_BY_TRANSACTION_TYPE,
  ].concat(listOfGraphQlFiltersToTreatSpeciallyForLoans());

  // return loans if we've made no clear statement about transaction-type,
  //    or if we've specifically requested to filter on loans.
  const shouldReturnLoans = () => {
    const transactionTypeFilters = ['loan', 'all'];
    const tryingToFilterOnTxType = !!graphQLFilters[GRAPHQL_FILTER_BY_TRANSACTION_TYPE];
    if (!tryingToFilterOnTxType) {
      return true;
    }
    const valueWeWantToFilterOn = graphQLFilters[GRAPHQL_FILTER_BY_TRANSACTION_TYPE];
    const yesShowMeLoans = transactionTypeFilters.includes(valueWeWantToFilterOn);
    return yesShowMeLoans;
  };

  // apply 'the rules' for a given deal...
  const filteredLoansFor = (deal) => {
    // get the list of loans in the deal, defaulting to an empty array so I don't have to think about edge cases
    const loans = deal.loanTransactions && deal.loanTransactions.items ? deal.loanTransactions.items : [];

    // loop through the list of loans (ie do nothing if there are no loans)
    return loans.filter((loan) =>
    // we want to return a 'false' if this loan is being filtered out by anything.

    // using Array.reduce as a cheap and cheesy way to loop over 'the list of special-case filters'.
    // at the end of this block you'll see we're starting with an accumulator of "true"
    //  we use this as we loop through to determine whether there's any maths worth doing..
    //    if a previous iteration through the loop has returned 'false'
    //    (ie. this item should not be returned in our filter)
    //    we already know we're filtering this out and don't need to look any further.

    // "get the list of graphQL filters we need to consider"
    //   "loop over it giving me each graphQL filter in turn"
    //   "keep track of whether we're still intending to show this loan or not"
      listOfGraphQlFiltersToTreatSpeciallyForLoans().reduce((stillShowingLoan, graphQLFilter) => {
      // logic that determines whether this particular graphQL filter should reject this loan
      // returns true if the loan should be filtered out based on the current graphQL filter we're looking at
      // returns false if the loan doesn't need filtering on that basis
        const shouldFilterThisLoanOutBasedOnThisFilter = () => {
          const valueAsProvidedInFilter = graphQLFilters[graphQLFilter];
          // if the filters we're applying dont include this potential filter: we're not filtering it out..
          if (!valueAsProvidedInFilter) {
            return false;
          }

          // get the specific fieldname we care about for a loan, given the 'generic' fieldname from graphQL
          const loanField = loanMapField(graphQLFilter);

          // work out what the filter really means to be matching against.
          //  (for what it's worth i think this is where my OO goes upsidedown..
          //   think this might be easier if I mapped "the value in the loan"
          //   to "the value that may or may not match the filter query"
          //   but i'm in a rush and i'm in too deep with no tests... so... i'm committing what works...)
          const filterValue = loanMapFilterValue(graphQLFilter, loanField, valueAsProvidedInFilter);

          // get the value out of the bond
          const valueInFacility = loan[loanField];

          // filter out if the filter is legit and the values don't equal
          //  TODO... at some point we're going to receive a filter that is more advanced than 'eq'...
          const filterOut = (filterValue && filterValue !== valueInFacility);
          return filterOut;
        };

        // the actual loop...
        //  if we've not yet been over something that has filtered this bond out,
        //  ->check to see if this 'graphQLFilter' provides a reason to filter the bond out
        // if we -have- already procced something that wants to filter this bond out
        //  ->nothing to do here.
        return stillShowingLoan && !shouldFilterThisLoanOutBasedOnThisFilter();
      }, true)).filter((loanThatMightNotMatchAFilter) => {
      // ugly. because our mongo query gave us 'deals that contain a bond with bankrefnum=xx'
      //  we still have other transactions from that deal to filter out..
      if (graphQLFilters[BANKFACILITYID]
              && loanThatMightNotMatchAFilter.bankReferenceNumber !== graphQLFilters[BANKFACILITYID]) {
        return false;
      }
      return true;
    }).map((loan) => ({
      // - once we've filtered out things we shouldn't be thinking about
      //  -> map whatever's still left into the generic schema that graphQL is expecting..
      deal_id: deal._id, // eslint-disable-line no-underscore-dangle
      deal_status: deal.details.status,
      transaction_id: loan._id, // eslint-disable-line no-underscore-dangle
      bankFacilityId: loan.bankReferenceNumber,
      ukefFacilityId: '//TODO',
      transactionType: 'loan',
      facilityValue: loan.facilityValue,
      transactionStage: loan.facilityStage,
      issuedDate: '//TODO',
      maker: deal.details.maker ? `${deal.details.maker.firstname || ''} ${deal.details.maker.surname || ''}` : '',
      checker: deal.details.checker ? `${deal.details.checker.firstname || ''} ${deal.details.checker.surname || ''}` : '',
    }));
  };

  return {
    listOfGraphQLFiltersThatAreNotMeantForMongo,
    shouldReturnLoans,
    filteredLoansFor,
  };
};

module.exports = constructor;
