const hasAdditionalFiltersStart = (currentStartPage, filters, sort) => {
  let startPage = currentStartPage;

  // has additional filters after bank.id match
  const hasAdditionalFilters = filters?.AND && filters?.AND[1]?.OR;

  /**
     * if has additional filters selected (apart from bank id match)
     * and not sort query is not selected
     * sets start to 0 so all facilities show
     */
  if (hasAdditionalFilters && !Object.keys(sort).length) {
    // eslint-disable-next-line no-param-reassign
    startPage = 0;
  }

  return startPage;
};

module.exports = hasAdditionalFiltersStart;
