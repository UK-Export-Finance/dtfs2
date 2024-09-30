const CONSTANTS = require('../../constants');
const { now } = require('../../helpers/date');

const { FACILITY } = CONSTANTS;

const facilityFixedFeeAmend = (amendments) => {
  try {
    const records = [];
    const { amendment } = amendments;
    const { amount } = amendment;

    // 1. UKEF Exposure
    if (amount) {
      const effectiveDate = now();
      const record = {
        partyIdentifier: '',
        period: '01',
        effectiveDate,
        amountAmendment: amount,
      };

      // 1.1. Lender type `100`
      records.push({
        ...record,
        lenderTypeCode: FACILITY.LENDER_TYPE.TYPE1,
      });

      // 1.2. Lender type `500`
      records.push({
        ...record,
        lenderTypeCode: FACILITY.LENDER_TYPE.TYPE5,
      });
    }

    return records;
  } catch (error) {
    console.error('Unable to map facility fixed fee amendment record %o', error);
    return {};
  }
};

module.exports = facilityFixedFeeAmend;
