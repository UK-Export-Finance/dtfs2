const { formattedNumber } = require('@ukef/dtfs2-common');

const mapGuaranteeFeePayableToUkef = (guaranteeFee) => `${formattedNumber(guaranteeFee, 4, 4)}%`;

module.exports = mapGuaranteeFeePayableToUkef;
