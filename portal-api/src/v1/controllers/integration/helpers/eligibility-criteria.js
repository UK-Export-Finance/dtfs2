const isCriteriaSet = (eligibility, id) => {
  if (!eligibility.criteria) return false;

  const ec = eligibility.criteria.find((c) => c.id === id);
  return ec && typeof ec.answer !== 'undefined' ? ec.answer : false;
};

module.exports = {
  isCriteriaSet,
};
