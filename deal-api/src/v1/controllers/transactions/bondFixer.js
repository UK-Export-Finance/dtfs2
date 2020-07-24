const GRAPHQL_FILTER_BY_TRANSACTION_TYPE = 'transaction.transactionType';
const BANKFACILITYID = 'transaction.bankFacilityId';
const UKEFFACILITYID = 'transaction.ukefFacilityId';
// the rules
// this means that our filter is going to:
// 1) consider transaction.transactionStage as 'special' and not to be handled by mongo
// 2) understand that when it's asked to do things wih transaction.transactionStage it should look at bond.bondStage
// 3) understand that when asked to filter on 'unissued_conditional' that means 'Unissued' in the case of bonds
const bondFilterMappings = {
  'transaction.transactionStage': {
    bondStage: {
      unissued_conditional: 'Unissued',
      issued_unconditional: 'Issued',
    },
  },
};

//------
// helper methods for getting the things we need out of the rules ^^
//------

// .. so we can easily strip these out of our filters before we go to mongo...
const listOfGraphQlFiltersToTreatSpeciallyForBonds = () => Object.keys(bondFilterMappings);

// turn the generic fieldname that graphQL acknowledges into the equivalent fieldname in a bond object.
// eg. "transaction.transactionStage" -> "bondStage"
const bondMapField = (fieldToMap) => {
  if (bondFilterMappings[fieldToMap]) {
    return Object.keys(bondFilterMappings[fieldToMap])[0];
  }
  return null;
};

// sorry, i know this is a stupid signature and shows that my OO is all over the shop, but in a rush...
// i think the problem is that i'm asking the question a bit upsidedown.. but..
// get the value the filter should really be asking for..
//  gives the value our filter is actually going to match against, rather than the generic term in graphQL
//  eg. "unissued_conditional" -> "Unissued"
const bondMapFilterValue = (graphQlField, bondField, valueAsProvidedInFilter) => {
  const mapping = bondFilterMappings[graphQlField][bondField];
  return mapping[valueAsProvidedInFilter];
};


// the actual thing we use in transaction.controller
//  calling this a constructor because if it looks like a duck and quacks like a duck...
//  it returns a set of methods that do the things we need to do in order to do the filtering,
//  in terms that are relevant at controller level...
//   ie. the filter object that has been passed into the controller
//       + a deal that we want to return 0+ bonds from, so we can serve them up via the API
// and, based on 'stuff that is special about bonds' we need to be able to:
// 1) list all the fields that should be stripped out of the graphQL filters before we try to query mongo
//        - generically the case for any filter we're trying to handle manually
// 2) make a true/false statement on whether we're interested in bonds or not
//        - special case for "transaction.transaction_type"; we might be able to skip all this and return []
// 3) provide an array of "all bonds that match the filter criteria"
//        - harder than it sounds. the generic case for things that obey 'the rules' at the top of the file...
const constructor = (graphQLFilters) => {
  // we don't want mongo to be thinking about 'transaction_type', or any of the fields in 'the rules'
  const listOfGraphQLFiltersThatAreNotMeantForMongo = () => [
    GRAPHQL_FILTER_BY_TRANSACTION_TYPE,
  ].concat(listOfGraphQlFiltersToTreatSpeciallyForBonds());

  // return bonds if we've made no clear statement about transaction-type,
  //    or if we've specifically requested to filter on bonds.
  const shouldReturnBonds = () => {
    const transactionTypeFilters = ['bond', 'all'];
    const tryingToFilterOnTxType = !!graphQLFilters[GRAPHQL_FILTER_BY_TRANSACTION_TYPE];
    if (!tryingToFilterOnTxType) {
      return true;
    }
    const valueWeWantToFilterOn = graphQLFilters[GRAPHQL_FILTER_BY_TRANSACTION_TYPE];
    const yesShowMeBonds = transactionTypeFilters.includes(valueWeWantToFilterOn);
    return yesShowMeBonds;
  };

  // apply 'the rules' for a given deal...
  const filteredBondsFor = (deal) => {
    // get the list of bonds in the deal, defaulting to an empty array so I don't have to think about edge cases
    const bonds = deal.bondTransactions && deal.bondTransactions.items ? deal.bondTransactions.items : [];

    // loop through the list of bonds (ie do nothing if there are no bonds)
    return bonds.filter((bond) =>
    // we want to return a 'false' if this bond is being filtered out by anything.

    // using Array.reduce as a cheap and cheesy way to loop over 'the list of special-case filters'.
    // at the end of this block you'll see we're starting with an accumulator of "true"
    //  we use this as we loop through to determine whether there's any maths worth doing..
    //    if a previous iteration through the loop has returned 'false'
    //    (ie. this item should not be returned in our filter)
    //    we already know we're filtering this out and don't need to look any further.

      // "get the list of graphQL filters we need to consider"
      //   "loop over it giving me each graphQL filter in turn"
      //   "keep track of whether we're still intending to show this bond or not"
      listOfGraphQlFiltersToTreatSpeciallyForBonds().reduce((stillShowingBond, graphQLFilter) => {
        // logic that determines whether this particular graphQL filter should reject this bond
        // returns true if the bond should be filtered out based on the current graphQL filter we're looking at
        // returns false if the bond doesn't need filtering on that basis
        const shouldFilterThisBondOutBasedOnThisFilter = () => {
          const valueAsProvidedInFilter = graphQLFilters[graphQLFilter];
          // if the filters we're applying dont include this potential filter: we're not filtering it out..
          if (!valueAsProvidedInFilter) {
            return false;
          }

          // get the specific fieldname we care about for a bond, given the 'generic' fieldname from graphQL
          const bondField = bondMapField(graphQLFilter);

          // work out what the filter really means to be matching against.
          //  (for what it's worth i think this is where my OO goes upsidedown..
          //   think this might be easier if I mapped "the value in the bond"
          //   to "the value that may or may not match the filter query"
          //   but i'm in a rush and i'm in too deep with no tests... so... i'm committing what works...)
          const filterValue = bondMapFilterValue(graphQLFilter, bondField, valueAsProvidedInFilter);

          // get the value out of the bond
          const valueInFacility = bond[bondField];

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
        return stillShowingBond && !shouldFilterThisBondOutBasedOnThisFilter();
      }, true)).filter((bondThatMightNotMatchAFilter) => {
      // ugly. because our mongo query gave us 'deals that contain a bond with bankrefnum=xx'
      //  we still have other transactions from that deal to filter out..

      if (graphQLFilters[BANKFACILITYID]) {
        const regex = new RegExp(`^${graphQLFilters[BANKFACILITYID]}`);
        return bondThatMightNotMatchAFilter.uniqueIdentificationNumber.match(regex);
      }

      if (graphQLFilters[UKEFFACILITYID]) {
        const regex = new RegExp(`^${graphQLFilters[UKEFFACILITYID]}`);
        return bondThatMightNotMatchAFilter.ukefFacilityID.match(regex);
      }

      return true;
    }).map((bond) => ({
      // - once we've filtered out things we shouldn't be thinking about
      //  -> map whatever's still left into the generic schema that graphQL is expecting..

      deal_id: deal._id, // eslint-disable-line no-underscore-dangle
      deal_status: deal.details.status,
      transaction_id: bond._id, // eslint-disable-line no-underscore-dangle
      bankFacilityId: bond.uniqueIdentificationNumber,
      ukefFacilityId: bond.ukefFacilityID,
      transactionType: 'bond',
      facilityValue: bond.facilityValue,
      transactionStage: bond.bondStage,
      issuedDate: '//TODO',
      maker: deal.details.maker ? `${deal.details.maker.firstname || ''} ${deal.details.maker.surname || ''}` : '',
      checker: deal.details.checker ? `${deal.details.checker.firstname || ''} ${deal.details.checker.surname || ''}` : '',
    }));
  };

  return {
    listOfGraphQLFiltersThatAreNotMeantForMongo,
    shouldReturnBonds,
    filteredBondsFor,
  };
};

module.exports = constructor;
