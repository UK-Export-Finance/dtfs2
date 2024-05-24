const api = require('../../api');

/**
 * Fetches a summary of utilisation report reconciliation progress for specified submission month for all banks.
 * @param {import('express').Request<{ submissionMonth: string }>} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
const getUtilisationReportsReconciliationSummary = async (req, res) => {
  try {
    const { submissionMonth } = req.params;
    const summary = await api.getUtilisationReportsReconciliationSummary(submissionMonth);
    res.status(200).send(summary);
  } catch (error) {
    const errorMessage = 'Failed to get utilisation reports reconciliation summary';
    console.error(errorMessage, error);
    res.status(error.response?.status ?? 500).send(errorMessage);
  }
};

module.exports = { getUtilisationReportsReconciliationSummary };
