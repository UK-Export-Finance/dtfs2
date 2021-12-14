const {
  getApplication, getUserDetails, updateApplication, setApplicationStatus,
} = require('../../services/api');
const { validationErrorHandler } = require('../../utils/helpers');
const { DEAL_STATUS } = require('../../constants');

const MAX_COMMENT_LENGTH = 400;

const getReturnToMaker = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;
  const { status } = await getApplication(applicationId);

  if (status !== DEAL_STATUS.BANK_CHECK) {
    // eslint-disable-next-line no-console
    console.log('Incorrect status or permissions, redirecting to dashboard');
    return res.redirect('/dashboard');
  }

  return res.render('partials/return-to-maker.njk', { applicationId, maxCommentLength: MAX_COMMENT_LENGTH });
};

const postReturnToMaker = async (req, res, next) => {
  const { params, body, session } = req;
  const { user, userToken } = session;
  const { applicationId } = params;
  const { comment } = body;
  const application = await getApplication(applicationId);
  const checker = await getUserDetails(user._id, userToken);

  try {
    if (comment.length > MAX_COMMENT_LENGTH) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${MAX_COMMENT_LENGTH} characters`,
      });

      return res.render('partials/return-to-maker.njk', {
        applicationId, maxCommentLength: MAX_COMMENT_LENGTH, errors, comment,
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
    await updateApplication(applicationId, application);
    await setApplicationStatus(applicationId, DEAL_STATUS.CHANGES_REQUIRED);
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
