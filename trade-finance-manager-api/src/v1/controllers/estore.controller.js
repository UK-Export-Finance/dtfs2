const mapCreateEstore = require('../mappings/map-create-estore');

const api = require('../api');

const createEstoreFolders = async (deal) => {
  const eStoreInput = mapCreateEstore(deal);
  const migrationScript = Boolean(process.env.DATA_MIGRATION_SCRIPT);
  const siteName = await api.getEstoreFolders(eStoreInput);

  const tfmDeal = {
    ...deal,
    tfm: {
      ...deal.tfm,
      estore: {},
    },
  };

  if (migrationScript && siteName) {
    tfmDeal.tfm.estore = {
      siteName,
    };
  } else {
    await api.createEstoreFolders(eStoreInput);
  }

  return tfmDeal;
};

module.exports = {
  createEstoreFolders,
};
