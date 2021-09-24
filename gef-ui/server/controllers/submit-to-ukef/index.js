const { PROGRESS } = require('../../../constants/index');
const { validationErrorHandler } = require('../../utils/helpers');
const api = require('../../services/api');

const MAX_COMMENT_LENGTH = 400;

const submitToUkef = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;
  try {
    return res.render('partials/submit-to-ukef.njk', {
      applicationId,
      maxCommentLength: MAX_COMMENT_LENGTH,
    });
  } catch (err) {
    console.error(err);
    return res.render('partials/problem-with-service.njk');
  }
};

const createSubmissionToUkef = async (req, res) => {
  const { params, body } = req;
  const { user, userToken } = req.session;
  const { applicationId } = params;
  const { comment } = body;
  let application;
  console.error('GEF Application is being submitted to UKEF--TFM');
  try {
    application = await api.getApplication(applicationId);
  } catch (err) {
    console.error(err);
  }

  let checker;
  try {
    checker = await api.getUserDetails(user._id, userToken);
  } catch (err) {
    console.error(err);
  }

  try {
    if (comment.length > MAX_COMMENT_LENGTH) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${MAX_COMMENT_LENGTH} characters`,
      });

      return res.render('partials/submit-to-ukef.njk', {
        applicationId,
        maxCommentLength: MAX_COMMENT_LENGTH,
        errors,
        comment,
      });
    }

    if (comment.length > 0) {
      const commentObj = {
        role: 'checker',
        userName: checker.username,
        createdAt: Date.now(),
        comment,
      };
      const comments = application.comments || [];
      comments.push(commentObj);
      application.comments = comments;
    }
    // Always update with the latest checkers details.
    application.checkerId = user._id;
    await api.updateApplication(applicationId, application);
    await api.setApplicationStatus(applicationId, PROGRESS.SUBMITTED_TO_UKEF);
    // TODO: DTFS2-4706 - add a route and redirect instead of rendering?
    return res.render('partials/submit-to-ukef-confirmation.njk');
  } catch (err) {
    console.error(err);
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  submitToUkef,
  createSubmissionToUkef,
};
