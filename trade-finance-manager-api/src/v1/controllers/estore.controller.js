const api = require('../api');
const mapCreateEstore = require('../mappings/map-create-estore');

/**
 * This function creates eStore directories and files on Sharepoint.
 * Response is relayed using CRON jobs.
 * Function will return deal object with a blank `siteName`.
 * @param {Object} deal Deal object
 * @returns {Promise<object>} `tfm-deal` object with empty `siteName`
 */
const createEstoreSite = async (deal) => {
  const estoreDeal = deal;
  // 1. Creates eStore object by mapping through the deal
  const eStoreInput = mapCreateEstore(deal);
  // 2. Creates eStore directories and upload files
  await api.createEstoreSite(eStoreInput);

  return estoreDeal;
};

module.exports = {
  createEstoreSite,
};
