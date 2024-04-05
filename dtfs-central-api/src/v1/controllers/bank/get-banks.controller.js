const { getAllBanks } = require('../../../repositories/banks-repo');

/**
 * @typedef {import('@ukef/dtfs2-common').Bank} Bank
 */

/**
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response<Bank[]>} res - Express response object
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
