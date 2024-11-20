const { getApplication, getUserDetails, updateApplication, setApplicationStatus } = require('../../services/api');
const { validationErrorHandler } = require('../../utils/helpers');
const CONSTANTS = require('../../constants');

const MAX_COMMENT_LENGTH = 400;

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
  const application = await getApplication({ dealId, userToken });
  const checker = await getUserDetails({ userId: user._id, userToken });

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

    if (comment.length > 0) {
      application.comments = [
        ...(application.comments || []),
        {
          roles: checker.roles,
          userName: checker.username,
          firstname: checker.firstname,
          surname: checker.surname,
          email: checker.email,
          createdAt: Date.now(),
          comment,
        },
      ];
    }
    application.checkerId = user._id;
    await updateApplication({ dealId, application, userToken });
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
