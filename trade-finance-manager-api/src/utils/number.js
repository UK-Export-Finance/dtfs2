const formattedNumber = (numb, minimumFractionDigits = 2) => Number(numb).toLocaleString('en', { minimumFractionDigits });

module.exports = {
  formattedNumber,
};
