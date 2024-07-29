const { isTfmFacilityEndDateFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { format } = require('date-fns');
const api = require('../../../api');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');
const facilityEndDateValidation = require('./validation/amendmentFacilityEndDate.validate');

const getNextPage = (status, changeFacilityValue, dealId, facilityId, amendmentId) => {
  const baseUrl = `/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}`;
  const fallbackUrl = `/case/${dealId}/facility/${facilityId}#amendments`;

  if (status === 200) {
    return changeFacilityValue ? `${baseUrl}/facility-value` : `${baseUrl}/check-answers`;
  }
  console.error('Unable to update facility end date');
  return fallbackUrl;
};

const getAmendmentFacilityEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, facilityEndDate, changeCoverEndDate, isUsingFacilityEndDate } = amendment;

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  if (!changeCoverEndDate || !isTfmFacilityEndDateFeatureFlagEnabled()) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  }

  if (!isUsingFacilityEndDate) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
  }

  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  const facilityEndDateDay = facilityEndDate ? format(new Date(facilityEndDate), 'dd') : '';
  const facilityEndDateMonth = facilityEndDate ? format(new Date(facilityEndDate), 'M') : '';
  const facilityEndDateYear = facilityEndDate ? format(new Date(facilityEndDate), 'yyyy') : '';

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
  const { dealId, changeFacilityValue } = amendment;
  const facility = await api.getFacility(facilityId, userToken);
  const { 'facility-end-date-day': day, 'facility-end-date-month': month, 'facility-end-date-year': year } = req.body;

  const { error, facilityEndDate } = facilityEndDateValidation({ day, month, year }, facility.facilitySnapshot.dates.coverStartDate);

  if (error?.fields) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate && isTfmFacilityEndDateFeatureFlagEnabled();
    return res.render('case/amendments/amendment-facility-end-date.njk', {
      dealId,
      facilityId,
      isEditable,
      facilityEndDateDay: day,
      facilityEndDateMonth: month,
      facilityEndDateYear: year,
      error,
      user: req.session.user,
    });
  }

  try {
    const payload = { facilityEndDate };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);
    return res.redirect(getNextPage(status, changeFacilityValue, dealId, facilityId, amendmentId));
  } catch (err) {
    console.error('There was a problem adding the facility end date', err);
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendmentFacilityEndDate, postAmendmentFacilityEndDate };
