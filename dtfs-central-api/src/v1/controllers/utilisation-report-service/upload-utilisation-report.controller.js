const { saveUtilisationData } = require('../../../services/repositories/utilisation-data-repo');
const { saveUtilisationReportDetails } = require('../../../services/repositories/utilisation-reports-repo');

const putUtilisationReportData = async (req, res) => {
  const { reportData, month, year, user } = req.body;
  console.log(reportData);
  console.log(month);
  console.log(year);
  console.log(user);
  const bank = user.bank;

  // do i need to do any validation?
  // let's do it all here

  try {
    // save utilisation data to database
    await saveUtilisationData(reportData, month, year, bank);

    // save report details to database
    await saveUtilisationReportDetails(bank, month, year, 'a file path', user);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Failed to save utilisation report');
  }

  return res.status(200).send('Successfully saved utilisation report');
};

module.exports = { putUtilisationReportData };
