const CONTENT_STRINGS = require('../content-strings');

const mapEligibilityCriteriaContentStrings = (criteria, dealType) => {
  // NOTE: BSS and GEF have different content strings.
  const mappedCriteria = criteria;
  const contentStrings = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[dealType];

  return mappedCriteria.map((criterion) => {
    const mappedCriterion = criterion;

    const contentObj = contentStrings[String(criterion.id)];

    mappedCriterion.text = contentObj.text;
    mappedCriterion.textList = contentObj.textList;

    return mappedCriterion;
  });
};

module.exports = mapEligibilityCriteriaContentStrings;
