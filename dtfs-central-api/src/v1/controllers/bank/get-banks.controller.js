const { getAllBanks } = require('../../../services/repositories/banks-repo');

/**
 * @typedef {import('../../../types/db/banks').BanksCollectionDocument} BanksCollectionDocument
 */

/**
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response<BanksCollectionDocument[]>} res - Express response object
 */
exports.getAllBanksGet = async (req, res) => {
  try {
    const banks = await getAllBanks();
    res.status(200).send(banks);
  } catch (error) {
    const errorMessage = 'Failed to get all banks';
    console.error(errorMessage, error);
    res.status(500).send(errorMessage);
  }
};
