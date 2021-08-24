import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';
import Facility from '../../models/facility';
import validateFacilityGuarantee from './facility-guarantee';

const facilityGuarantee = async (req, res) => {
  const { params, query, session } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;
  const { user, userToken } = session;

  try {
    const facility = await Facility.find(applicationId, facilityId, status, user, userToken);
    if (!facility) {
      // eslint-disable-next-line no-console
      console.log('Facility not found, or not authorised');
      return res.redirect('/');
    }
    return res.render('partials/facility-guarantee.njk', {
      applicationId: facility.applicationId,
      facilityId: facility.facilityId,
      feeType: facility.feeType,
      inAdvanceFrequency: facility.feeType === 'in-advance' ? facility.frequency : '',
      inArrearsFrequency: facility.feeType === 'in-arrears' ? facility.frequency : '',
      dayCountBasis: facility.dayCountBasis,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const updateFacilityGuarantee = async (req, res) => {
  const { params, body, query } = req;
  const { applicationId, facilityId } = params;
  const {
    feeType, inAdvanceFrequency, inArrearsFrequency, dayCountBasis,
  } = body;
  const { status } = query;
  const facilityGuaranteeErrors = [];

  async function update() {
    try {
      await api.updateFacility(facilityId, {
        feeType,
        frequency: feeType === 'in-advance' ? inAdvanceFrequency : inArrearsFrequency,
        dayCountBasis,
      });
      return res.redirect(`/gef/application-details/${applicationId}`);
    } catch (err) {
      return res.render('partials/problem-with-service.njk');
    }
  }

  facilityGuaranteeErrors.push(...validateFacilityGuarantee(body));
  if (facilityGuaranteeErrors.length > 0) {
    return res.render('partials/facility-guarantee.njk', {
      errors: validationErrorHandler(facilityGuaranteeErrors),
      feeType,
      inArrearsFrequency,
      inAdvanceFrequency,
      dayCountBasis,
      applicationId,
      facilityId,
      status,
    });
  }
  return update();
};

export {
  facilityGuarantee,
  updateFacilityGuarantee,
};
