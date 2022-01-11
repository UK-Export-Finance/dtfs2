const api = require('../../services/api');
const { validationErrorHandler } = require('../../utils/helpers');
const { hasChangedToIssued, checkCoverDateConfirmed } = require('../../utils/facility-helpers');
const Application = require('../../models/application');
const CONSTANTS = require('../../constants');

const maxCommentLength = 400;

const getApplicationSubmission = async (req, res) => {
  const { params, session } = req;
  const { dealId } = params;
  const { user, userToken } = session;
  const application = await Application.findById(dealId, user, userToken);
  const { submissionType } = application;

  return res.render('application-details-comments.njk', {
    dealId,
    submissionType,
    maxCommentLength,
    unissuedToIssued: hasChangedToIssued(application),
  });
};

const postApplicationSubmission = async (req, res, next) => {
  const { params, session, body } = req;
  const { user, userToken } = session;
  const { dealId } = params;
  const { comment } = body;
  const application = await Application.findById(dealId, user, userToken);
  const { submissionType } = application;
  const maker = await api.getUserDetails(application.userId, userToken);
  const currentStatus = application.status;

  // TODO: DTFS2-4707 - Add some validation here to make sure that the whole application is valid
  try {
    if (comment.length > maxCommentLength) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${maxCommentLength} characters`,
      });

      return res.render('application-details-comments.njk', {
        dealId, maxCommentLength, errors, comment,
      });
    }
    if (comment) {
      const commentObj = {
        role: 'maker', userName: maker.username, createdAt: Date.now(), comment,
      };
      const comments = application.comments || [];
      comments.push(commentObj);

      await api.updateApplication(dealId, { comments, editorId: user._id });
    } else {
      await api.updateApplication(dealId, { editorId: user._id });
    }
    await checkCoverDateConfirmed(application);
    await api.setApplicationStatus(dealId, CONSTANTS.DEAL_STATUS.BANK_CHECK);
  } catch (err) {
    console.error('Unable to post application submission', { err });
    return next(err);
  }

  return res.render('application-details-submitted.njk', {
    dealId,
    submissionType,
    status: currentStatus,
    unissuedToIssued: hasChangedToIssued(application),
  });
};

module.exports = {
  getApplicationSubmission,
  postApplicationSubmission,
};
