// converts string to number percentage - eg '70%' to 70
const percentageToNumber = (percentage) => {
  if (typeof percentage === 'string' && percentage) {
    const number = percentage.replace(/%/g, '');
    return Number(number);
  }
  return percentage;
};

module.exports = percentageToNumber;
