const { format } = require('date-fns');
const api = require('../../services/api');
const { FACILITY_TYPE } = require('../../constants');
const { isTrueSet } = require('../../utils/helpers');
const CONSTANTS = require('../../constants');
const { applicationDetails } = require('../application-details');
const { facilityValidation } = require('./validation');

/**
 * creates body/parameters for the template for unissued facilities
 * if change set to true, changes cancel and back button href back to application preview
 * else renders back to unissued facilities list
 */
const renderChangeFacilityPartial = async (params, query, change) => {
  const { dealId, facilityId } = params;
  const { status } = query;

  const { details } = await api.getFacility(facilityId);
  const facilityTypeString = FACILITY_TYPE[details.type].toLowerCase();
  const shouldCoverStartOnSubmission = JSON.stringify(details.shouldCoverStartOnSubmission);
  const issueDate = details.issueDate ? new Date(details.issueDate) : null;
  const coverStartDate = details.coverStartDate ? new Date(details.coverStartDate) : null;
  const coverEndDate = details.coverEndDate ? new Date(details.coverEndDate) : null;
  const monthsOfCover = JSON.stringify(details.monthsOfCover);

  const body = {
    facilityType: FACILITY_TYPE[details.type],
    facilityName: details.name,
    hasBeenIssued: details.hasBeenIssued,
    monthsOfCover: monthsOfCover !== 'null' ? monthsOfCover : null,
    shouldCoverStartOnSubmission: shouldCoverStartOnSubmission !== 'null' ? shouldCoverStartOnSubmission : null,
    issueDateDay: issueDate ? format(issueDate, 'd') : null,
    issueDateMonth: issueDate ? format(issueDate, 'M') : null,
    issueDateYear: issueDate ? format(issueDate, 'yyyy') : null,
    coverStartDateDay: coverStartDate ? format(coverStartDate, 'd') : null,
    coverStartDateMonth: coverStartDate ? format(coverStartDate, 'M') : null,
    coverStartDateYear: coverStartDate ? format(coverStartDate, 'yyyy') : null,
    coverEndDateDay: coverEndDate ? format(coverEndDate, 'd') : null,
    coverEndDateMonth: coverEndDate ? format(coverEndDate, 'M') : null,
    coverEndDateYear: coverEndDate ? format(coverEndDate, 'yyyy') : null,
    facilityTypeString,
    dealId,
    facilityId,
    status,
    change,
  };

  return body;
};

const renderBody = (body) => ({
  facilityType: body.facilityType,
  facilityName: body.facilityName,
  hasBeenIssued: body.hasBeenIssued,
  monthsOfCover: body.monthsOfCover,
  shouldCoverStartOnSubmission: body.monthsOfCover,
  issueDateDay: body.issueDateDay,
  issueDateMonth: body.issueDateMonth,
  issueDateYear: body.issueDateYear,
  coverStartDateDay: body.coverStartDateDay,
  coverStartDateMonth: body.coverStartDateMonth,
  coverStartDateYear: body.coverStartDateYear,
  coverEndDateDay: body.coverEndDateDay,
  coverEndDateMonth: body.coverEndDateMonth,
  coverEndDateYear: body.coverEndDateYear,
  facilityTypeString: body.facilityTypeString,
  dealId: body.dealId,
  facilityId: body.facilityId,
  status: body.status,
  change: body.change,
});

// when changing unissued facility from unissued facility list
const changeUnissuedFacility = async (req, res) => {
  const { params, query } = req;

  try {
    const body = await renderChangeFacilityPartial(params, query, false);

    return res.render('partials/unissued-change-about-facility.njk', renderBody(body));
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

// when changing unissued facility from application preview page
const changeUnissuedFacilityPreview = async (req, res) => {
  const { params, query } = req;

  try {
    const body = await renderChangeFacilityPartial(params, query, true);

    return res.render('partials/unissued-change-about-facility.njk', renderBody(body));
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * post for changing unissued facilities to issued from unissued facilities list
 * validates first and gets parameters from validation
 * displays success message and redirects to unissued facilities list
 */
const postChangeUnissuedFacility = async (req, res) => {
  const {
    issueDate, coverStartDate, coverEndDate, body, facilityId, dealId,
  } = await facilityValidation(req, res);

  try {
    await api.updateFacility(
      facilityId,
      {
        name: body.facilityName,
        shouldCoverStartOnSubmission: isTrueSet(body.shouldCoverStartOnSubmission),
        monthsOfCover: body.monthsOfCover || null,
        issueDate: issueDate ? format(issueDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverStartDate: coverStartDate ? format(coverStartDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverEndDate: coverEndDate ? format(coverEndDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        hasBeenIssued: true,
        changedToIssued: true,
        coverDateConfirmed: true,
      },
      (req.success = {
        message: `${body.facilityName} is updated`,
      }),
      (req.url = `/gef/application-details/${dealId}/unissued-facilities`),
    );
    // TODO: DTFS2-5227 change redirect
    return applicationDetails(req, res);
  } catch (err) {
    console.log(err);
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * post for changing unissued facilities from application preview
 * redirects to application preview once changed
 */
const postChangeUnissuedFacilityPreview = async (req, res) => {
  const {
    issueDate, coverStartDate, coverEndDate, body, facilityId, dealId,
  } = await facilityValidation(req, res);

  try {
    await api.updateFacility(
      facilityId,
      {
        name: body.facilityName,
        shouldCoverStartOnSubmission: isTrueSet(body.shouldCoverStartOnSubmission),
        monthsOfCover: body.monthsOfCover || null,
        issueDate: issueDate ? format(issueDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverStartDate: coverStartDate ? format(coverStartDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverEndDate: coverEndDate ? format(coverEndDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        hasBeenIssued: true,
        changedToIssued: true,
        coverDateConfirmed: true,
      },
      (req.url = `/gef/application-details/${dealId}`),
    );

    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (err) {
    console.log(err);
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  renderChangeFacilityPartial,
  changeUnissuedFacility,
  changeUnissuedFacilityPreview,
  postChangeUnissuedFacility,
  postChangeUnissuedFacilityPreview,
  facilityValidation,
};
