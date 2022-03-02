const mapCreateEstore = require('../mappings/map-create-estore');

const api = require('../api');

const createEstoreFolders = async (deal) => {
  const eStoreInput = mapCreateEstore(deal);

  const estore = await api.createEstoreFolders(eStoreInput);
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
