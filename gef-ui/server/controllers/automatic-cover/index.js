const { decode } = require('html-entities');
const { validationErrorHandler } = require('../../utils/helpers');
const { DEAL_SUBMISSION_TYPE } = require('../../../constants');

const api = require('../../services/api');

const updateSubmissionType = async (applicationId, coverType) => {
  await api.updateApplication(applicationId, { submissionType: coverType });
};

const automaticCover = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  try {
    const { terms } = await api.getEligibilityCriteria();
    const { coverTermsId } = await api.getApplication(applicationId);
    const { details } = await api.getCoverTerms(coverTermsId);
    return res.render('partials/automatic-cover.njk', {
      selected: details,
      terms: terms.map((term) => ({
        ...term,
        htmlText: decode(term.htmlText),
      })),
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const getValidationErrors = (fields, items) => {
  const receivedFields = Object.keys(fields); // Array of received fields i.e ['coverStart']
  const errorsToDisplay = items.filter(
    (item) => !receivedFields.includes(item.id),
  );

  return errorsToDisplay.map((error) => ({
    errRef: error.id,
    errMsg: error.errMsg,
  }));
};

const deriveCoverType = (fields, items) => {
  const receivedFields = Object.values(fields);

  if (receivedFields.length !== items.length) return undefined;
  if (receivedFields.every(((field) => field === 'true'))) return DEAL_SUBMISSION_TYPE.AIN;
  if (receivedFields.some((field) => field === 'false')) return DEAL_SUBMISSION_TYPE.MIA;

  return undefined;
};

const validateAutomaticCover = async (req, res, next) => {
  try {
    const { body, params, query } = req;
    const { applicationId } = params;
    const { saveAndReturn } = query;
    const { coverTermsId } = await api.getApplication(applicationId);
    const { terms } = await api.getEligibilityCriteria();
    const automaticCoverErrors = getValidationErrors(body, terms);
    const coverType = deriveCoverType(body, terms);

    if (!saveAndReturn && automaticCoverErrors.length > 0) {
      return res.render('partials/automatic-cover.njk', {
        errors: validationErrorHandler(automaticCoverErrors, 'automatic-cover'),
        selected: body,
        terms: terms.map((term) => ({
          ...term,
          htmlText: decode(term.htmlText),
        })),
        applicationId,
      });
    }

    await updateSubmissionType(applicationId, coverType);
    await api.updateCoverTerms(coverTermsId, body);

    if (saveAndReturn) {
      return res.redirect(`/gef/application-details/${applicationId}`);
    }

    if (coverType === DEAL_SUBMISSION_TYPE.MIA) {
      return res.redirect(
        `/gef/application-details/${applicationId}/ineligible-automatic-cover`,
      );
    }
    if (coverType === DEAL_SUBMISSION_TYPE.AIN) {
      return res.redirect(
        `/gef/application-details/${applicationId}/eligible-automatic-cover`,
      );
    }

    return res.redirect(`/gef/application-details/${applicationId}`);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  automaticCover,
  validateAutomaticCover,
};
