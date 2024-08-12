const { isTfmFacilityEndDateFeatureFlagEnabled, AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const { format, parseISO } = require('date-fns');
const api = require('../../../api');
const bankReviewDateValidation = require('./validation/amendmentBankReviewDate.validate');

const getNextPage = (status, changeFacilityValue, baseUrl, fallbackUrl) => {
  if (status !== 200) {
    console.error('Unable to update bank review date');
    return fallbackUrl;
  }
  return changeFacilityValue ? `${baseUrl}/facility-value` : `${baseUrl}/check-answers`;
};

const getLatestSubmittedBankReviewDate = async (facility, facilityId, userToken) => {
  const { data: latestFacilityEndDateResponse } = await api.getLatestCompletedAmendmentFacilityEndDate(facilityId, userToken);

  if (latestFacilityEndDateResponse?.bankReviewDate) {
    return format(parseISO(latestFacilityEndDateResponse.bankReviewDate), 'dd MMMM yyyy');
  }

  if (latestFacilityEndDateResponse?.facilityEndDate) {
    return undefined;
  }

  if (facility?.facilitySnapshot?.dates?.bankReviewDate) {
    return format(parseISO(facility.facilitySnapshot.dates.bankReviewDate), 'dd MMMM yyyy');
  }

  return undefined;
};

const getAmendmentBankReviewDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, bankReviewDate, changeCoverEndDate, isUsingFacilityEndDate } = amendment;

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  if (!changeCoverEndDate || !isTfmFacilityEndDateFeatureFlagEnabled()) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  }

  if (isUsingFacilityEndDate == null || isUsingFacilityEndDate) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
  }

  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  const bankReviewDateDay = bankReviewDate ? format(new Date(bankReviewDate), 'dd') : '';
  const bankReviewDateMonth = bankReviewDate ? format(new Date(bankReviewDate), 'M') : '';
  const bankReviewDateYear = bankReviewDate ? format(new Date(bankReviewDate), 'yyyy') : '';

  const facility = await api.getFacility(facilityId, userToken);

  return res.render('case/amendments/amendment-bank-review-date.njk', {
    dealId,
    facilityId,
    isEditable,
    bankReviewDateDay,
    bankReviewDateMonth,
    bankReviewDateYear,
    currentBankReviewDate: await getLatestSubmittedBankReviewDate(facility, facilityId, userToken),
    user: req.session.user,
  });
};

const postAmendmentBankReviewDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, changeFacilityValue } = amendment;
  const facility = await api.getFacility(facilityId, userToken);
  const { 'bank-review-date-day': day, 'bank-review-date-month': month, 'bank-review-date-year': year } = req.body;

  const { error, bankReviewDate } = bankReviewDateValidation({ day, month, year }, facility.facilitySnapshot.dates.coverStartDate);

  if (error?.fields) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate && isTfmFacilityEndDateFeatureFlagEnabled();
    return res.render('case/amendments/amendment-bank-review-date.njk', {
      dealId,
      facilityId,
      isEditable,
      bankReviewDateDay: day,
      bankReviewDateMonth: month,
      bankReviewDateYear: year,
      error,
      currentBankReviewDate: await getLatestSubmittedBankReviewDate(facility, facilityId, userToken),
      user: req.session.user,
    });
  }

  const baseUrl = `/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}`;
  const fallbackUrl = `/case/${dealId}/facility/${facilityId}#amendments`;

  try {
    const payload = { bankReviewDate };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);
    return res.redirect(getNextPage(status, changeFacilityValue, baseUrl, fallbackUrl));
  } catch (err) {
    console.error('There was a problem adding the bank review date', err);
    return res.redirect(fallbackUrl);
  }
};

module.exports = { getAmendmentBankReviewDate, postAmendmentBankReviewDate };
