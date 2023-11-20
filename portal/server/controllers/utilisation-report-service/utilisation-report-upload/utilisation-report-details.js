const { format, parseISO } = require('date-fns');

/**
 * @typedef {Object} ReportAndUserDetails
 * @property {string} uploadedByFullName - The index of the object with format '{firstname} {surname}'
 * @property {string} formattedDateAndTime - The date uploaded formatted as 'h:mmaaa'
 * @property {string} lastUploadedReportPeriod - The report period of the report formatted as 'MMMM yyyy'
 */

/**
 * Given a utilisation report, this returns an object containing formatted
 * information about the report and the user who submitted the report
 * @param {Object} report - A utilisation report
 * @returns {ReportAndUserDetails}
 */
const getReportAndUserDetails = (report) => {
  if (!report) {
    throw new Error('Cannot get report and user details');
  }

  const { dateUploaded, uploadedBy, year, month } = report;

  const { firstname, surname } = uploadedBy;
  const uploadedByFullName = `${firstname} ${surname}`;

  const date = parseISO(dateUploaded);
  const formattedDate = format(date, 'd MMMM yyyy');
  const formattedTime = format(date, 'h:mmaaa');
  const formattedDateAndTime = `${formattedDate} at ${formattedTime}`;

  const lastUploadedReportDate = new Date(year, month - 1);
  const lastUploadedReportPeriod = format(lastUploadedReportDate, 'MMMM yyyy');

  return {
    uploadedByFullName,
    formattedDateAndTime,
    lastUploadedReportPeriod,
  };
};

module.exports = {
  getReportAndUserDetails,
};
