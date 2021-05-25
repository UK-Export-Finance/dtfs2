const mapPremiumSchedule = (schedule) => {
  const mapped = [];

  if (schedule) {
    schedule.forEach((item) => {
      mapped.push({
        ...item,
        formattedIncome: item.income.toFixed(2),
      });
    });
  }

  return mapped;
};

module.exports = mapPremiumSchedule;
