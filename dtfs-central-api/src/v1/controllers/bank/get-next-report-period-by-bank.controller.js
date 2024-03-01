const { findOneBank } = require('./get-bank.controller');
const { getNextReportPeriodForBankSchedule } = require('@ukef/dtfs2-common');

exports.getNextReportPeriodByBankId = async (req, res) => {
  const bank = await findOneBank(req.params.bankId);

  if (bank.utilisationReportPeriodSchedule) {
    const { utilisationReportPeriodSchedule } = bank;
    const nextReportPeriod = getNextReportPeriodForBankSchedule(utilisationReportPeriodSchedule);

    return res.status(200).send(nextReportPeriod);
  }
  return res.status(404).send();
};
