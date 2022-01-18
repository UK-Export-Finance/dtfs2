const downloadCsv = require('../../utils/downloadCsv');
const api = require('../../api');

exports.getPortalReports = async (req, res) => {
  const { userToken } = req.session;

  const facilities = await api.getUnissuedFacilitiesReports(userToken);

  const pastDeadlineUnissuedFacilitiesCount = facilities.filter((facility) => facility.daysLeftToIssue < 0);
  const facilitiesThatNeedIssuingCount = facilities.filter((facility) => facility.daysLeftToIssue < 15 && facility.daysLeftToIssue >= 0);
  if (facilities) {
    return res.render('portal-reports/reports.njk', {
      allUnissuedFacilitiesCount: facilities.length,
      pastDeadlineUnissuedFacilitiesCount: pastDeadlineUnissuedFacilitiesCount.length,
      facilitiesThatNeedIssuingCount: facilitiesThatNeedIssuingCount.length,
    });
  }
};

exports.getUnissuedFacilitiesReports = async (req, res) => {
  const { userToken } = req.session;

  const facilities = await api.getUnissuedFacilitiesReports(userToken);

  if (facilities) {
    return res.render('portal-reports/unissued-facilities.njk', { facilities });
  }

  return res.redirect('/not-found');
};

exports.downloadUnissuedFacilitiesReports = async (req, res) => {
  const { userToken } = req.session;
  const facilities = await api.getUnissuedFacilitiesReports(userToken);

  // not all columns are needed, in which case, the array below will specify
  // the properties that we want to add to the CSV file and the label for them
  const columns = [
    {
      label: 'Bank ref',
      value: 'bankInternalRefName',
    },
    {
      label: 'Product',
      value: 'companyName',
    },
    {
      label: 'Facility ID',
      value: 'ukefFacilityId',
    },
    {
      label: 'Value',
      value: 'currencyAndValue',
    },
    {
      label: 'Deadline for issuing',
      value: 'deadlineForIssuing',
    },
    {
      label: 'Days left to issue',
      value: 'daysLeftToIssue',
    },
  ];
  // download the report only if we have facilities
  if (facilities.length) {
    return downloadCsv(res, 'unissued_facilities_report', columns, facilities);
  }
};
