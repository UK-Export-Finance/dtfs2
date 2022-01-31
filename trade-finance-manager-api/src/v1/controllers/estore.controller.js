/* eslint-disable no-unused-vars */
const mapCreateEstore = require('../mappings/map-create-estore');

const api = require('../api');

const createEstoreFolders = async (deal) => {
  const eStoreInput = mapCreateEstore(deal);

  // TODO: DTFS2-5099 Update eStore API calls to use cron jobs
  // const estore = await api.createEstoreFolders(eStoreInput);
  const estore = {};
  return {
    ...deal,
    tfm: {
      ...deal.tfm,
      estore,
    },
  };
};

module.exports = {
  createEstoreFolders,
};
