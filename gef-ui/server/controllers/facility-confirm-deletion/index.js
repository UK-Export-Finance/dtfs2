import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const facilityConfirmDeletion = async (req, res) => {
  const { params } = req;
  const { facilityId } = params;

  try {
    const { details } = await api.getFacility(facilityId);

    return res.render('partials/facility-confirm-deletion.njk', {
      name: details.name,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const deleteFacility = async (req, res) => {
  const { params, body, query } = req;
  const { applicationId, facilityId } = params;
  const { currency, facilityType } = body;
  const { returnToApplication, status } = query;
  const facilityTypeConst = FACILITY_TYPE[facilityType];
  const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';
  const facilityCurrencyErrors = [];

  if (isTrueSet(returnToApplication)) {
    return res.redirect(`/gef/application-details/${applicationId}`);
  }

  if (!currency) {
    facilityCurrencyErrors.push({
      errRef: 'currency',
      errMsg: `Select a currency of your ${facilityTypeString} facility`,
    });
  }

  if (facilityCurrencyErrors.length > 0) {
    return res.render('partials/facility-currency.njk', {
      errors: validationErrorHandler(facilityCurrencyErrors),
      currency,
      facilityTypeString,
      applicationId,
      facilityId,
      status,
    });
  }

  try {
    await api.updateFacility(facilityId, {
      currency,
    });

    if (status === 'change') {
      return res.redirect(`/gef/application-details/${applicationId}/facilities/${facilityId}/facility-value?status=change`);
    }

    return res.redirect(`/gef/application-details/${applicationId}/facilities/${facilityId}/facility-value`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  facilityConfirmDeletion,
  deleteFacility,
};
