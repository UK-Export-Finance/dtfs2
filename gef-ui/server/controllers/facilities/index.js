import * as api from '../../services/api';
import { validationErrorHandler, isTrueSet } from '../../utils/helpers';
import { FACILITY_TYPE } from '../../../constants';

const facilities = async (req, res) => {
  const { params, query } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;
  let { facilityType } = query;

  facilityType = facilityType || 'CASH';

  if (!facilityId) {
    return res.render('partials/facilities.njk', {
      facilityType: FACILITY_TYPE[facilityType],
      applicationId,
      status,
    });
  }

  try {
    const { details } = await api.getFacility(facilityId);
    const { hasBeenIssued } = details;
    return res.render('partials/facilities.njk', {
      facilityType: FACILITY_TYPE[facilityType],
      hasBeenIssued,
      applicationId,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const createFacility = async (req, res) => {
  const { body, params, query } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;
  let { facilityType } = query;
  const hasBeenIssuedErrors = [];
  let facility;
  facilityType = facilityType || 'CASH';

  try {
    // Don't validate form if user clicks on 'return to application` button
    if (!body.hasBeenIssued) {
      hasBeenIssuedErrors.push({
        errRef: 'hasBeenIssued',
        errMsg: `Select if your bank has already issued this ${FACILITY_TYPE[facilityType]} facility`,
      });

      return res.render('partials/facilities.njk', {
        errors: validationErrorHandler(hasBeenIssuedErrors),
        applicationId,
        status,
      });
    }

    if (!facilityId) {
      facility = await api.createFacility({
        type: facilityType,
        hasBeenIssued: isTrueSet(body.hasBeenIssued),
        applicationId,
      });
    } else {
      facility = await api.updateFacility(facilityId, {
        hasBeenIssued: isTrueSet(body.hasBeenIssued),
      });
    }

    if (status && status === 'change') {
      return res.redirect(`/gef/application-details/${applicationId}`);
    }

    // eslint-disable-next-line no-underscore-dangle
    return res.redirect(`/gef/application-details/${applicationId}/facilities/${facility.details._id}/about-facility`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  facilities,
  createFacility,
};
