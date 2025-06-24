const { format, fromUnixTime, getUnixTime } = require('date-fns');
const { TFM_AMENDMENT_STATUS, createAmendmentReferenceNumber, formattedNumber, convertUnixTimestampWithoutMilliseconds } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const api = require('../../../api');

const getAmendmentAnswers = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, requireUkefApproval, changeCoverEndDate, changeFacilityValue } = amendment;

  const facility = await api.getFacility(facilityId, userToken);

  if (status !== HttpStatusCode.Ok) {
    return res.redirect('/not-found');
  }

  const isEditable = amendment.status === TFM_AMENDMENT_STATUS.IN_PROGRESS;
  const requestDate = format(fromUnixTime(amendment.requestDate), 'dd MMM yyyy');

  const formattedCoverEndDate = amendment?.coverEndDate ? convertUnixTimestampWithoutMilliseconds(amendment.coverEndDate) : null;

  const coverEndDate = formattedCoverEndDate ? format(fromUnixTime(formattedCoverEndDate), 'dd MMM yyyy') : '';
  const isUsingFacilityEndDate = amendment?.isUsingFacilityEndDate;
  const facilityEndDate = amendment?.facilityEndDate && amendment?.isUsingFacilityEndDate ? format(new Date(amendment.facilityEndDate), 'dd MMM yyyy') : '';
  const bankReviewDate =
    amendment?.bankReviewDate && amendment?.isUsingFacilityEndDate === false ? format(new Date(amendment.bankReviewDate), 'dd MMM yyyy') : '';
  const effectiveDate = amendment?.effectiveDate ? format(fromUnixTime(amendment.effectiveDate), 'dd MMM yyyy') : '';
  const value = amendment.value ? `${amendment.currency} ${formattedNumber(amendment.value)}` : '';
  const isFacilityEndDateEnabled = facility.facilitySnapshot.isGef;

  return res.render('case/amendments/amendment-answers.njk', {
    dealId,
    facilityId,
    amendmentId,
    isEditable,
    value,
    changeFacilityValue,
    requireUkefApproval,
    requestDate,
    coverEndDate,
    changeCoverEndDate,
    isUsingFacilityEndDate,
    facilityEndDate,
    bankReviewDate,
    effectiveDate,
    showFacilityEndDate: isFacilityEndDateEnabled,
    user: req.session.user,
  });
};

const postAmendmentAnswers = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId, requireUkefApproval } = amendment;
  const facility = await api.getFacility(facilityId, userToken);
  const { ukefFacilityId } = facility.facilitySnapshot;
  const {
    response: { data: amendmentsOnDeal },
  } = await api.getApprovedAmendments(dealId, userToken);
  const amendmentsOnFacility = amendmentsOnDeal.filter((amendmentOnDeal) => amendmentOnDeal.facilityId.toString() === facilityId);
  const referenceNumber = createAmendmentReferenceNumber(amendmentsOnFacility, ukefFacilityId);

  try {
    const payload = {
      submittedByPim: true,
      submittedAt: getUnixTime(new Date()),
      value: amendment.value,
      ukefExposure: amendment.ukefExposure,
      coverEndDate: amendment.coverEndDate,
      createTasks: true,
      requireUkefApproval: amendment.requireUkefApproval,
      sendFirstTaskEmail: true,
      referenceNumber,
    };

    const isFacilityEndDateEnabled = facility.facilitySnapshot.isGef;

    if (isFacilityEndDateEnabled) {
      payload.isUsingFacilityEndDate = amendment.isUsingFacilityEndDate;
      if (amendment.isUsingFacilityEndDate) {
        payload.facilityEndDate = amendment.facilityEndDate;
        payload.bankReviewDate = null;
      }
      if (amendment.isUsingFacilityEndDate === false) {
        payload.bankReviewDate = amendment.bankReviewDate;
        payload.facilityEndDate = null;
      }
    }

    if (!requireUkefApproval) {
      payload.status = TFM_AMENDMENT_STATUS.COMPLETED;
      payload.submissionDate = getUnixTime(new Date());
      payload.automaticApprovalEmail = true;
      // flag to update tfm-deals last updated
      payload.updateTfmLastUpdated = true;
    }

    // if the facility value should not be changed, then re-set the `value` properties to `null`
    if (!amendment.changeFacilityValue) {
      payload.value = null;
      payload.currentValue = null;
      payload.currency = null;
      payload.ukefExposure = null;
    }

    // if the cover end date should not be changed, then re-set the `coverEndDate` properties to `null`
    if (!amendment.changeCoverEndDate) {
      payload.coverEndDate = null;
      payload.currentCoverEndDate = null;
      payload.isUsingFacilityEndDate = null;
      payload.facilityEndDate = null;
      payload.bankReviewDate = null;
    }

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
    }
    console.error('Unable to submit the amendment');
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
  } catch (error) {
    console.error('There was a problem creating the amendment approval %o', error);
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendmentAnswers, postAmendmentAnswers };
