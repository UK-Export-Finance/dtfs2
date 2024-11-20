const { DEAL_TYPE } = require('@ukef/dtfs2-common');
const { validationErrorHandler, stringToBoolean } = require('../../utils/helpers');
const { DEAL_SUBMISSION_TYPE } = require('../../constants');
const { getValidationErrors, deriveCoverType } = require('./helpers');

const api = require('../../services/api');

const updateSubmissionType = async ({ dealId, coverType, userToken }) => {
  await api.updateApplication({ dealId, application: { submissionType: coverType }, userToken });
};

const automaticCover = async (req, res) => {
  const { params } = req;
  const { dealId } = params;
  const { userToken } = req.session;

  try {
    const application = await api.getApplication({ dealId, userToken });
    const { eligibility } = application;

    return res.render('partials/automatic-cover.njk', {
      criteria: eligibility.criteria,
      dealId,
    });
  } catch (error) {
    console.error('GEF-UI - Error getting automatic cover page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

const validateAutomaticCover = async (req, res, next) => {
  try {
    const { body, params, query, session } = req;
    const { dealId } = params;
    const { saveAndReturn } = query;
    const { user, userToken } = session;
    const application = await api.getApplication({ dealId, userToken });
    const { eligibility } = application;
    const { _id: editorId } = user;

    delete body._csrf;

    const automaticCoverErrors = getValidationErrors(body, eligibility.criteria);
    const coverType = deriveCoverType(body, eligibility.criteria);

    if (!saveAndReturn && automaticCoverErrors.length > 0) {
      const mappedCriteria = eligibility.criteria.map((answerObj) => {
        const submittedAnswer = body[String(answerObj.id)];

        return {
          ...answerObj,
          answer: submittedAnswer ? stringToBoolean(submittedAnswer) : null,
        };
      });

      return res.render('partials/automatic-cover.njk', {
        errors: validationErrorHandler(automaticCoverErrors, 'automatic-cover'),
        criteria: mappedCriteria,
        dealId,
      });
    }

    await updateSubmissionType({ dealId, coverType, userToken });

    // copy existing answers
    const newAnswers = eligibility.criteria;

    // only update the answers that have been submitted.
    Object.keys(body).forEach((key) => {
      const answerIndex = newAnswers.findIndex((a) => a.id === Number(key));
      newAnswers[answerIndex].answer = stringToBoolean(body[key]);
    });

    const applicationUpdate = {
      eligibility: {
        _id: eligibility?._id,
        product: DEAL_TYPE.GEF,
        version: eligibility.version,
        isInDraft: eligibility.isInDraft,
        createdAt: eligibility.createdAt,
        criteria: newAnswers,
      },
      editorId,
    };

    await api.updateApplication({ dealId, application: applicationUpdate, userToken });

    if (saveAndReturn) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    if (coverType === DEAL_SUBMISSION_TYPE.MIA) {
      return res.redirect(`/gef/application-details/${dealId}/ineligible-automatic-cover`);
    }
    if (coverType === DEAL_SUBMISSION_TYPE.AIN) {
      return res.redirect(`/gef/application-details/${dealId}/eligible-automatic-cover`);
    }

    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (error) {
    console.error('GEF-UI - Error validating automatic cover %o', error);
    return next(error);
  }
};

module.exports = {
  automaticCover,
  validateAutomaticCover,
};
