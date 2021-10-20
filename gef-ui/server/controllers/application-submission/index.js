const api = require('../../services/api');
const { validationErrorHandler } = require('../../utils/helpers');
const { DEAL_SUBMISSION_TYPE, PROGRESS } = require('../../../constants');
const Application = require('../../models/application');

const maxCommentLength = 400;

const getApplicationSubmission = async (req, res) => {
  const { params, session } = req;
  const { applicationId } = params;
  const { user, userToken } = session;
  const application = await Application.findById(applicationId, user, userToken);
  const isAutomaticCover = (application.submissionType === DEAL_SUBMISSION_TYPE.AIN);

  return res.render('application-details-comments.njk', { applicationId, isAutomaticCover, maxCommentLength });
};

const postApplicationSubmission = async (req, res, next) => {
  const { params, session, body } = req;
  const { user, userToken } = session;
  const { applicationId } = params;
  const { comment } = body;
  const application = await Application.findById(applicationId, user, userToken);
  const isAutomaticCover = (application.submissionType === DEAL_SUBMISSION_TYPE.AIN);
  const maker = await api.getUserDetails(application.userId, userToken);

  // TODO: DTFS2-4707 - Add some validation here to make sure that the whole application is valid
  try {
    if (comment.length > maxCommentLength) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${maxCommentLength} characters`,
      });

      return res.render('application-details-comments.njk', {
        applicationId, maxCommentLength, errors, comment,
      });
    }
    if (comment) {
      const commentObj = {
        role: 'maker', userName: maker.username, createdAt: Date.now(), comment,
      };
      const comments = application.comments || [];
      comments.push(commentObj);

      await api.updateApplication(applicationId, { comments, editorId: user._id });
    } else {
      await api.updateApplication(applicationId, { editorId: user._id });
    }
    await api.setApplicationStatus(applicationId, PROGRESS.BANK_CHECK);
  } catch (err) {
    console.error(err);
    return next(err);
  }

  return res.render('application-details-submitted.njk', { applicationId, isAutomaticCover });
};

module.exports = {
  getApplicationSubmission,
  postApplicationSubmission,
};
