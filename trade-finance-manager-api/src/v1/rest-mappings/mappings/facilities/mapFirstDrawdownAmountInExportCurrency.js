const CONSTANTS = require('../../../../constants');
const { formattedNumber } = require('../../../../utils/number');
const { stripCommas } = require('../../../../utils/string');

const mapFirstDrawdownAmountInExportCurrency = (facility) => {
  const { facilityProduct } = facility;

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN && facility.disbursementAmount) {
    const strippedDisbursementAmount = stripCommas(facility.disbursementAmount);

    const formattedDisbursementAmount = formattedNumber(strippedDisbursementAmount, 2, 2);

    return `${facility.currency.id} ${formattedDisbursementAmount}`;
  }

  return null;
};

module.exports = mapFirstDrawdownAmountInExportCurrency;
