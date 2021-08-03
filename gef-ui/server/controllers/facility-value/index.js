import * as api from '../../services/api';
import { FACILITY_TYPE } from '../../../constants';
import { validationErrorHandler } from '../../utils/helpers';

const facilityValue = async (req, res) => {
  const { params, query } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility(facilityId);
    const facilityTypeConst = FACILITY_TYPE[details.type];
    const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';
    const value = JSON.stringify(details.value);
    const coverPercentage = JSON.stringify(details.coverPercentage);
    const interestPercentage = JSON.stringify(details.interestPercentage);

    return res.render('partials/facility-value.njk', {
      currency: details.currency,
      value: value !== 'null' ? value : null,
      facilityType: facilityTypeConst,
      coverPercentage: coverPercentage !== 'null' ? coverPercentage : null,
      interestPercentage: interestPercentage !== 'null' ? interestPercentage : null,
      facilityTypeString,
      applicationId,
      facilityId,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const updateFacilityValue = async (req, res) => {
  const { params, body, query } = req;
  const { applicationId, facilityId } = params;
  const {
    value, interestPercentage, coverPercentage, facilityType, currency,
  } = body;

  const { status } = query;
  const facilityTypeConst = FACILITY_TYPE[facilityType];
  const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';
  const facilityValueErrors = [];

  // Regex tests to see if value between 1 and 80
  const oneToEightyRegex = /^(?:[1-9]|[1-7][0-9]|80)$/;
  if (coverPercentage && !oneToEightyRegex.test(coverPercentage)) {
    facilityValueErrors.push({
      errRef: 'coverPercentage',
      errMsg: 'You can only only enter a number between 1 and 80',
    });
  }

  // Regex tests to see if value is between 0 and 100. Also allows for decimal places ie. 20.1
  const zeroToOneHundredRegex = /^(\d{0,2}(\.\d{1,2})?|100(\.00?)?)$/;
  if (interestPercentage && !zeroToOneHundredRegex.test(interestPercentage)) {
    facilityValueErrors.push({
      errRef: 'interestPercentage',
      errMsg: 'You can only enter a number between 0 and 100',
    });
  }


  if (facilityValueErrors.length > 0) {
    return res.render('partials/facility-value.njk', {
      errors: validationErrorHandler(facilityValueErrors),
      currency,
      value,
      coverPercentage,
      interestPercentage,
      facilityType,
      facilityTypeString,
      applicationId,
      facilityId,
      status,
    });
  }

  try {
    await api.updateFacility(facilityId, {
      coverPercentage: coverPercentage || null,
      interestPercentage: interestPercentage || null,
      value: value ? value.replace(/,/g, '') : null,
    });
    return res.redirect(`/gef/application-details/${applicationId}`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  facilityValue,
  updateFacilityValue,
};
