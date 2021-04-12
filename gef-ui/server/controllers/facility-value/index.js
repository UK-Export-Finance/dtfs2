import * as api from '../../services/api';
import { FACILITY_TYPE } from '../../../constants';
import { isTrueSet } from '../../utils/helpers';

const facilityValue = async (req, res) => {
  const { params, query } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility(facilityId);
    const facilityTypeConst = FACILITY_TYPE[details.type];
    const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';

    return res.render('partials/facility-value.njk', {
      currency: details.currency,
      facilityvalue: details.value,
      coverPercentage: details.coverPercentage,
      interestPercentage: details.interestPercentage,
      facilityTypeString,
      applicationId,
      facilityId,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

// const validateFacilityValue = async (req, res) => {
//   const { params, body, query } = req;
//   const { applicationId, facilityId } = params;
//   const { currency } = body;
//   const { saveAndReturn, status } = query;

//   try {
//     await api.updateFacility(facilityId, {
//       currency,
//     });

//     if (isTrueSet(saveAndReturn) || status === 'change') {
//       return res.redirect(`/gef/application-details/${applicationId}`);
//     }

//     return res.redirect(`/gef/application-details/${applicationId}/facilities/${facilityId}/facility-value`);
//   } catch (err) {
//     return res.render('partials/problem-with-service.njk');
//   }
// };

export {
  facilityValue,
  // validateFacilityValue,
};
