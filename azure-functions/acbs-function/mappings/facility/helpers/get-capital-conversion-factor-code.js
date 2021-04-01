/*
 "capitalConversionFactorCode":    This field is required for GEF. Cash facility has 8, Contingent facility has 9.
*/
const getCapitalConversionFactorCode = (cashFacility) => (cashFacility ? 8 : 9);
module.exports = getCapitalConversionFactorCode;
