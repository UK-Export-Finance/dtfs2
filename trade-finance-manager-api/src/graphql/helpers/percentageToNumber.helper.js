// converts string to number percentage - eg '70%' to 70
const percentageToNumber = (percentage) => {
  if (percentage && typeof percentage === 'string') {
    const number = percentage.replace(/%/g, '');
    return Number(number);
  }
  return percentage;
};

module.exports = percentageToNumber;
