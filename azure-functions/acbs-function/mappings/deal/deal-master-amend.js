/*
  dealIdentifier                  string    UKEF ID
  currency                        string    deal currency code
  dealValue                       float     Must be 2 decimal places
  guaranteeCommencementDate       date      yyyy-MM-dd - see algorithm below
  obligorPartyIdentifier          string    Supplier ACBS ID returned from ACBS Create Customer API call
  obligorName                     string    supplier name
  obligorIndustryClassification   string    ACBS Supplier industry classification - must be 4 characters e.g. 0104
  creditReviewRiskDate            date      YYYY-MM-DD
*/

/**
 * DMR amendment mapping function.
 * @param {Object} fmr Facility Master Record
 * @param {Object} amendments Facility amendment(s)
 * @param {Object} deal Deal object
 * @returns {Object} Facility Master Record (FMR) amended
 */
const dealMasterAmend = (amendments) => {
  try {
    // Construct base record
    let record = {};
    const { amendment } = amendments;

    // Construct amendment record
    if (amendment) {
      const { amount } = amendment;

      // UKEF Exposure
      if (amount) {
        record = {
          dealValue: amount,
        };
      }
    }

    // Return amended FMR
    return record;
  } catch (error) {
    console.error('Unable to map deal master amendment record %o', error);
    return {};
  }
};

module.exports = dealMasterAmend;
