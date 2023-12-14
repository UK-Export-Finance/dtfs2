const mapPremiumTotals = (premiumSchedule) => {
  if (premiumSchedule) {
    return premiumSchedule
      .map((s) => s.income)
      .reduce((a, b) => a + b, 0)
      .toFixed(2);
  }

  return '0';
};

module.exports = mapPremiumTotals;
