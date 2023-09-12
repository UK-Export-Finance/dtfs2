const JSON = require('./data.json');

const getUtilisationReportDownload = async (req, res) => {
    //get data from the DB (json) and render the page
    // console.log(JSON);
    try {
        return res.render('utilisation-reporting-service/partials/previous-reports.njk', {
          data: JSON
        });
      } catch (error) {
        return res.render('partials/problem-with-service.njk');
      }
};

module.exports = {
    getUtilisationReportDownload,
};