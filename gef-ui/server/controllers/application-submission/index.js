const api = require('../../services/api');
const { validationErrorHandler } = require('../../utils/helpers');
const { issuedFacilityConfirmation } = require('../../utils/facility-helpers');
const Application = require('../../models/application');
const CONSTANTS = require('../../constants');

const maxCommentLength = 400;

const getApplicationSubmission = async (req, res) => {
  const { params, session } = req;
  const { dealId } = params;
  const { user, userToken } = session;
  const application = await Application.findById(dealId, user, userToken);
  const applicationWithFacilities = await Application.findById(dealId, user, userToken);
  const { submissionType } = application;
  const hasIssuedFacility = issuedFacilityConfirmation(applicationWithFacilities);

  return res.render('application-details-comments.njk', {
    dealId,
    submissionType,
    maxCommentLength,
    hasIssuedFacility,
  });
};

const postApplicationSubmission = async (req, res, next) => {
  delete req.body?._csrf;
  const { params, session, body } = req;
  const { user, userToken } = session;
  const { dealId } = params;
  const { comment } = body;
  // Fetch the application with facilities to check if unissuedToIssued
  const applicationWithFacilities = await Application.findById(dealId, user, userToken);
  const application = await Application.findById(dealId, user, userToken);
  const { submissionType } = application;
  const currentStatus = application.status;
  const hasIssuedFacility = issuedFacilityConfirmation(applicationWithFacilities);

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
        roles: user.roles,
        userName: user.username,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
        createdAt: Date.now(),
        comment,
      };
      const comments = application.comments || [];
      comments.push(commentObj);

      await api.updateApplication(dealId, { comments, editorId: user._id });
    } else {
      await api.updateApplication(dealId, { editorId: user._id });
    }
    await api.setApplicationStatus(dealId, CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL);
  } catch (error) {
    console.error('Unable to post application submission', { error });
    return next(error);
  }

  return res.render('application-details-submitted.njk', {
    dealId,
    submissionType,
    status: currentStatus,
    hasIssuedFacility,
  });
};

module.exports = {
  getApplicationSubmission,
  postApplicationSubmission,
};
