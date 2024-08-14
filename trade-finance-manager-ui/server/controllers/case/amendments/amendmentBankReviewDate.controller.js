const { HttpStatusCode } = require('axios');
const { isTfmFacilityEndDateFeatureFlagEnabled, AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const { format, parseISO } = require('date-fns');
const api = require('../../../api');
const { bankReviewDateValidation } = require('./validation/amendmentBankReviewDate.validate');

const getNextPage = (status, changeFacilityValue, baseUrl, fallbackUrl) => {
  if (status !== HttpStatusCode.Ok) {
    console.error('Unable to update bank review date');
    return fallbackUrl;
  }
  return changeFacilityValue ? `${baseUrl}/facility-value` : `${baseUrl}/check-answers`;
};

const getAmendmentBankReviewDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status: apiResponseStatus } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, bankReviewDate, changeCoverEndDate, isUsingFacilityEndDate } = amendment;
  const facility = await api.getFacility(facilityId, userToken);

  if (apiResponseStatus !== HttpStatusCode.Ok) {
    return res.redirect('/not-found');
  }

  if (!changeCoverEndDate || !isTfmFacilityEndDateFeatureFlagEnabled()) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  }

  if (isUsingFacilityEndDate !== false) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
  }

  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  const bankReviewDateDay = bankReviewDate ? format(new Date(bankReviewDate), 'd') : '';
  const bankReviewDateMonth = bankReviewDate ? format(new Date(bankReviewDate), 'M') : '';
  const bankReviewDateYear = bankReviewDate ? format(new Date(bankReviewDate), 'yyyy') : '';

  const currentBankReviewDate = facility?.facilitySnapshot?.dates?.bankReviewDate
    ? format(parseISO(facility?.facilitySnapshot?.dates?.bankReviewDate), 'dd MMMM yyyy')
    : undefined;

  return res.render('case/amendments/amendment-bank-review-date.njk', {
    dealId,
    facilityId,
    isEditable,
    bankReviewDateDay,
    bankReviewDateMonth,
    bankReviewDateYear,
    currentBankReviewDate,
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

  const coverStartDate = new Date(Number(facility?.facilitySnapshot?.dates?.coverStartDate));

  const { error, bankReviewDate } = bankReviewDateValidation({ day, month, year }, coverStartDate);

  if (error?.fields) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate && isTfmFacilityEndDateFeatureFlagEnabled();
    const currentBankReviewDate = facility?.facilitySnapshot?.dates?.bankReviewDate
      ? format(parseISO(facility?.facilitySnapshot?.dates?.bankReviewDate), 'dd MMMM yyyy')
      : undefined;

    return res.render('case/amendments/amendment-bank-review-date.njk', {
      dealId,
      facilityId,
      isEditable,
      bankReviewDateDay: day,
      bankReviewDateMonth: month,
      bankReviewDateYear: year,
      error,
      currentBankReviewDate,
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
