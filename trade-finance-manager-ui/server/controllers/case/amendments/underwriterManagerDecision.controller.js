const { format, fromUnixTime } = require('date-fns');
const api = require('../../../api');

const { userCanEditManagersDecision } = require('../../helpers');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');
const { amendmentUnderwriterManagerDecisionValidation } = require('./validation/amendmentUnderwriterManagerDecision.validate');
const { formattedNumber } = require('../../../helpers/number');

/**
 * @param {*} req
 * @param {*} res
 * renders first page of amendment managers decision if can be edited by user
 */
const getAmendmentAddUnderwriterManagersDecisionCoverEndDate = async (req, res) => {
  const { amendmentId, facilityId } = req.params;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;
  const isEditable = userCanEditManagersDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  if (amendment?.changeCoverEndDate && amendment?.coverEndDate) {
    amendment.currentCoverEndDate = format(fromUnixTime(amendment.currentCoverEndDate), 'dd MMMM yyyy');
    amendment.coverEndDate = format(fromUnixTime(amendment.coverEndDate), 'dd MMMM yyyy');
  }

  return res.render('case/amendments/amendment-add-managers-decision-cover-end-date.njk', {
    amendment,
    isEditable,
    user,
  });
};

const postAmendmentAddUnderwriterManagersDecisionCoverEndDate = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { underwriterManagerDecisionCoverEndDate: decision } = req.body;
  const { user } = req.session;

  const { errorsObject, amendmentUnderwriterManagerValidationErrors } = amendmentUnderwriterManagerDecisionValidation(decision, 'coverEndDate');
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (amendmentUnderwriterManagerValidationErrors.length) {
    const isEditable = userCanEditManagersDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;
    if (amendment?.changeCoverEndDate && amendment?.coverEndDate) {
      amendment.currentCoverEndDate = format(fromUnixTime(amendment.currentCoverEndDate), 'dd MMMM yyyy');
      amendment.coverEndDate = format(fromUnixTime(amendment.coverEndDate), 'dd MMMM yyyy');
    }

    return res.render('case/amendments/amendment-add-managers-decision-cover-end-date.njk', {
      amendment,
      isEditable,
      user,
      errors: errorsObject.errors,
    });
  }

  try {
    const payload = { ukefDecision: { coverEndDate: decision } };

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      if (amendment.changeFacilityValue) {
        return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value/managers-decision`);
      }
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/request-approval`);
    }
    console.error('Unable to add the underwriter managers decision');
    return res.redirect(`/case/${dealId}/underwriting`);
  } catch (err) {
    console.error('There was a problem adding the manager\'s decision %O', { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/underwriting`);
  }
};

const getAmendmentAddUnderwriterManagersFacilityValue = async (req, res) => {
  const { amendmentId, facilityId } = req.params;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;
  const isEditable = userCanEditManagersDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  if (amendment?.changeFacilityValue && amendment?.value) {
    amendment.value = amendment?.value ? `${amendment.currency} ${formattedNumber(amendment.value)}` : null;
    amendment.currentValue = amendment?.currentValue ? `${amendment.currency} ${formattedNumber(amendment.currentValue)}` : null;
  }

  return res.render('case/amendments/amendment-add-managers-decision-facility-value.njk', {
    amendment,
    isEditable,
    user,
  });
};

const postAmendmentAddUnderwriterManagersFacilityValue = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { underwriterManagerDecisionFacilityValue: decision } = req.body;
  const { user } = req.session;

  const { errorsObject, amendmentUnderwriterManagerValidationErrors } = amendmentUnderwriterManagerDecisionValidation(decision, 'value');
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (amendmentUnderwriterManagerValidationErrors.length) {
    const isEditable = userCanEditManagersDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;
    if (amendment?.changeFacilityValue && amendment?.value) {
      amendment.value = amendment?.value ? `${amendment.currency} ${formattedNumber(amendment.value)}` : null;
      amendment.currentValue = amendment?.currentValue ? `${amendment.currency} ${formattedNumber(amendment.currentValue)}` : null;
    }

    return res.render('case/amendments/amendment-add-managers-decision-facility-value.njk', {
      amendment,
      isEditable,
      user,
      errors: errorsObject.errors,
    });
  }

  try {
    const payload = { ukefDecision: { value: decision } };

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/managers-conditions`);
    }
    console.error('Unable to add the underwriter managers decision');
    return res.redirect(`/case/${dealId}/underwriting`);
  } catch (err) {
    console.error('There was a problem adding the manager\'s decision %O', { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/underwriting`);
  }
};

module.exports = {
  getAmendmentAddUnderwriterManagersDecisionCoverEndDate,
  postAmendmentAddUnderwriterManagersDecisionCoverEndDate,
  getAmendmentAddUnderwriterManagersFacilityValue,
  postAmendmentAddUnderwriterManagersFacilityValue,
};
