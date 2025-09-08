/**
 * hasAdditionalFiltersStart
 * checks to return currentStartPage or startPage set to 0
 * checks if any filters are selected (apart from default filters)
 * If sorting object is populated but additional filters are selected, then returns 0 for startPage
 * If sorting is set or no additional filters, returns currentStartPage
 * @param {number} currentStartPage
 * @param {object} filters
 * @param {object} sort
 * @returns {number} startpage
 */
const computeSkipPosition = (currentStartPage, filters, sort) => {
  let startPage = currentStartPage;

  // has additional filters after bank.id match
  const hasAdditionalFilters = filters?.AND && filters?.AND[1]?.OR;

  /**
   * if has additional filters selected (apart from bank id match)
   * and not sort query is not selected
   * sets start to 0 so all deals / facilities are visible
   */
  if (hasAdditionalFilters && !Object.keys(sort).length) {
    startPage = 0;
  }

  return startPage;
};

module.exports = computeSkipPosition;
