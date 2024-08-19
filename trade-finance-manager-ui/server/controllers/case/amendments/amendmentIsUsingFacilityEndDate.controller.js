const { AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const api = require('../../../api');
const { isUsingFacilityEndDateValidation } = require('./validation/amendmentIsUsingFacilityEndDate.validate');
const { isFacilityEndDateEnabledForFacility } = require('../../helpers/isFacilityEndDateEnabledForFacility');

const getNextPage = (status, changeFacilityValue, isUsingFacilityEndDate, baseUrl, fallbackUrl) => {
  if (status !== HttpStatusCode.Ok) {
    console.error('Unable to update is using facility end date');
    return fallbackUrl;
  }
  return isUsingFacilityEndDate ? `${baseUrl}/facility-end-date` : `${baseUrl}/bank-review-date`;
};

const getAmendmentIsUsingFacilityEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, isUsingFacilityEndDate } = amendment;
  const facility = await api.getFacility(facilityId, userToken);

  if (status !== HttpStatusCode.Ok) {
    return res.redirect('/not-found');
  }

  if (!amendment.changeCoverEndDate || !isFacilityEndDateEnabledForFacility(facility)) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  }

  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

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
  const facility = await api.getFacility(facilityId, userToken);

  const { errors } = isUsingFacilityEndDateValidation(isUsingFacilityEndDate);

  if (errors.errorSummary?.length) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate && isFacilityEndDateEnabledForFacility(facility);
    return res.render('case/amendments/amendment-is-using-facility-end-date.njk', {
      errors,
      dealId,
      facilityId,
      isEditable,
      isUsingFacilityEndDate,
      user: req.session.user,
    });
  }

  const baseUrl = `/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}`;
  const fallbackUrl = `/case/${dealId}/facility/${facilityId}#amendments`;

  try {
    const payload = { isUsingFacilityEndDate: isUsingFacilityEndDateValue };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);
    return res.redirect(getNextPage(status, changeFacilityValue, isUsingFacilityEndDateValue, baseUrl, fallbackUrl));
  } catch (error) {
    console.error('There was a problem adding if the bank is using the facility end date', error);
    return res.redirect(fallbackUrl);
  }
};

module.exports = { getAmendmentIsUsingFacilityEndDate, postAmendmentIsUsingFacilityEndDate };
