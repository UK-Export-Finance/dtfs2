const { format, fromUnixTime, getUnixTime } = require('date-fns');
const api = require('../../../api');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');
const { formattedNumber } = require('../../../helpers/number');

const getAmendmentAnswers = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId);

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  const {
    dealId, requireUkefApproval, changeCoverEndDate, changeFacilityValue,
  } = amendment;
  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  const requestDate = format(fromUnixTime(amendment.requestDate), 'dd MMM yyyy');
  const coverEndDate = amendment?.coverEndDate ? format(fromUnixTime(amendment.coverEndDate), 'dd MMM yyyy') : '';
  const effectiveDate = amendment?.effectiveDate ? format(fromUnixTime(amendment.effectiveDate), 'dd MMM yyyy') : '';
  const value = amendment.value ? `${amendment.currency} ${formattedNumber(amendment.value)}` : '';

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
    effectiveDate,
    user: req.session.user,
  });
};

const postAmendmentAnswers = async (req, res) => {
  const { facilityId, amendmentId } = req.params;

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);
  const { dealId, requireUkefApproval } = amendment;

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
    };

    if (!requireUkefApproval) {
      payload.status = AMENDMENT_STATUS.COMPLETED;
      payload.submissionDate = getUnixTime(new Date());
      payload.automaticApprovalEmail = true;
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
    }

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
    }
    console.error('Unable to submit the amendment');
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
  } catch (err) {
    console.error('There was a problem creating the amendment approval %O', { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendmentAnswers, postAmendmentAnswers };
