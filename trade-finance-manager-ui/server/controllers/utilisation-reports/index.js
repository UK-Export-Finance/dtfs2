const { getFormattedReportDueDate, getFormattedReportPeriod } = require('../../services/utilisation-report-service');

const getUtilisationReports = async (req, res) => {
  try {
    const { userToken } = req.session;

    const reportPeriod = getFormattedReportPeriod();
    const reportDueDate = await getFormattedReportDueDate(userToken);

    return res.render('utilisation-reports/utilisation-reports.njk', {
      activePrimaryNavigation: 'utilisation reports',
      reportPeriod,
      reportDueDate,
    });
  } catch (error) {
    console.error('Error rendering utilisation reports page', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

module.exports = {
  getUtilisationReports,
};
