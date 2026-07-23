/**
 * Helper function to get industry sector by their respective codes from the industry sectors data.
 * @param {Array} industrySectors - The array of industry sectors data to map the submitted codes against.
 * @param {string} id - The code of the industry sector or industry class to find.
 * @returns {Object} Industry sector object containing code and name, or undefined if not found.
 */
const getIndustrySectorById = (industrySectors, id) => industrySectors.find((sector) => sector.code === id);

/**
 * Helper function to get industry class by their respective codes from the industry sector classes data.
 * @param {Array} industrySectorClasses - The array of industry sector classes data to map the submitted codes against.
 * @param {string} id - The code of the industry class to find.
 * @returns {Object} Industry class object containing code and name, or undefined if not found.
 */
const getIndustryClassById = (industrySectorClasses, id) => industrySectorClasses.find((c) => c.code === id);

module.exports = {
  getIndustrySectorById,
  getIndustryClassById,
};
