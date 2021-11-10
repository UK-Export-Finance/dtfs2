const getBaseCurrency = (facilities) => facilities.reduce((currency, facility) => {
  const code = facility.facilitySnapshot.currency === currency ? currency : false;
  return code;
}, facilities[0].facilitySnapshot.currency);

module.exports = getBaseCurrency;
