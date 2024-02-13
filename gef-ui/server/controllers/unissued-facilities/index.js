const { format } = require('date-fns');
const { isValidMongoId } = require('../../utils/validateIds');
const api = require('../../services/api');
const { FACILITY_TYPE } = require('../../constants');
const { isTrueSet } = require('../../utils/helpers');
const { facilityTypeStringGenerator } = require('../../utils/facility-helpers');
const CONSTANTS = require('../../constants');
const { facilityValidation } = require('./validation');
const { validationErrorHandler } = require('../../utils/helpers');

/**
 * creates body/parameters for the template for unissued facilities
 * if change true, changes 'cancel' + 'back' button href back to application preview
 * else renders back to unissued facilities list
 * @param {req} params, @param {req} query, @param {Boolean} change
 * @returns {Object} body
*/
const renderChangeFacilityPartial = async ({
  params, query, change, userToken,
}) => {
  const { dealId, facilityId } = params;
  const { status } = query;

  const { details } = await api.getFacility({ facilityId, userToken });
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
  const { params, query, session: { userToken } } = req;

  try {
    const body = await renderChangeFacilityPartial({
      params, query, change: false, userToken,
    });

    return res.render('partials/unissued-change-about-facility.njk', renderBody(body));
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

// when changing unissued facility from application preview page
// renders about-facility change page for unissued facilities
const changeUnissuedFacilityPreview = async (req, res) => {
  const { params, query, session: { userToken } } = req;

  try {
    const body = await renderChangeFacilityPartial({
      params, query, change: true, userToken,
    });

    return res.render('partials/unissued-change-about-facility.njk', renderBody(body));
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

// when changing unissued facility from application preview page
// renders about-facility change page for unissued facilities
const changeIssuedToUnissuedFacility = async (req, res) => {
  const { params, query, session: { userToken } } = req;
  const { dealId, facilityId } = params;
  let { facilityType } = query;
  facilityType = facilityType || FACILITY_TYPE.CASH;
  const facilityTypeString = facilityTypeStringGenerator(facilityType);

  try {
    const { details } = await api.getFacility({ facilityId, userToken });
    const hasBeenIssued = JSON.stringify(details.hasBeenIssued);

    return res.render('partials/issued-facility-to-unissued.njk', {
      facilityType: facilityTypeString,
      hasBeenIssued: hasBeenIssued !== 'null' ? hasBeenIssued : null,
      dealId,
    });
  } catch (error) {
    console.error('Facilities error %s', error);
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
  const { facilityId } = params;
  const { user, userToken } = req.session;
  const { _id: editorId } = user;

  try {
    const { details } = await api.getFacility({ facilityId, userToken });

    const {
      issueDate,
      coverStartDate,
      coverEndDate,
      aboutFacilityErrors,
      dealId,
      errorsObject,
    } = await facilityValidation({
      body, query, params, facility: details, userToken,
    });

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

    if (!isValidMongoId(dealId)) {
      throw new Error('DealId not valid');
    }

    const userObj = {
      firstname: user.firstname,
      surname: user.surname,
      _id: user._id,
    };

    await api.updateFacility({
      facilityId,
      payload: {
        name: body.facilityName,
        shouldCoverStartOnSubmission: isTrueSet(body.shouldCoverStartOnSubmission),
        monthsOfCover: details.monthsOfCover || null,
        issueDate: issueDate ? format(issueDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverStartDate: coverStartDate ? format(coverStartDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverEndDate: coverEndDate ? format(coverEndDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        hasBeenIssued: true,
        canResubmitIssuedFacilities: true,
        coverDateConfirmed: true,
        unissuedToIssuedByMaker: userObj,
      },
      userToken,
    });
    req.success = {
      message: `${body.facilityName} is updated`,
    };

    // updates application with editorId
    const applicationUpdate = {
      editorId,
    };
    await api.updateApplication({ dealId, application: applicationUpdate, userToken });

    req.flash('success', {
      message: `${body.facilityName} is updated`,
    });
    const redirectUrl = `/gef/application-details/${dealId}/unissued-facilities`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Cannot update unissued facility %s', error);
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
  const { facilityId } = params;
  const { user, userToken } = req.session;
  const { _id: editorId } = user;

  try {
    const { details } = await api.getFacility({ facilityId, userToken });

    const {
      issueDate,
      coverStartDate,
      coverEndDate,
      aboutFacilityErrors,
      dealId,
      errorsObject,
    } = await facilityValidation({
      body, query, params, facility: details, userToken,
    });

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

    const userObj = {
      firstname: user.firstname,
      surname: user.surname,
      _id: user._id,
    };

    await api.updateFacility({
      facilityId,
      payload: {
        name: body.facilityName,
        shouldCoverStartOnSubmission: isTrueSet(body.shouldCoverStartOnSubmission),
        monthsOfCover: details.monthsOfCover || null,
        issueDate: issueDate ? format(issueDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverStartDate: coverStartDate ? format(coverStartDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverEndDate: coverEndDate ? format(coverEndDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        hasBeenIssued: true,
        canResubmitIssuedFacilities: true,
        coverDateConfirmed: true,
        unissuedToIssuedByMaker: userObj,
      },
      userToken,
    });
    req.url = `/gef/application-details/${dealId}`;

    // updates application with editorId
    const applicationUpdate = {
      editorId,
    };

    await api.updateApplication({ dealId, application: applicationUpdate, userToken });
    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (error) {
    console.error('Cannot update unissued facility from application preview %s', error);
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * post function for changing changedToIssued facility back to unissued
 * changes date fields to null and adds the months of cover back to database if changing facility back to unissued
 * works in collaboration with facilities model in portal-api
 * @param {req}
 * @param {res}
 * @returns {res}
 */
const postChangeIssuedToUnissuedFacility = async (req, res) => {
  const {
    body, params, query, session,
  } = req;
  const { dealId, facilityId } = params;
  const { user, userToken } = session;
  const { _id: editorId } = user;
  let { facilityType } = query;
  const hasBeenIssuedErrors = [];
  facilityType = facilityType || FACILITY_TYPE.CASH;
  const facilityTypeString = facilityTypeStringGenerator(facilityType);

  // Don't validate form if user clicks on 'return to application` button
  if (!body.hasBeenIssued) {
    hasBeenIssuedErrors.push({
      errRef: 'hasBeenIssued',
      errMsg: `Select if your bank has already issued this ${facilityTypeString} facility`,
    });

    return res.render('partials/issued-facility-to-unissued.njk', {
      facilityType: facilityTypeString,
      errors: validationErrorHandler(hasBeenIssuedErrors),
      dealId,
    });
  }

  try {
    if (body.hasBeenIssued === 'false') {
      const { details } = await api.getFacility({ facilityId, userToken });
      if (details) {
        await api.updateFacility({
          facilityId,
          payload: {
            name: body.facilityName,
            shouldCoverStartOnSubmission: null,
            monthsOfCover: details.monthsOfCover || null,
            issueDate: null,
            coverStartDate: null,
            coverEndDate: null,
            hasBeenIssued: isTrueSet(body.hasBeenIssued),
            canResubmitIssuedFacilities: false,
            coverDateConfirmed: false,
            unissuedToIssuedByMaker: {},
          },
          userToken,
        });
        req.url = `/gef/application-details/${dealId}`;

        // updates application with editorId
        const applicationUpdate = {
          editorId,
        };
        await api.updateApplication({ dealId, application: applicationUpdate, userToken });
      }
    }
    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (error) {
    console.error('Error creating a facility %s', error);
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
  changeIssuedToUnissuedFacility,
  postChangeIssuedToUnissuedFacility,
};
