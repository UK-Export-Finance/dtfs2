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
    const application = await api.getApplication(applicationId);
    const { eligibilityCriteria } = application;

    const mappedTerms = terms.map((term) => ({
      ...term,
      answer: eligibilityCriteria.answers.length ? eligibilityCriteria.answers.find((answer) => answer.id === term.id).answer : null,
      htmlText: decode(term.htmlText),
    }));

    return res.render('partials/automatic-cover.njk', {
      terms: mappedTerms,
      applicationId,
    });
  } catch (err) {
    console.error(err);
    return res.render('partials/problem-with-service.njk');
  }
};

const getValidationErrors = (fields, items) => {
  const receivedFields = Object.keys(fields); // Array of received fields i.e ['coverStart']
  const errorsToDisplay = items.filter(
    (item) => !receivedFields.includes(String(item.id)),
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

    // copy existing answers
    const { eligibilityCriteria } = await api.getApplication(applicationId);
    const newAnswers = eligibilityCriteria.answers;

    // only update the answers that have been submitted.
    Object.keys(body).forEach((key) => {
      const answerIndex = newAnswers.findIndex((a) => a.id === Number(key));
      newAnswers[answerIndex].answer = Boolean(body[key]);
    });

    const applicationUpdate = {
      eligibilityCriteria: {
        answers: newAnswers,
      },
    };

    const application = await api.updateApplication(applicationId, applicationUpdate);

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
    console.error(err);
    return next(err);
  }
};

module.exports = {
  automaticCover,
  validateAutomaticCover,
};
