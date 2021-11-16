const mapEligibility = (eligibility) => ({
  ...eligibility,
  criteria: eligibility.criteria.map((criterion) => ({
    id: criterion.id,
    answer: criterion.answer,
    text: criterion.description,
    textList: criterion.descriptionList,
  })),
});

module.exports = mapEligibility;
