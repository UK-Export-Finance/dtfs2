const utilisationData = require('./data.json');

const getMonthName = (monthNumber) => {
  const date = new Date();
  // offset by 1 as January = 1 in Database
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('default', { month: 'long' });
};

const getPreviousReports = async (req, res) => {
  // get data from the DB (currently using json) - will need to pass in bank id from user
  try {
    const { targetYear } = req.query;
    const navItems = utilisationData?.map((utilisation) => ({
      text: utilisation.year,
      href: `?targetYear=${utilisation.year}`,
      attributes: { 'data-cy': `side-navigation-${utilisation.year}` },
    }));

    const utilisation = targetYear ? utilisationData.find((data) => data.year.toString() === targetYear) : utilisationData[0];
    const utilisationIndex = targetYear ? utilisationData.findIndex((data) => data.year.toString() === targetYear) : 0;
    if (navItems?.length) {
      navItems[utilisationIndex].active = true;
    }

    const reports = navItems?.length
      ? utilisation?.reports?.map((report) => ({
        month: getMonthName(report.month),
        path: report.path,
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
  getMonthName,
};
