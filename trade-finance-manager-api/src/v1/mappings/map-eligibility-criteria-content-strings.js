const CONTENT_STRINGS = require('../content-strings');

const mapEligibilityCriteriaContentStrings = (eligibility, dealType) => {
  // NOTE: BSS and GEF have different content strings.
  const mappedCriteria = eligibility.criteria;
  const contentStrings = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[dealType];

  const versionContentStrings = contentStrings[Number(eligibility.version)];

  return mappedCriteria.map((criterion) => {
    const mappedCriterion = criterion;
    const id = Number(criterion.id);

    // Ensure Criterion exists in applicable EC
    if (id in versionContentStrings) {
      const contentObj = versionContentStrings[id];
      mappedCriterion.text = contentObj.text;
      mappedCriterion.textList = contentObj.textList;
    }

    return mappedCriterion;
  });
};

module.exports = mapEligibilityCriteriaContentStrings;
