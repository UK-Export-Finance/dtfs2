const { MAKER_SUBMIT_COMMENT_CHARACTER_COUNT } = require('@ukef/dtfs2-common');
const api = require('../../services/api');
const { validationErrorHandler } = require('../../utils/helpers');
const { issuedFacilityConfirmation } = require('../../utils/facility-helpers');
const Application = require('../../models/application');
const CONSTANTS = require('../../constants');

const MAX_COMMENT_LENGTH = MAKER_SUBMIT_COMMENT_CHARACTER_COUNT;

/**
 * Controller to render the application details comments page.
 * @async
 * @function getApplicationSubmission
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Renders the application details comments page.
 */
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
    maxCommentLength: MAX_COMMENT_LENGTH,
    hasIssuedFacility,
  });
};

/**
 * Controller to handle the submission of an application.
 * @async
 * @function postApplicationSubmission
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} Renders the application details submitted page or handles errors.
 */
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
    // Converts Windows-style line endings (\r\n) to Unix-style (\n)
    // This is necessary because MAX_COMMENT_LENGTH counts \n as 1 character
    const normalizedComment = comment ? comment.replace(/\r\n/g, '\n') : '';

    if (normalizedComment.length > MAX_COMMENT_LENGTH) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${MAX_COMMENT_LENGTH} characters`,
      });

      return res.render('application-details-comments.njk', {
        dealId,
        maxCommentLength: MAX_COMMENT_LENGTH,
        errors,
        comment: normalizedComment,
      });
    }

    if (normalizedComment) {
      const commentObj = {
        roles: user.roles,
        userName: user.username,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
        createdAt: Date.now(),
        comment: normalizedComment,
      };
      const comments = application.comments || [];
      comments.push(commentObj);

      await api.updateApplication({ dealId, application: { comments, editorId: user._id }, userToken });
    } else {
      await api.updateApplication({ dealId, application: { editorId: user._id }, userToken });
    }
    await api.setApplicationStatus({ dealId, status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL, userToken });
  } catch (error) {
    console.error('Unable to post application submission %o', error);
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
