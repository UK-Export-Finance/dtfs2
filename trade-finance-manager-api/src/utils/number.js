const formattedNumber = (numb, minimumFractionDigits = 2, maximumFractionDigits = 2) => {
  if (!Number(numb)) {
    return numb;
  }

  const formatted = Number(numb).toLocaleString('en', {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatted;
};

module.exports = {
  formattedNumber,
};
