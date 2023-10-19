const { saveUtilisationData } = require('../../../services/repositories/utilisation-data-repo');
const { saveUtilisationReportDetails } = require('../../../services/repositories/utilisation-reports-repo');

const putUtilisationReportData = async (req, res) => {
  const { report_data, month, year, bank, user } = req.body;

  // do i need to do any validation?
  // let's do it all here

  try {
    // save utilisation data to database
    await saveUtilisationData(report_data, month, year, bank);

    // save report details to database
    await saveUtilisationReportDetails(file, month, year, bank, user);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Failed to save utilisation report');
  }

  return res.status(200).send('Successfully saved utilisation report');
};

module.exports = { putUtilisationReportData };
