const api = require('../../api');
const { getFormattedReportDueDate, getFormattedReportPeriod } = require('../../services/utilisation-report-service');
const { getIsoMonth } = require('../../helpers/date');
const { getReportReconciliationSummaryViewModel } = require('./helpers');

const getUtilisationReports = async (req, res) => {
  const { userToken, user } = req.session;

  try {
    const reconciliationSummaryApiResponse = await api.getUtilisationReportsReconciliationSummary({
      submissionMonth: getIsoMonth(new Date()),
      userToken,
    });

    const reportReconciliationSummary = getReportReconciliationSummaryViewModel(reconciliationSummaryApiResponse);
    const reportPeriod = getFormattedReportPeriod();
    const reportDueDate = await getFormattedReportDueDate(userToken);

    return res.render('utilisation-reports/utilisation-reports.njk', {
      user,
      activePrimaryNavigation: 'utilisation reports',
      reportReconciliationSummary,
      reportPeriod,
      reportDueDate,
    });
  } catch (error) {
    console.error('Error rendering utilisation reports page', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

module.exports = {
  getUtilisationReports,
};
