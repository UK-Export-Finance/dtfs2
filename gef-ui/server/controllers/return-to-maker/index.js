const {
  getApplication, getUserDetails, updateApplication, setApplicationStatus,
} = require('../../services/api');
const { validationErrorHandler } = require('../../utils/helpers');
const CONSTANTS = require('../../constants');

const MAX_COMMENT_LENGTH = 400;

const getReturnToMaker = async (req, res) => {
  const { params } = req;
  const { dealId } = params;
  const { status } = await getApplication(dealId);

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
  const application = await getApplication(dealId);
  const checker = await getUserDetails(user._id, userToken);

  try {
    if (comment.length > MAX_COMMENT_LENGTH) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${MAX_COMMENT_LENGTH} characters`,
      });

      return res.render('partials/return-to-maker.njk', {
        dealId, maxCommentLength: MAX_COMMENT_LENGTH, errors, comment,
      });
    }

    if (comment.length > 0) {
      application.comments = [
        ...(application.comments || []),
        {
          role: 'checker',
          userName: checker.username,
          createdAt: Date.now(),
          comment,
        },
      ];
    }
    application.checkerId = user._id;
    await updateApplication(dealId, application);
    await setApplicationStatus(dealId, CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED);
  } catch (err) {
    return next(err);
  }

  return res.redirect('/dashboard');
};

module.exports = {
  MAX_COMMENT_LENGTH,
  getReturnToMaker,
  postReturnToMaker,
};
