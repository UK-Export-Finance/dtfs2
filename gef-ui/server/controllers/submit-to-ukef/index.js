const CONSTANTS = require('../../constants');
const { validationErrorHandler, isNotice } = require('../../utils/helpers');
const api = require('../../services/api');

const MAX_COMMENT_LENGTH = 400;

const submitToUkef = async (req, res) => {
  const { params } = req;
  const { dealId } = params;
  try {
    return res.render('partials/submit-to-ukef.njk', {
      dealId,
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
  const { dealId } = params;
  const { comment } = body;
  console.log('GEF Application is being submitted to UKEF--TFM');
  const application = await api.getApplication(dealId);

  let checker;
  try {
    checker = await api.getUserDetails(user._id, userToken);
  } catch (err) {
    console.error('Unable to get the user details.', { err });
  }

  try {
    if (comment.length > MAX_COMMENT_LENGTH) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${MAX_COMMENT_LENGTH} characters`,
      });

      return res.render('partials/submit-to-ukef.njk', {
        dealId,
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
    await api.updateApplication(dealId, application);
    await api.setApplicationStatus(dealId, CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF);
    // TODO: DTFS2-4706 - add a route and redirect instead of rendering?
    return res.render('partials/submit-to-ukef-confirmation.njk', {
      submissionType: application.submissionType,
      isNotice: isNotice(application.submissionType),
    });
  } catch (err) {
    console.error('Unable to post submit to UKEF', { err });
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  submitToUkef,
  createSubmissionToUkef,
};
