const db = require('../../drivers/db-client');
const api = require('../api');

const findOneBank = async (id) => {
  if (typeof id !== 'string') {
    throw new Error('Invalid Bank Id');
  }

  const collection = await db.getCollection('banks');

  const bank = await collection.findOne({ id: { $eq: id } });
  return bank;
};
exports.findOneBank = findOneBank;

/**
 * Fetches all banks
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
const getAllBanks = async (req, res) => {
  try {
    const banks = await api.getAllBanks();
    res.status(200).send(banks);
  } catch (error) {
    const errorMessage = 'Failed to get banks';
    console.error(errorMessage, error);
    res.status(error.response?.status ?? 500).send(errorMessage);
  }
};
exports.getAllBanks = getAllBanks;
