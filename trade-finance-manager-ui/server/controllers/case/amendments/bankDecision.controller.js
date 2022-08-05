const { format, fromUnixTime, getUnixTime } = require('date-fns');

const api = require('../../../api');
const { AMENDMENT_STATUS, AMENDMENT_BANK_DECISION } = require('../../../constants/amendments');

const { userCanEditBankDecision } = require('../../helpers');
const { amendmentBankDecisionValidation } = require('./validation/amendmentBanksDecisionChoice.validate');
const { amendmentBankDecisionDateValidation } = require('./validation/amendmentBankDecisionDate.validate');

// renders first page of amendment managers decision if can be edited by user
const getAmendmentBankDecisionChoice = async (req, res) => {
  const { amendmentId, facilityId } = req.params;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;
  const isEditable = userCanEditBankDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  return res.render('case/amendments/amendment-add-banks-decision.njk', {
    amendment,
    isEditable,
    user,
  });
};

// posts the bank's decision for proceed or withdraw and redirects to next page in journey or renders template with errors
const postAmendmentBankDecisionChoice = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { banksDecision: decision } = req.body;
  const { user } = req.session;

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId) {
    return res.redirect('/not-found');
  }

  // checks amendment in progress and user can edit
  const isEditable = userCanEditBankDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  // checks that choice has been filled
  const { errorsObject, amendmentBankDecisionValidationErrors } = amendmentBankDecisionValidation(decision);

  if (amendmentBankDecisionValidationErrors.length) {
    return res.render('case/amendments/amendment-add-banks-decision.njk', {
      amendment,
      isEditable,
      user,
      errors: errorsObject.errors,
    });
  }

  try {
    // updates amendment with decision
    const payload = { bankDecision: { decision } };

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/banks-decision/received-date`);
    }

    console.error('Unable to add the bank\'s decision');
    return res.redirect(`/case/${dealId}/underwriting`);
  } catch (err) {
    console.error('There was a problem adding the bank\'s decision', { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/underwriting`);
  }
};

// get request for date bank decision was received page
const getAmendmentBankDecisionReceivedDate = async (req, res) => {
  const { amendmentId, facilityId } = req.params;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId || !amendment?.bankDecision?.decision) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;
  const isEditable = userCanEditBankDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  // gets date from stored epoch format if user has previously entered it
  const receivedDateDay = amendment?.bankDecision?.receivedDate ? format(fromUnixTime(amendment.bankDecision.receivedDate), 'dd') : '';
  const receivedDateMonth = amendment?.bankDecision?.receivedDate ? format(fromUnixTime(amendment.bankDecision.receivedDate), 'MM') : '';
  const receivedDateYear = amendment?.bankDecision?.receivedDate ? format(fromUnixTime(amendment.bankDecision.receivedDate), 'yyyy') : '';

  return res.render('case/amendments/amendment-add-banks-decision-receive-date.njk', {
    amendment,
    isEditable,
    user,
    bankDecisionDateDay: receivedDateDay,
    bankDecisionDateMonth: receivedDateMonth,
    bankDecisionDateYear: receivedDateYear,
  });
};

// posts date that decision was received or renders template with errors and redirects to next page
const postAmendmentBankDecisionReceivedDate = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { body } = req;
  const { user } = req.session;

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId || !amendment?.bankDecision?.decision) {
    return res.redirect('/not-found');
  }

  const isEditable = userCanEditBankDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  // type for id of date input on form and error message
  const type = 'bankDecisionDate';
  const message = 'Enter the date UKEF received the bank\'s decision';

  const { errorsObject, amendmentBankDecisionDateErrors, amendmentBankRequestDate } = await amendmentBankDecisionDateValidation(body, type, message);

  if (amendmentBankDecisionDateErrors.length) {
    return res.render('case/amendments/amendment-add-banks-decision-receive-date.njk', {
      amendment,
      isEditable,
      user,
      errors: errorsObject.errors,
      bankDecisionDateDay: errorsObject.amendmentBankDecisionDateDay,
      bankDecisionDateMonth: errorsObject.amendmentBankDecisionDateMonth,
      bankDecisionDateYear: errorsObject.amendmentBankDecisionDateYear,
    });
  }

  try {
    // updates amendment with receivedDate
    const payload = { bankDecision: { receivedDate: amendmentBankRequestDate } };

    // if amendment changed to withdrawn and effective date set, then change to null
    if (amendment.bankDecision.decision === AMENDMENT_BANK_DECISION.WITHDRAW && amendment?.bankDecision?.effectiveDate) {
      payload.bankDecision.effectiveDate = null;
    }

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      if (amendment.bankDecision.decision === AMENDMENT_BANK_DECISION.PROCEED) {
        return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/banks-decision/effective-date`);
      }
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/banks-decision/check-answers`);
    }

    console.error('Unable to add the bank\'s decision received date');
    return res.redirect(`/case/${dealId}/underwriting`);
  } catch (err) {
    console.error('There was a problem adding the bank\'s decision received date', { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/underwriting`);
  }
};

// gets template for effective date for banks decision
const getAmendmentBankDecisionEffectiveDate = async (req, res) => {
  const { amendmentId, facilityId } = req.params;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId || !amendment?.bankDecision?.decision || !amendment?.bankDecision?.receivedDate) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;
  const isEditable = userCanEditBankDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  // converts date from epoch format to day month year if in database
  const effectiveDateDay = amendment?.bankDecision?.effectiveDate ? format(fromUnixTime(amendment.bankDecision.effectiveDate), 'dd') : '';
  const effectiveDateMonth = amendment?.bankDecision?.effectiveDate ? format(fromUnixTime(amendment.bankDecision.effectiveDate), 'MM') : '';
  const effectiveDateYear = amendment?.bankDecision?.effectiveDate ? format(fromUnixTime(amendment.bankDecision.effectiveDate), 'yyyy') : '';

  return res.render('case/amendments/amendment-add-banks-decision-effective-date.njk', {
    amendment,
    isEditable,
    user,
    bankDecisionDateDay: effectiveDateDay,
    bankDecisionDateMonth: effectiveDateMonth,
    bankDecisionDateYear: effectiveDateYear,
  });
};

// posts effective date of bank decision and redirects to next page or renders template with errors
const postAmendmentBankDecisionEffectiveDate = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { body } = req;
  const { user } = req.session;

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId || !amendment?.bankDecision?.decision) {
    return res.redirect('/not-found');
  }

  const isEditable = userCanEditBankDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  const type = 'bankDecisionDate';
  const message = 'Enter the date the amendment will be effective from';

  const { errorsObject,
    amendmentBankDecisionDateErrors,
    amendmentBankRequestDate: amendmentBankEffectiveDate } = await amendmentBankDecisionDateValidation(body, type, message);

  if (amendmentBankDecisionDateErrors.length) {
    return res.render('case/amendments/amendment-add-banks-decision-effective-date.njk', {
      amendment,
      isEditable,
      user,
      errors: errorsObject.errors,
      bankDecisionDateDay: errorsObject.amendmentBankDecisionDateDay,
      bankDecisionDateMonth: errorsObject.amendmentBankDecisionDateMonth,
      bankDecisionDateYear: errorsObject.amendmentBankDecisionDateYear,
    });
  }

  try {
    const payload = { bankDecision: { effectiveDate: amendmentBankEffectiveDate } };

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/banks-decision/check-answers`);
    }

    console.error('Unable to add the bank\'s decision efective date');
    return res.redirect(`/case/${dealId}/underwriting`);
  } catch (err) {
    console.error('There was a problem adding the bank\'s decision effective date', { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/underwriting`);
  }
};

// gets check your answers page for bank decision
const getAmendmentBankDecisionAnswers = async (req, res) => {
  const { amendmentId, facilityId } = req.params;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId || !amendment?.bankDecision?.decision) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;
  const isEditable = userCanEditBankDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

  // formats received and effective date from epoch
  const receivedDateFormatted = amendment.bankDecision?.receivedDate ? format(fromUnixTime(amendment.bankDecision.receivedDate), 'dd MMM yyyy') : '';
  const effectiveDateFormatted = amendment.bankDecision?.effectiveDate ? format(fromUnixTime(amendment.bankDecision.effectiveDate), 'dd MMM yyyy') : '';

  return res.render('case/amendments/amendment-add-banks-decision-check-answers.njk', {
    amendment,
    isEditable,
    user,
    decision: amendment.bankDecision.decision,
    receivedDate: receivedDateFormatted,
    effectiveDate: effectiveDateFormatted,
  });
};

// posts bank decision and completes process by changing status to complete and redirects to underwriting page
const postAmendmentBankDecisionAnswers = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId || !amendment?.bankDecision?.decision) {
    return res.redirect('/not-found');
  }

  try {
    // updates amendment with status to completed and submitted flag as true on bank decision
    const payload = {
      status: AMENDMENT_STATUS.COMPLETED,
      bankDecision: {
        submitted: true,
        banksDecisionEmail: true,
        submittedAt: getUnixTime(new Date()),
        submittedBy: {
          _id: req?.session?.user?._id,
          username: req?.session?.user?.username,
          name: `${req?.session?.user?.firstName} ${req?.session?.user?.lastName}`,
          email: req?.session?.user?.email,
        },
      },
      // flag to update tfm-deals last updated
      updateTfmLastUpdated: true,
    };

    await api.updateAmendment(facilityId, amendmentId, payload);

    return res.redirect(`/case/${dealId}/underwriting`);
  } catch (err) {
    console.error('There was a problem submitting the bank\'s decision', { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/underwriting`);
  }
};

module.exports = {
  getAmendmentBankDecisionChoice,
  postAmendmentBankDecisionChoice,
  getAmendmentBankDecisionReceivedDate,
  postAmendmentBankDecisionReceivedDate,
  getAmendmentBankDecisionEffectiveDate,
  postAmendmentBankDecisionEffectiveDate,
  getAmendmentBankDecisionAnswers,
  postAmendmentBankDecisionAnswers,
};
