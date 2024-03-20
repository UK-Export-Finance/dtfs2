const { format, parseISO } = require('date-fns');
const { getFormattedReportPeriod } = require('../../../helpers');

/**
 * @typedef {Object} ReportAndUserDetails
 * @property {string} uploadedByFullName - The uploaded by users full name with format '{firstname} {surname}'
 * @property {string} formattedDateAndTimeUploaded - The date uploaded formatted as 'd MMMM yyyy at h:mmaaa'
 * @property {string} lastUploadedReportPeriod - The report period of the report formatted as described in {@link getFormattedReportPeriod}
 */

/**
 * Given a utilisation report, this returns an object containing formatted
 * information about the report and the user who submitted the report
 * @param {import('server/api-response-types').UtilisationReportResponseBody | undefined} report - A utilisation report
 * @throws If the inputted report is undefined
 * @returns {ReportAndUserDetails}
 */
const getReportAndUserDetails = (report) => {
  if (!report) {
    throw new Error("Failed to get report and user details: 'report' was undefined");
  }

  const { dateUploaded, uploadedBy, reportPeriod } = report;

  const { firstname, surname } = uploadedBy;
  const uploadedByFullName = `${firstname} ${surname}`;

  const date = parseISO(dateUploaded);
  const formattedDate = format(date, 'd MMMM yyyy');
  const formattedTime = format(date, 'h:mmaaa');
  const formattedDateAndTimeUploaded = `${formattedDate} at ${formattedTime}`;

  const lastUploadedReportPeriod = getFormattedReportPeriod(reportPeriod);

  return {
    uploadedByFullName,
    formattedDateAndTimeUploaded,
    lastUploadedReportPeriod,
  };
};

module.exports = {
  getReportAndUserDetails,
};
