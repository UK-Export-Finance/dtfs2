const api = require('../../../api');
const { getApiData } = require('../../../helpers');

const getPreviousReports = async (req, res) => {
  const { user, userToken } = req.session;
  const bankId = user.bank.id;

  try {
    const previousReportsByBank = await getApiData(api.getPreviousUtilisationReportsByBank(
      userToken,
      bankId,
    ), res);

    const { targetYear } = req.query;
    const navItems = previousReportsByBank?.map((utilisation) => ({
      text: utilisation.year,
      href: `?targetYear=${utilisation.year}`,
      attributes: { 'data-cy': `side-navigation-${utilisation.year}` },
    }));

    const utilisation = targetYear ? previousReportsByBank.find((data) => data.year.toString() === targetYear) : previousReportsByBank[0];
    const utilisationIndex = targetYear ? previousReportsByBank.findIndex((data) => data.year.toString() === targetYear) : 0;
    if (navItems?.length) {
      navItems[utilisationIndex].active = true;
    }

    const reports = navItems?.length
      ? utilisation?.reports?.map((report) => ({
          month: report.month,
          filename: report.azureFileInfo?.filename,
          path: `/banks/${bankId}/utilisation-report-download/${report._id}`,
        }))
      : [];
    const year = navItems?.length
      ? utilisation?.year
      : undefined;

    return res.render('utilisation-report-service/previous-reports/previous-reports.njk', {
      user: req.session.user,
      primaryNav: 'previous_reports',
      navItems,
      reports,
      year,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

module.exports = {
  getPreviousReports,
};
