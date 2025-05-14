const { RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT } = require('@ukef/dtfs2-common');
const { getApplication, setApplicationStatus } = require('../../services/api');
const { validationErrorHandler } = require('../../utils/helpers');
const CONSTANTS = require('../../constants');
const { addCheckerCommentsToApplication } = require('../../helpers/add-checker-comments-to-application');

const MAX_COMMENT_LENGTH = RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT;

const getReturnToMaker = async (req, res) => {
  const { params } = req;
  const { dealId } = params;
  const { userToken } = req.session;
  const { status } = await getApplication({ dealId, userToken });

  if (status !== CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL) {
    console.error('Incorrect status or permissions, redirecting to dashboard');
    return res.redirect('/dashboard');
  }

  return res.render('partials/return-to-maker.njk', { dealId, maxCommentLength: MAX_COMMENT_LENGTH });
};

const postReturnToMaker = async (req, res, next) => {
  const { params, body, session } = req;
  const { user, userToken } = session;
  const { dealId } = params;
  const { comment } = body;

  try {
    if (comment.length > MAX_COMMENT_LENGTH) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${MAX_COMMENT_LENGTH} characters`,
      });

      return res.render('partials/return-to-maker.njk', {
        dealId,
        maxCommentLength: MAX_COMMENT_LENGTH,
        errors,
        comment,
      });
    }

    await addCheckerCommentsToApplication(dealId, userToken, user._id, comment);

    await setApplicationStatus({ dealId, status: CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED, userToken });
  } catch (error) {
    return next(error);
  }

  return res.redirect('/dashboard');
};

module.exports = {
  MAX_COMMENT_LENGTH,
  getReturnToMaker,
  postReturnToMaker,
};
