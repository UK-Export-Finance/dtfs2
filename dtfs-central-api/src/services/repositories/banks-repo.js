const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants');

/**
 * @typedef {import('../../types/db/banks').BanksCollectionDocument} BanksCollectionDocument
 */

/**
 * @return {Promise<BanksCollectionDocument[]>}
 */
const getAllBanks = async () => {
  const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
  return await banksCollection.find().toArray();
}

module.exports = {
  getAllBanks,
};
