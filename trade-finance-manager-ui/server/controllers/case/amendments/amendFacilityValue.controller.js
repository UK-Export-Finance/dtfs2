const api = require('../../../api');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');
const { amendFacilityValueValidation } = require('./validation/amendFacilityValue.validate');
const { formattedNumber } = require('../../../helpers/number');

const getAmendFacilityValue = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId);

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  const facility = await api.getFacility(facilityId);
  const { data: latestAmendmentValue } = await api.getLatestCompletedValueAmendment(facilityId);

  const { dealId, value } = amendment;
  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeFacilityValue;
  const { currency } = facility.facilitySnapshot;
  let currentFacilityValue = facility.facilitySnapshot.facilityValueExportCurrency;

  if (latestAmendmentValue?.value) {
    currentFacilityValue = `${currency} ${formattedNumber(latestAmendmentValue.value)}`;
  }

  return res.render('case/amendments/amendment-facility-value.njk', {
    dealId,
    facilityId,
    isEditable,
    currentFacilityValue,
    value,
    currency,
    user: req.session.user,
  });
};

const postAmendFacilityValue = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { value } = req.body;

  const facility = await api.getFacility(facilityId);

  const { data: latestAmendmentValue } = await api.getLatestCompletedValueAmendment(facilityId);
  const { currency } = facility.facilitySnapshot;
  let { coveredPercentage } = facility.facilitySnapshot;
  let currentFacilityValue = facility.facilitySnapshot.facilityValueExportCurrency;

  if (latestAmendmentValue?.value) {
    currentFacilityValue = `${currency} ${formattedNumber(latestAmendmentValue.value)}`;
  }

  const { errorsObject, amendFacilityValueErrors } = amendFacilityValueValidation(currentFacilityValue, value, currency);

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
      currency,
      value: amendment.value,
      user: req.session.user,
    });
  }

  try {
    const currentValueAndCurrency = currentFacilityValue.split(' ');
    const currentValue = Number(currentValueAndCurrency[1].replace(/,/g, ''));
    coveredPercentage = Number(coveredPercentage.replace(/%/g, ''));
    const ukefExposure = 0;
    const payload = {
      value: Number(value),
      currentValue,
      ukefExposure,
      coveredPercentage,
      currency,
    };
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
