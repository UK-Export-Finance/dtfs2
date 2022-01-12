const { format } = require('date-fns');
const api = require('../../services/api');
const { FACILITY_TYPE } = require('../../constants');
const { isTrueSet } = require('../../utils/helpers');
const CONSTANTS = require('../../constants');
const { applicationDetails } = require('../application-details');
const { facilityValidation } = require('./validation');

/**
 * creates body/parameters for the template for unissued facilities
 * if change true, changes 'cancel' + 'back' button href back to application preview
 * else renders back to unissued facilities list
 * @param {req} params, @param {req} query, @param {Boolean} change
 * @returns {Object} body
*/
const renderChangeFacilityPartial = async (params, query, change) => {
  const { dealId, facilityId } = params;
  const { status } = query;

  const { details } = await api.getFacility(facilityId);
  const facilityTypeString = FACILITY_TYPE[details.type.toUpperCase()].toLowerCase();
  const shouldCoverStartOnSubmission = JSON.stringify(details.shouldCoverStartOnSubmission);
  const issueDate = details.issueDate ? new Date(details.issueDate) : null;
  const coverStartDate = details.coverStartDate ? new Date(details.coverStartDate) : null;
  const coverEndDate = details.coverEndDate ? new Date(details.coverEndDate) : null;
  const monthsOfCover = JSON.stringify(details.monthsOfCover);

  const body = {
    facilityType: FACILITY_TYPE[details.type.toUpperCase()],
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

// returns body to render for template
const renderBody = (body) => ({
  facilityType: body.facilityType,
  facilityName: body.facilityName,
  hasBeenIssued: body.hasBeenIssued,
  monthsOfCover: body.monthsOfCover,
  shouldCoverStartOnSubmission: body.shouldCoverStartOnSubmission,
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
// renders about-facility change page for unissued facilities
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
// renders about-facility change page for unissued facilities
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
 * post function for changing unissued facilities to issued from unissued facilities list
 * validates first and gets parameters {Object} from validation function
 * displays success message and redirects to unissued facilities list
 * @param {req}
 * @returns {res}
 */
const postChangeUnissuedFacility = async (req, res) => {
  const { body, query, params } = req;

  const {
    issueDate,
    coverStartDate,
    coverEndDate,
    aboutFacilityErrors,
    facilityId,
    dealId,
    errorsObject,
  } = await facilityValidation(body, query, params);

  if (aboutFacilityErrors.length > 0) {
    return res.render('partials/unissued-change-about-facility.njk', {
      errors: errorsObject.errors,
      facilityName: errorsObject.facilityName,
      shouldCoverStartOnSubmission: errorsObject.shouldCoverStartOnSubmission,
      monthsOfCover: errorsObject.monthsOfCover,
      hasBeenIssued: errorsObject.hasBeenIssued,
      issueDateDay: errorsObject.issueDateDay,
      issueDateMonth: errorsObject.issueDateMonth,
      issueDateYear: errorsObject.issueDateYear,
      coverStartDateDay: errorsObject.coverStartDateDay,
      coverStartDateMonth: errorsObject.coverStartDateMonth,
      coverStartDateYear: errorsObject.coverStartDateYear,
      coverEndDateDay: errorsObject.coverEndDateDay,
      coverEndDateMonth: errorsObject.coverEndDateMonth,
      coverEndDateYear: errorsObject.coverEndDateYear,
      facilityType: errorsObject.facilityType,
      facilityTypeString: errorsObject.facilityTypeString,
      dealId: errorsObject.dealId,
      facilityId: errorsObject.facilityId,
      status: errorsObject.status,
    });
  }

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
        canResubmitIssuedFacilities: true,
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
    console.error('Cannot update unissued facility', { err });
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * post for changing unissued facilities from application preview
 * redirects to application preview once changed
 * @param {req}
 * @returns {res}
 */
const postChangeUnissuedFacilityPreview = async (req, res) => {
  const { body, query, params } = req;

  const {
    issueDate,
    coverStartDate,
    coverEndDate,
    aboutFacilityErrors,
    facilityId,
    dealId,
    errorsObject,
  } = await facilityValidation(body, query, params);

  if (aboutFacilityErrors.length > 0) {
    return res.render('partials/unissued-change-about-facility.njk', {
      errors: errorsObject.errors,
      facilityName: errorsObject.facilityName,
      shouldCoverStartOnSubmission: errorsObject.shouldCoverStartOnSubmission,
      monthsOfCover: errorsObject.monthsOfCover,
      hasBeenIssued: errorsObject.hasBeenIssued,
      issueDateDay: errorsObject.issueDateDay,
      issueDateMonth: errorsObject.issueDateMonth,
      issueDateYear: errorsObject.issueDateYear,
      coverStartDateDay: errorsObject.coverStartDateDay,
      coverStartDateMonth: errorsObject.coverStartDateMonth,
      coverStartDateYear: errorsObject.coverStartDateYear,
      coverEndDateDay: errorsObject.coverEndDateDay,
      coverEndDateMonth: errorsObject.coverEndDateMonth,
      coverEndDateYear: errorsObject.coverEndDateYear,
      facilityType: errorsObject.facilityType,
      facilityTypeString: errorsObject.facilityTypeString,
      dealId: errorsObject.dealId,
      facilityId: errorsObject.facilityId,
      status: errorsObject.status,
    });
  }

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
        canResubmitIssuedFacilities: true,
        coverDateConfirmed: true,
      },
      (req.url = `/gef/application-details/${dealId}`),
    );

    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (err) {
    console.error('Cannot update unissued facility from application preview', { err });
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
