const { AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { amendFacilityValueValidation } = require('./validation/amendFacilityValue.validate');
const { formattedNumber } = require('../../../helpers/number');

const getAmendFacilityValue = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  const facility = await api.getFacility(facilityId, userToken);
  const { data: latestAmendmentValue } = await api.getLatestCompletedAmendmentValue(facilityId, userToken);

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
  const { userToken } = req.session;
  const { value } = req.body;

  const facility = await api.getFacility(facilityId, userToken);

  const { data: latestAmendmentValue } = await api.getLatestCompletedAmendmentValue(facilityId, userToken);
  const { currency } = facility.facilitySnapshot;
  let { coveredPercentage } = facility.facilitySnapshot;
  let currentFacilityValue = facility.facilitySnapshot.facilityValueExportCurrency;

  if (latestAmendmentValue?.value) {
    currentFacilityValue = `${currency} ${formattedNumber(latestAmendmentValue.value)}`;
  }

  const { errorsObject, amendFacilityValueErrors } = amendFacilityValueValidation(currentFacilityValue, value, currency);

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);
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
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
    }
    console.error('Unable to update the facility value');
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
  } catch (error) {
    console.error('There was a problem creating the amendment approval %o', error);
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendFacilityValue, postAmendFacilityValue };
