const { isTfmFacilityEndDateFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { format } = require('date-fns');
const api = require('../../../api');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');
const facilityEndDateValidation = require('./validation/amendmentFacilityEndDate.validate');

const getAmendmentFacilityEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  if (!amendment.changeCoverEndDate || !isTfmFacilityEndDateFeatureFlagEnabled()) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  }

  if (!amendment.isUsingFacilityEndDate) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
  }

  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  const { dealId, facilityEndDate } = amendment;
  let facilityEndDateDay = '';
  let facilityEndDateMonth = '';
  let facilityEndDateYear = '';
  if (amendment.facilityEndDate) {
    facilityEndDateDay = format(new Date(facilityEndDate), 'dd');
    facilityEndDateMonth = format(new Date(facilityEndDate), 'M');
    facilityEndDateYear = format(new Date(facilityEndDate), 'yyyy');
  }

  return res.render('case/amendments/amendment-facility-end-date.njk', {
    dealId,
    facilityId,
    isEditable,
    facilityEndDateDay,
    facilityEndDateMonth,
    facilityEndDateYear,
    user: req.session.user,
  });
};

const postAmendmentFacilityEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId } = amendment;
  const facility = await api.getFacility(facilityId, userToken);

  const { facilityEndDate, errorsObject } = facilityEndDateValidation(req.body, facility.facilitySnapshot.dates.coverStartDate);

  if (errorsObject?.errors?.fields) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate && isTfmFacilityEndDateFeatureFlagEnabled();
    return res.render('case/amendments/amendment-facility-end-date.njk', {
      dealId,
      facilityId,
      isEditable,
      facilityEndDateDay: errorsObject.facilityEndDay,
      facilityEndDateMonth: errorsObject.facilityEndMonth,
      facilityEndDateYear: errorsObject.facilityEndYear,
      errors: errorsObject.errors,
      user: req.session.user,
    });
  }

  try {
    const payload = { facilityEndDate };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);
    if (status === 200) {
      if (amendment.changeFacilityValue) {
        return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
      }
      return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
    }
    console.error('Unable to update facility end date');
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  } catch (error) {
    console.error('There was a problem adding the facility end date', error);
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendmentFacilityEndDate, postAmendmentFacilityEndDate };
