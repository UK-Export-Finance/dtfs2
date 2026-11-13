const mapPremiumTotals = (premiumSchedule) => {
  if (premiumSchedule) {
    return premiumSchedule
      .map((schedule) => schedule.income)
      .reduce((previous, current) => previous + current, 0)
      .toFixed(2);
  }

  return '0';
};

module.exports = mapPremiumTotals;
