const { getAllBanks } = require('../../../services/repositories/banks-repo');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');

/**
 * @typedef {import('../../../types/utilisation-reports').UtilisationReportReconciliationSummaryItem} ResponseBody
 */

/**
 * @param {import('../../../types/db/banks').BanksCollectionDocument[]} banks
 * @param {string} submissionMonth
 * @return {ResponseBody[]}
 */
// eslint-disable-next-line no-unused-vars
const generateResponseBody = (banks, submissionMonth) =>
  // TODO FN-1043 - calculate real response values
  banks.map((bank) => ({
    bank: {
      id: bank.id,
      name: bank.name,
    },
    statusCode: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
  }));

/**
 * @param {import('express').Request<{ submissionMonth: string }>} req - Express request object
 * @param {import('express').Response<ResponseBody>} res - Express response object
 */
const getUtilisationReportsReconciliationSummary = async (req, res) => {
  try {
    const { submissionMonth } = req.params;

    const banks = await getAllBanks();
    const responseBody = generateResponseBody(banks, submissionMonth);

    res.status(200).send(responseBody);
  } catch (error) {
    const errorMessage = 'Failed to get utilisation reports reconciliation summary';
    console.error(errorMessage, error);
    res.status(500).send(errorMessage);
  }
};

module.exports = {
  getUtilisationReportsReconciliationSummary,
};
