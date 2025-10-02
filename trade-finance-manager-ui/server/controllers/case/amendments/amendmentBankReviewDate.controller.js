const { HttpStatusCode } = require('axios');
const { TFM_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const { format, parseISO } = require('date-fns');
const api = require('../../../api');
const { bankReviewDateValidation } = require('./validation/amendmentBankReviewDate.validate');

const getNextPage = (apiResponseStatus, changeFacilityValue, baseUrl) => {
  if (apiResponseStatus !== HttpStatusCode.Ok) {
    throw Error('Error updating amendment');
  }
  return changeFacilityValue ? `${baseUrl}/facility-value` : `${baseUrl}/check-answers`;
};

/**
 * Controller to get the amendment bank review date page
 * @async
 * @function getAmendmentBankReviewDate
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Renders the amendment bank review date page
 */
const getAmendmentBankReviewDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status: apiResponseStatus } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, bankReviewDate, changeCoverEndDate, isUsingFacilityEndDate } = amendment;
  const facility = await api.getFacility(facilityId, userToken);

  if (apiResponseStatus !== HttpStatusCode.Ok) {
    return res.redirect('/not-found');
  }

  const isFacilityEndDateEnabled = facility.facilitySnapshot.isGef;

  if (!changeCoverEndDate || !isFacilityEndDateEnabled) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  }

  if (isUsingFacilityEndDate !== false) {
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
  }

  const isEditable = amendment.status === TFM_AMENDMENT_STATUS.IN_PROGRESS;

  const enteredBankReviewDate = bankReviewDate ? parseISO(bankReviewDate) : undefined;

  const dayInput = enteredBankReviewDate ? format(enteredBankReviewDate, 'd') : '';
  const monthInput = enteredBankReviewDate ? format(enteredBankReviewDate, 'M') : '';
  const yearInput = enteredBankReviewDate ? format(enteredBankReviewDate, 'yyyy') : '';

  const currentBankReviewDate = facility?.facilitySnapshot?.dates?.bankReviewDate
    ? format(parseISO(facility?.facilitySnapshot?.dates?.bankReviewDate), 'dd MMMM yyyy')
    : undefined;

  return res.render('case/amendments/amendment-bank-review-date.njk', {
    dealId,
    facilityId,
    isEditable,
    dayInput,
    monthInput,
    yearInput,
    currentBankReviewDate,
    user: req.session.user,
  });
};

/**
 * Controller to post bank review date
 * @async
 * @function postAmendmentBankReviewDate
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Redirects to the next page
 */
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
    const isFacilityEndDateEnabled = facility.facilitySnapshot.isGef;

    const isEditable = amendment.status === TFM_AMENDMENT_STATUS.IN_PROGRESS && amendment.changeCoverEndDate && isFacilityEndDateEnabled;

    const currentBankReviewDate = facility?.facilitySnapshot?.dates?.bankReviewDate
      ? format(parseISO(facility?.facilitySnapshot?.dates?.bankReviewDate), 'dd MMMM yyyy')
      : undefined;

    return res.render('case/amendments/amendment-bank-review-date.njk', {
      dealId,
      facilityId,
      isEditable,
      dayInput: day,
      monthInput: month,
      yearInput: year,
      error,
      currentBankReviewDate,
      user: req.session.user,
    });
  }

  const baseUrl = `/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}`;
  const fallbackUrl = `/case/${dealId}/facility/${facilityId}#amendments`;

  try {
    const payload = { bankReviewDate };
    const { status: apiResponseStatus } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);

    return res.redirect(getNextPage(apiResponseStatus, changeFacilityValue, baseUrl));
  } catch (err) {
    console.error('There was a problem adding the bank review date', err);

    return res.redirect(fallbackUrl);
  }
};

module.exports = { getAmendmentBankReviewDate, postAmendmentBankReviewDate };
