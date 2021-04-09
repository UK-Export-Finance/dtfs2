const mapPremiumSchedule = (schedule) => {
  const map = [];
  schedule.forEach((element) => {
    const item = {
      ...element,
      formattedIncome: element.income.toFixed(2),
    };
    map.push(item);
  });
  return map;
};
export default mapPremiumSchedule;
