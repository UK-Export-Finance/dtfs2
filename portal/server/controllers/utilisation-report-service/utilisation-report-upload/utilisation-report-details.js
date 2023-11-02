const { format, parseISO } = require('date-fns');

const getReportAndUserDetails = (report) => {
  if (!report) {
    throw new Error('Cannot get report and user details');
  }

  const { dateUploaded, uploadedBy } = report;

  const { firstname, surname } = uploadedBy;
  const uploadedByFullName = `${firstname} ${surname}`;

  const date = parseISO(dateUploaded);
  const formattedDate = format(date, 'd MMMM yyyy');
  const formattedTime = format(date, 'h:mmaaa');
  const formattedDateAndTime = `${formattedDate} at ${formattedTime}`;

  return {
    uploadedByFullName,
    formattedDateAndTime,
  };
};

module.exports = {
  getReportAndUserDetails,
};
