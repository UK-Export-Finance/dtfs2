const { decode } = require('html-entities');
const { validationErrorHandler, stringToBoolean } = require('../../utils/helpers');
const { DEAL_SUBMISSION_TYPE } = require('../../../constants');

const api = require('../../services/api');

const updateSubmissionType = async (applicationId, coverType) => {
  await api.updateApplication(applicationId, { submissionType: coverType });
};

const automaticCover = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  try {
    const application = await api.getApplication(applicationId);
    const { eligibilityCriteria } = application;

    const mappedTerms = eligibilityCriteria.answers.map((answerObj) => ({
      ...answerObj,
      htmlText: decode(answerObj.htmlText),
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

const getValidationErrors = (fields, allCriteria) => {
  const receivedFields = Object.keys(fields);
  const errorsToDisplay = allCriteria.filter(
    (criterion) => !receivedFields.includes(String(criterion.id)),
  );

  return errorsToDisplay.map((error) => ({
    errRef: error.id,
    errMsg: error.errMsg,
  }));
};

const deriveCoverType = (fields, allCriteria) => {
  const receivedFields = Object.values(fields);

  if (receivedFields.length !== allCriteria.length) return undefined;
  if (receivedFields.every(((field) => field === 'true'))) return DEAL_SUBMISSION_TYPE.AIN;
  if (receivedFields.some((field) => field === 'false')) return DEAL_SUBMISSION_TYPE.MIA;

  return undefined;
};

const validateAutomaticCover = async (req, res, next) => {
  try {
    const { body, params, query } = req;
    const { applicationId } = params;
    const { saveAndReturn } = query;
    const application = await api.getApplication(applicationId);
    const { eligibilityCriteria } = application;

    // TODO: change answeres object name - misleading.
    // it's not just answers now, it also has the text and error message.
    const automaticCoverErrors = getValidationErrors(body, eligibilityCriteria.answers);
    const coverType = deriveCoverType(body, eligibilityCriteria.answers);

    if (!saveAndReturn && automaticCoverErrors.length > 0) {
      const mappedTerms = eligibilityCriteria.answers.map((answerObj) => ({
        ...answerObj,
        answer: body[String(answerObj.id)] ? stringToBoolean(body[String(answerObj.id)]) : null,
        htmlText: decode(answerObj.htmlText),
      }));

      return res.render('partials/automatic-cover.njk', {
        errors: validationErrorHandler(automaticCoverErrors, 'automatic-cover'),
        terms: mappedTerms,
        applicationId,
      });
    }

    await updateSubmissionType(applicationId, coverType);

    // copy existing answers
    const newAnswers = eligibilityCriteria.answers;

    // only update the answers that have been submitted.
    Object.keys(body).forEach((key) => {
      const answerIndex = newAnswers.findIndex((a) => a.id === Number(key));
      newAnswers[answerIndex].answer = stringToBoolean(body[key]);
    });

    const applicationUpdate = {
      eligibilityCriteria: {
        answers: newAnswers,
      },
    };

    await api.updateApplication(applicationId, applicationUpdate);

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
