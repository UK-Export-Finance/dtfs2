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
 * Fetches all banks and filters for visible in TFM utilisation reports.
 * @param {import('express').Request<{ submissionMonth: string }>} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
const getBanksVisibleInTfmUtilisationReports = async (req, res) => {
  try {
    const banks = await api.getAllBanks();
    const banksVisibleInTfm = banks.filter((bank) => bank.isVisibleInTfmUtilisationReports);
    res.status(200).send(banksVisibleInTfm);
  } catch (error) {
    const errorMessage = 'Failed to get banks visible in TFM';
    console.error(errorMessage, error);
    res.status(error.response?.status ?? 500).send(errorMessage);
  }
};
exports.getBanksVisibleInTfmUtilisationReports = getBanksVisibleInTfmUtilisationReports;
