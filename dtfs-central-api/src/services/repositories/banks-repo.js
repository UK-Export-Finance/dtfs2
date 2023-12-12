const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants');

/**
 * @typedef {import('../../../types/db-models/banks').Bank} Bank
 */

/**
 * @return {Promise<Bank[]>}
 */
const getAllBanks = async () => {
  const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
  return await banksCollection.find().toArray();
};

/**
 * @param {string} bankId - The id of the bank
 * @returns {Promise<string | undefined>}
 */
const getBankNameById = async (bankId) => {
  const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
  const bankName = await banksCollection.findOne({ id: bankId }).then((document) => document?.name);
  return bankName;
};

module.exports = {
  getAllBanks,
  getBankNameById,
};
