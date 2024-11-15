const { validationErrorHandler, isTrueSet } = require('../../utils/helpers');
const { facilityTypeStringGenerator } = require('../../utils/facility-helpers');
const { FACILITY_TYPE } = require('../../constants');
const api = require('../../services/api');

const facilities = async (req, res) => {
  const {
    params,
    query,
    session: { userToken },
  } = req;
  const { dealId, facilityId } = params;
  const { status } = query;
  let { facilityType } = query;

  facilityType = facilityType || FACILITY_TYPE.CASH;
  const facilityTypeString = facilityTypeStringGenerator(facilityType);

  if (!facilityId) {
    return res.render('_partials/facilities.njk', {
      facilityType: facilityTypeString,
      dealId,
      status,
    });
  }

  try {
    const { details } = await api.getFacility({ facilityId, userToken });
    const hasBeenIssued = JSON.stringify(details.hasBeenIssued);

    return res.render('_partials/facilities.njk', {
      facilityType: facilityTypeString,
      hasBeenIssued: hasBeenIssued !== 'null' ? hasBeenIssued : null,
      dealId,
      status,
    });
  } catch (error) {
    console.error('Facilities error %o', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

const createFacility = async (req, res) => {
  const { body, params, query, session } = req;
  const { dealId, facilityId } = params;
  const { status } = query;
  const { user, userToken } = session;
  const { _id: editorId } = user;
  let { facilityType } = query;
  const hasBeenIssuedErrors = [];
  let facility;
  facilityType = facilityType || FACILITY_TYPE.CASH;
  const facilityTypeString = facilityTypeStringGenerator(facilityType);

  try {
    // Don't validate form if user clicks on 'return to application` button
    if (!body.hasBeenIssued) {
      hasBeenIssuedErrors.push({
        errRef: 'hasBeenIssued',
        errMsg: `Select if your bank has already issued this ${facilityTypeString} facility`,
      });

      return res.render('_partials/facilities.njk', {
        facilityType: facilityTypeString,
        errors: validationErrorHandler(hasBeenIssuedErrors),
        dealId,
        status,
      });
    }

    if (!facilityId) {
      facility = await api.createFacility({
        payload: {
          type: facilityType,
          hasBeenIssued: isTrueSet(body.hasBeenIssued),
          dealId,
        },
        userToken,
      });
    } else {
      facility = await api.updateFacility({
        facilityId,
        payload: {
          hasBeenIssued: isTrueSet(body.hasBeenIssued),
        },
        userToken,
      });
    }

    // updates application with editorId
    const applicationUpdate = {
      editorId,
    };
    await api.updateApplication({ dealId, application: applicationUpdate, userToken });

    return res.redirect(`/gef/application-details/${dealId}/facilities/${facility.details._id}/about-facility`);
  } catch (error) {
    console.error('Error creating a facility %o', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

module.exports = {
  facilities,
  createFacility,
};
