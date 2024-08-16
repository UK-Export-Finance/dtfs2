const { isTfmFacilityEndDateFeatureFlagEnabled, AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const { format, parseISO } = require('date-fns');
const api = require('../../../api');
const { facilityEndDateValidation } = require('./validation/amendmentFacilityEndDate.validate');

const getNextPage = (apiResponseStatus, changeFacilityValue, baseUrl) => {
  if (apiResponseStatus !== HttpStatusCode.Ok) {
    throw Error('Error updating amendment');
  }
  return changeFacilityValue ? `${baseUrl}/facility-value` : `${baseUrl}/check-answers`;
};

const getAmendmentFacilityEndDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status: apiResponseStatus } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, facilityEndDate, changeCoverEndDate, isUsingFacilityEndDate } = amendment;
  const facility = await api.getFacility(facilityId, userToken);

  if (apiResponseStatus !== HttpStatusCode.Ok) {
    return res.redirect('/not-found');
  }

  if (!changeCoverEndDate || !isTfmFacilityEndDateFeatureFlagEnabled()) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  }

  if (!isUsingFacilityEndDate) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
  }

  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  const enteredFacilityEndDate = facilityEndDate ? parseISO(facilityEndDate) : undefined;

  const dayInput = enteredFacilityEndDate ? format(enteredFacilityEndDate, 'd') : '';
  const monthInput = enteredFacilityEndDate ? format(enteredFacilityEndDate, 'M') : '';
  const yearInput = enteredFacilityEndDate ? format(enteredFacilityEndDate, 'yyyy') : '';

  const currentFacilityEndDate = facility?.facilitySnapshot?.dates?.facilityEndDate
    ? format(parseISO(facility?.facilitySnapshot?.dates?.facilityEndDate), 'dd MMMM yyyy')
    : undefined;

  return res.render('case/amendments/amendment-facility-end-date.njk', {
    dealId,
    facilityId,
    isEditable,
    dayInput,
    monthInput,
    yearInput,
    currentFacilityEndDate,
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

  const coverStartDate = new Date(Number(facility?.facilitySnapshot?.dates?.coverStartDate));

  const { error, facilityEndDate } = facilityEndDateValidation({ day, month, year }, coverStartDate);

  if (error?.fields) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate && isTfmFacilityEndDateFeatureFlagEnabled();
    const currentFacilityEndDate = facility?.facilitySnapshot?.dates?.facilityEndDate
      ? format(parseISO(facility?.facilitySnapshot?.dates?.facilityEndDate), 'dd MMMM yyyy')
      : undefined;

    return res.render('case/amendments/amendment-facility-end-date.njk', {
      dealId,
      facilityId,
      isEditable,
      dayInput: day,
      monthInput: month,
      yearInput: year,
      error,
      currentFacilityEndDate,
      user: req.session.user,
    });
  }

  const baseUrl = `/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}`;
  const fallbackUrl = `/case/${dealId}/facility/${facilityId}#amendments`;

  try {
    const payload = { facilityEndDate };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);
    return res.redirect(getNextPage(status, changeFacilityValue, baseUrl));
  } catch (err) {
    console.error('There was a problem adding the facility end date', err);
    return res.redirect(fallbackUrl);
  }
};

module.exports = { getAmendmentFacilityEndDate, postAmendmentFacilityEndDate };
