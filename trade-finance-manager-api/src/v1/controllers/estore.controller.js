const api = require('../api');
const mapCreateEstore = require('../mappings/map-create-estore');

/**
 * This function creates eStore directories and files on Sharepoint.
 * Response is relayed using CRON jobs.
 * Function will return deal object with a blank `siteName`.
 * @param {Object} deal Deal object
 * @returns {Object} `tfm-deal` object with empty `siteName`
 */
const createEstoreFolders = async (deal) => {
  const estoreDeal = deal;
  // 1. Creates eStore object by mapping through the deal
  const eStoreInput = mapCreateEstore(deal);
  // 2. Creates eStore directories and upload files
  await api.createEstoreFolders(eStoreInput);
  // 3. Add an empty `siteName`
  estoreDeal.tfm.estore.siteName = '';

  return estoreDeal;
};

module.exports = {
  createEstoreFolders,
};
