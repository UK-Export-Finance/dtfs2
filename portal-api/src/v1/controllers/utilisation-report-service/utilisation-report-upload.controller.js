const sendEmail = require('../../email');
const { EMAIL_TEMPLATE_IDS } = require('../../../constants');

const uploadReportAndSendNotification = async (req, res) => {
  const { month, year, bankName } = req.body;
  try {
    // TODO FN-974 get email address from env variables
    // TODO FN-1103 save file
    await sendEmail(
      EMAIL_TEMPLATE_IDS.NEW_UTILISATION_REPORT,
      'francesca.stocco@ukexportfinance.gov.uk',
      {
        bank_name: bankName,
        report_month: `${month} ${year}`,
      },
    );
    res.status(200).send(month);
  } catch (error) {
    console.error('Unable to upload report and send notifications');
  }
};

module.exports = { uploadReportAndSendNotification };
