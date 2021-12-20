const getBaseCurrency = (facilities) => facilities.reduce((currency, facility) => {
  const code = facility.facilitySnapshot.currency.id === currency ? currency : false;
  return code;
}, facilities[0].facilitySnapshot.currency.id);

module.exports = getBaseCurrency;
