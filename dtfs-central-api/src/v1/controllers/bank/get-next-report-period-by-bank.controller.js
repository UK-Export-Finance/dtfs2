const { getNextReportPeriodForBankSchedule } = require('@ukef/dtfs2-common');
const { findOneBank } = require('./get-bank.controller');

exports.getNextReportPeriodByBankId = async (req, res) => {
  try {
    const bank = await findOneBank(req.params.bankId);

    if (bank.utilisationReportPeriodSchedule) {
      const { utilisationReportPeriodSchedule } = bank;
      const nextReportPeriod = getNextReportPeriodForBankSchedule(utilisationReportPeriodSchedule);

      return res.status(200).send(nextReportPeriod);
    }
    return res.status(404).send();
  } catch (error) {
    console.error('Error getting next report period for bank %s: %o', req?.params?.bankId, error);
    return res.status(500).send();
  }
};
