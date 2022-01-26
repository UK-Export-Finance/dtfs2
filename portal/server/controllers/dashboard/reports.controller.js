const downloadCsv = require('../../utils/downloadCsv');
const api = require('../../api');
const CONSTANTS = require('../../constants');

exports.getPortalReports = async (req, res) => {
  const { userToken } = req.session;

  const facilities = await api.getUnissuedFacilitiesReport(userToken) || [];
  const dealWithConditions = await api.getUkefDecisionReport(userToken, { ukefDecision: CONSTANTS.STATUS.UKEF_APPROVED_WITH_CONDITIONS }) || [];
  const dealWithoutConditions = await api.getUkefDecisionReport(userToken, { ukefDecision: CONSTANTS.STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS }) || [];

  const pastDeadlineUnissuedFacilitiesCount = facilities.length ? facilities.filter(({ daysLeftToIssue }) => daysLeftToIssue < 0) : [];
  const facilitiesThatNeedIssuingCount = facilities.length ? facilities.filter(({ daysLeftToIssue }) => daysLeftToIssue < 15 && daysLeftToIssue >= 0) : [];

  return res.render('reports/reports-dashboard.njk', {
    allUnissuedFacilitiesCount: facilities.length,
    pastDeadlineUnissuedFacilitiesCount: pastDeadlineUnissuedFacilitiesCount.length,
    facilitiesThatNeedIssuingCount: facilitiesThatNeedIssuingCount.length,
    totalUkefDecisions: dealWithConditions.length + dealWithoutConditions.length,
    dealWithConditionsCount: dealWithConditions.length,
    dealWithoutConditionsCount: dealWithoutConditions.length,
    user: req.session.user,
    primaryNav: 'reports',
  });
};

exports.getUnissuedFacilitiesReport = async (req, res) => {
  const { userToken } = req.session;
  const facilities = await api.getUnissuedFacilitiesReport(userToken) || [];
  return res.render('reports/unissued-facilities.njk', { facilities, user: req.session.user, primaryNav: 'reports' });
};

exports.getUnconditionalDecisionReport = async (req, res) => {
  const { userToken } = req.session;
  const deals = await api.getUkefDecisionReport(userToken, { ukefDecision: CONSTANTS.STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS }) || [];
  return res.render('reports/unconditional-decision.njk', { deals, user: req.session.user, primaryNav: 'reports' });
};

exports.getConditionalDecisionReport = async (req, res) => {
  const { userToken } = req.session;
  const deals = await api.getUkefDecisionReport(userToken, { ukefDecision: CONSTANTS.STATUS.UKEF_APPROVED_WITH_CONDITIONS }) || [];
  return res.render('reports/conditional-decision.njk', { deals, user: req.session.user, primaryNav: 'reports' });
};

exports.downloadUnissuedFacilitiesReport = async (req, res) => {
  const { userToken } = req.session;
  const facilities = await api.getUnissuedFacilitiesReport(userToken) || [];

  // not all columns are needed, in which case, the array below will specify
  // the properties that we want to add to the CSV file and the label for them
  const columns = [
    {
      label: 'Bank ref',
      value: 'bankInternalRefName',
    },
    {
      label: 'Product',
      value: 'dealType',
    },
    {
      label: 'Facility ID',
      value: 'ukefFacilityId',
    },
    {
      label: 'Exporter',
      value: 'companyName',
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
  return downloadCsv(res, 'unissued_facilities_report', columns, facilities);
};

const downloadUkefDecisionReport = async (userToken, ukefDecision) => {
  const deals = await api.getUkefDecisionReport(userToken, ukefDecision);

  // not all columns are needed, in which case, the array below will specify
  // the properties that we want to add to the CSV file and the label for them
  const columns = [
    {
      label: 'Bank ref',
      value: 'bankInternalRefName',
    },
    {
      label: 'Product',
      value: 'dealType',
    },
    {
      label: 'Exporter',
      value: 'companyName',
    },
    {
      label: 'Date created',
      value: 'dateCreated',
    },
    {
      label: 'Submission date',
      value: 'submissionDate',
    },
    {
      label: 'Date of MIA approval by UKEF',
      value: 'dateOfApproval',
    },
    {
      label: 'Days to review',
      value: 'daysToReview',
    },
  ];

  return { deals, columns };
};

exports.downloadUnconditionalDecisionReport = async (req, res) => {
  const { userToken } = req.session;

  const { deals, columns } = await downloadUkefDecisionReport(userToken, { ukefDecision: CONSTANTS.STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS });
  // download the report only if we have deals
  if (deals) {
    return downloadCsv(res, 'unconditional_decisions_report', columns, deals);
  }

  return res.redirect('/not-found');
};

exports.downloadConditionalDecisionReport = async (req, res) => {
  const { userToken } = req.session;

  const { deals, columns } = await downloadUkefDecisionReport(userToken, { ukefDecision: CONSTANTS.STATUS.UKEF_APPROVED_WITH_CONDITIONS });
  // download the report only if we have deals
  if (deals) {
    return downloadCsv(res, 'conditional_decisions_report', columns, deals);
  }

  return res.redirect('/not-found');
};
