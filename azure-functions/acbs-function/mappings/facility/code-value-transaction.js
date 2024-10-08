/*
  "lenderTypeCode"                    Lender type code, default to `100`
  "initialBundleStatusCode"           Initial bundle status code, default to `3`
  "facilityTransactionCodeValueCode"  Facility transaction code value code, default to `A
 */
const CONSTANTS = require('../../constants');

/**
 * Generates a facility code value transaction record with default values.
 *
 * This function performs the following operations:
 * 1. Sets default values for lender type code, initial bundle status code, and facility transaction code value code.
 * 2. Returns the generated facility code value transaction record.
 * 3. Handles any errors that occur during the process and logs them.
 *
 * @returns {Object|boolean} - An object containing the default values for the facility code value transaction record, or false if an error occurs.
 * @throws {Error} - Logs the error if any error occurs during the process.
 */
const codeValueTransaction = () => {
  try {
    return {
      lenderTypeCode: CONSTANTS.FACILITY.LENDER_TYPE.TYPE1,
      initialBundleStatusCode: CONSTANTS.FACILITY.BUNDLE_STATUS.STATUS3,
      facilityTransactionCodeValueCode: CONSTANTS.FACILITY.TRANSACTION_CODE.TYPEA,
    };
  } catch (error) {
    console.error('Unable to map facility code value transaction record. %o', error);
    return false;
  }
};

module.exports = codeValueTransaction;
