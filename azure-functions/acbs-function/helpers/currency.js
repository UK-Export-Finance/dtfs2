const stripCommas = (value) => String(value).replace(/,/g, '');
const to2Decimals = (value) => Number(Number(stripCommas(value)).toFixed(2));

module.exports = {
  to2Decimals,
  stripCommas,
};
