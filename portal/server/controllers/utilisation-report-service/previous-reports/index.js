const utilisationData = require('./data.json');

const getMonthName = (monthNumber) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('default', { month: 'long' });
};

const getUtilisationReportDownload = async (req, res) => {
  // get data from the DB (json) and render the page
  const { targetYear } = req.query;
  const navItems = utilisationData.map((utilisation) => ({
    text: utilisation.year,
    href: `?targetYear=${utilisation.year}`,
  }));

  const utilisation = targetYear ? utilisationData.find((x) => x.year.toString() === targetYear) : utilisationData[0];
  const utilisationIndex = targetYear ? utilisationData.findIndex((x) => x.year.toString() === targetYear) : 0;
  if (navItems.length) {
    navItems[utilisationIndex].active = true;
  }

  const reports = navItems.length
    ? utilisation.reports.map((report) => ({
      month: getMonthName(report.month),
      path: report.path,
    }))
    : [];
  const year = navItems.length
    ? utilisation.year
    : undefined;
  try {
    return res.render('utilisation-reporting-service/partials/previous-reports.njk', {
      navItems,
      reports,
      year,
    });
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  getUtilisationReportDownload,
};
