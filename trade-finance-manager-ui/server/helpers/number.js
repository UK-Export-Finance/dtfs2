const increment = (count) => {
  let result = count;

  // eslint-disable-next-line no-plusplus
  return ++result;
};

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

module.exports = { increment, formattedNumber };
