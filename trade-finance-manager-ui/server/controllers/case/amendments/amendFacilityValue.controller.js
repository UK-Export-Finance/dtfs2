const api = require('../../../api');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');
const { amendFacilityValueValidation } = require('./validation/amendFacilityValue.validate');

const getAmendFacilityValue = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId);

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  const facility = await api.getFacility(facilityId);
  const { data: latestAmendment } = await api.getLatestCompletedAmendment(facilityId);

  const { dealId, value } = amendment;
  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeFacilityValue;
  let currentFacilityValue = facility.facilitySnapshot.value;
  if (latestAmendment?.value) {
    currentFacilityValue = latestAmendment.value.toLocaleString('en', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    currentFacilityValue = `GBP ${currentFacilityValue}`;
  }

  return res.render('case/amendments/amendment-facility-value.njk', {
    dealId,
    facilityId,
    isEditable,
    currentFacilityValue,
    value,
    user: req.session.user,
  });
};

const postAmendFacilityValue = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { value } = req.body;

  const facility = await api.getFacility(facilityId);
  const currentFacilityValue = facility.facilitySnapshot.value;
  const { errorsObject, amendFacilityValueErrors } = amendFacilityValueValidation(currentFacilityValue, value);
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);
  const { dealId } = amendment;

  if (amendFacilityValueErrors.length) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeFacilityValue;
    return res.render('case/amendments/amendment-facility-value.njk', {
      errors: errorsObject.errors,
      dealId,
      facilityId,
      isEditable,
      currentFacilityValue,
      value: amendment.value,
      user: req.session.user,
    });
  }

  try {
    const payload = { value: Number(value) };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
    }
    console.error('Unable to update the facility value');
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
  } catch (err) {
    console.error('There was a problem creating the amendment approval %O', { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendFacilityValue, postAmendFacilityValue };
