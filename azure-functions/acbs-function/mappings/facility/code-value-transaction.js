/*
  "lenderTypeCode"                    Lender type code, default to `100`
  "initialBundleStatusCode"           Initial bundle status code, default to `3`
  "facilityTransactionCodeValueCode"  Facility transaction code value code, default to `A
 */
const CONSTANTS = require('../../constants');

const codeValueTransaction = () => ({
  lenderTypeCode: CONSTANTS.FACILITY.LENDER_TYPE.TYPE1,
  initialBundleStatusCode: CONSTANTS.FACILITY.BUNDLE_STATUS.STATUS3,
  facilityTransactionCodeValueCode: CONSTANTS.FACILITY.TRANSACTION_CODE.TYPEA,
});

module.exports = codeValueTransaction;
