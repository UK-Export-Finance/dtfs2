import {
  getApplication, getUserDetails, updateApplication, setApplicationStatus,
} from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';
import { PROGRESS } from '../../../constants';

export const MAX_COMMENT_LENGTH = 400;

export const getReturnToMaker = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;
  const { status } = await getApplication(applicationId);

  if (status !== PROGRESS.BANK_CHECK) {
    console.log('Incorrect status or permissions, redirecting to dashboard');
    return res.redirect('/dashboard/gef/');
  }

  return res.render('partials/return-to-maker.njk', { applicationId, maxCommentLength: MAX_COMMENT_LENGTH });
};

export const postReturnToMaker = async (req, res, next) => {
  const { params, body } = req;
  const { userToken } = req.session;
  const { applicationId } = params;
  const { comment } = body;
  const application = await getApplication(applicationId);
  const checker = await getUserDetails(application.userId, userToken);

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

    const comments = [
      ...(application.comments || []),
      {
        role: 'checker',
        userName: checker.username,
        createdAt: Date.now(),
        comment,
      },
    ];

    application.comments = comments;

    await updateApplication(applicationId, application);
    await setApplicationStatus(applicationId, PROGRESS.CHANGES_REQUIRED);
  } catch (err) {
    return next(err);
  }

  return res.redirect('/dashboard/gef/');
};

export default {
  getReturnToMaker,
  postReturnToMaker,
};
