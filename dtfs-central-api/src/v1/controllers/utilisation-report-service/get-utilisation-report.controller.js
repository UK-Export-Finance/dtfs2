const { getUtilisationReportDetailsById } = require('../../../repositories/utilisation-reports-repo');

const getUtilisationReportById = async (req, res) => {
  const { _id } = req.params;

  try {
    const utilisationReport = await getUtilisationReportDetailsById(_id);

    if (!utilisationReport) {
      return res.status(404).send();
    }

    return res.status(200).send(utilisationReport);
  } catch (error) {
    const errorMessage = `Failed to get utilisation report with _id '${_id}'`;
    console.error(errorMessage, error);
    return res.status(500).send(errorMessage);
  }
};

module.exports = { getUtilisationReportById };
