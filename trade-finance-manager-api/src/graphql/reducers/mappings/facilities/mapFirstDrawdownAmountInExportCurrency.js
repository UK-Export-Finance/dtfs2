const CONSTANTS = require('../../../../constants');
const { formattedNumber } = require('../../../../utils/number');

const mapFirstDrawdownAmountInExportCurrency = (facility) => {
  const { facilityProduct } = facility;

  if (facilityProduct.code === CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN) {
    const formattedDisbursementAmount = formattedNumber(facility.disbursementAmount, 4, 4);

    return `${facility.currency} ${formattedDisbursementAmount}`;
  }

  return null;
};

module.exports = mapFirstDrawdownAmountInExportCurrency;
