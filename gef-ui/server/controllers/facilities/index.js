const { validationErrorHandler, isTrueSet } = require('../../utils/helpers');
const { FACILITY_TYPE } = require('../../constants');
const api = require('../../services/api');

const facilities = async (req, res) => {
  const { params, query } = req;
  const { dealId, facilityId } = params;
  const { status } = query;
  let { facilityType } = query;

  facilityType = facilityType || FACILITY_TYPE.CASH;
  const facilityTypeString = FACILITY_TYPE[facilityType?.toUpperCase()].toLowerCase();

  if (!facilityId) {
    return res.render('partials/facilities.njk', {
      facilityType: facilityTypeString,
      dealId,
      status,
    });
  }

  try {
    const { details } = await api.getFacility(facilityId);
    const hasBeenIssued = JSON.stringify(details.hasBeenIssued);

    return res.render('partials/facilities.njk', {
      facilityType: facilityTypeString,
      hasBeenIssued: hasBeenIssued !== 'null' ? hasBeenIssued : null,
      dealId,
      status,
    });
  } catch (err) {
    console.error(err);
    return res.render('partials/problem-with-service.njk');
  }
};

const createFacility = async (req, res) => {
  const { body, params, query } = req;
  const { dealId, facilityId } = params;
  const { status } = query;
  let { facilityType } = query;
  const hasBeenIssuedErrors = [];
  let facility;
  facilityType = facilityType || FACILITY_TYPE.CASH;
  const facilityTypeString = FACILITY_TYPE[facilityType?.toUpperCase()].toLowerCase();

  try {
    // Don't validate form if user clicks on 'return to application` button
    if (!body.hasBeenIssued) {
      hasBeenIssuedErrors.push({
        errRef: 'hasBeenIssued',
        errMsg: `Select if your bank has already issued this ${facilityTypeString} facility`,
      });

      return res.render('partials/facilities.njk', {
        errors: validationErrorHandler(hasBeenIssuedErrors),
        dealId,
        status,
      });
    }

    if (!facilityId) {
      facility = await api.createFacility({
        type: facilityType,
        hasBeenIssued: isTrueSet(body.hasBeenIssued),
        dealId,
      });
    } else {
      facility = await api.updateFacility(facilityId, {
        hasBeenIssued: isTrueSet(body.hasBeenIssued),
      });
    }

    if (status && status === 'change') {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    // eslint-disable-next-line no-underscore-dangle
    return res.redirect(`/gef/application-details/${dealId}/facilities/${facility.details._id}/about-facility`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  facilities,
  createFacility,
};
