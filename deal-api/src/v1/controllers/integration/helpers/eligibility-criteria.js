const isCriteriaSet = (eligibility, id) => {
  if (!eligibility.criteria) return false;
  const { answer } = eligibility.criteria.find((c) => c.id === id);
  return typeof answer === 'undefined' ? '' : answer;
};

module.exports = {
  isCriteriaSet,
};
