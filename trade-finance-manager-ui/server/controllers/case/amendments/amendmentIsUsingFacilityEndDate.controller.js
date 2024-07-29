const { isTfmFacilityEndDateFeatureFlagEnabled, AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { isUsingFacilityEndDateValidation } = require('./validation/amendmentIsUsingFacilityEndDate.validate');

const getNextPage = (status, changeFacilityValue, isUsingFacilityEndDate, dealId, facilityId, amendmentId) => {
  const baseUrl = `/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}`;
  const fallbackUrl = `/case/${dealId}/facility/${facilityId}#amendments`;

  if (status === 200) {
    if (isUsingFacilityEndDate) {
      return `${baseUrl}/facility-end-date`;
    }
    if (changeFacilityValue) {
      return `${baseUrl}/facility-value`;
    }
    return `${baseUrl}/check-answers`;
  }
  console.error('Unable to update is using facility end date');
  return fallbackUrl;
};

const getAmendmentIsUsingFacilityEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  if (!amendment.changeCoverEndDate || !isTfmFacilityEndDateFeatureFlagEnabled()) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  }

  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;
  const { dealId, isUsingFacilityEndDate } = amendment;

  return res.render('case/amendments/amendment-is-using-facility-end-date.njk', {
    dealId,
    facilityId,
    isEditable,
    isUsingFacilityEndDate,
    user: req.session.user,
  });
};

const getBooleanFromIsUsingFacilityEndDate = (isUsingFacilityEndDate) => {
  switch (isUsingFacilityEndDate) {
    case 'Yes':
      return true;
    case 'No':
      return false;
    default:
      return null;
  }
};

const postAmendmentIsUsingFacilityEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, changeFacilityValue } = amendment;
  const { isUsingFacilityEndDate } = req.body;
  const isUsingFacilityEndDateValue = getBooleanFromIsUsingFacilityEndDate(isUsingFacilityEndDate);

  const { errors } = isUsingFacilityEndDateValidation(isUsingFacilityEndDate);

  if (errors.errorSummary?.length) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate && isTfmFacilityEndDateFeatureFlagEnabled();
    return res.render('case/amendments/amendment-is-using-facility-end-date.njk', {
      errors,
      dealId,
      facilityId,
      isEditable,
      isUsingFacilityEndDate,
      user: req.session.user,
    });
  }

  try {
    const payload = { isUsingFacilityEndDate: isUsingFacilityEndDateValue };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);
    return res.redirect(getNextPage(status, changeFacilityValue, isUsingFacilityEndDateValue, dealId, facilityId, amendmentId));
  } catch (error) {
    console.error('There was a problem adding if the bank is using the facility end date', error);
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendmentIsUsingFacilityEndDate, postAmendmentIsUsingFacilityEndDate };
