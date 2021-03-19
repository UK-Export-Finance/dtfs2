const formattedNumber = (
  numb,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
) => {
  const formatted = Number(numb).toLocaleString('en', {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatted;
};

module.exports = {
  formattedNumber,
};
