const mapCreateEstore = require('../mappings/map-create-estore');

const api = require('../api');

const createEstoreFolders = async (deal) => {
  const eStoreInput = mapCreateEstore(deal);

  // TODO: DTFS2-5099 Update eStore API calls to use cron jobs
  const estore2 = await api.createEstoreFolders(eStoreInput);
  console.log(estore2);
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
