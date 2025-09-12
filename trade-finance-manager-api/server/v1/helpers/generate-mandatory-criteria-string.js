const { generateMandatoryCriteria } = require('@ukef/dtfs2-common');
const api = require('../api');

/**
 * Generates a mandatory criteria string based on the provided mandatory version ID.
 *
 * @param {string} mandatoryVersionId - The ID of the mandatory criteria version to fetch.
 * @returns {Promise<string>} A promise that resolves to the generated mandatory criteria string.
 */
const generateMandatoryCriteriaString = async (mandatoryVersionId) => {
  // Fetch criteria by version ID
  const { criteria } = await api.getGefMandatoryCriteriaByVersion(mandatoryVersionId);
  // Generate mandatory criteria as text
  return generateMandatoryCriteria(criteria);
};

module.exports = { generateMandatoryCriteriaString };
