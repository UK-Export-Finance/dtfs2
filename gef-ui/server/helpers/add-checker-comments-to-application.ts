import { getApplication, getUserDetails, updateApplication } from '../services/api';

/**
 * Adds checkers comments to application
 * if comment string is provided
 * then adds comment object to application
 * updates the application with that comment
 * @param dealId - the deal id
 * @param userToken - the checkers user token
 * @param userId - the checkers user id
 * @param comment - the comment to be added
 */
export const addCheckerCommentsToApplication = async (dealId: string, userToken: string, userId: string, comment?: string) => {
  if (comment?.length) {
    const application = await getApplication({ dealId, userToken });
    const checker = await getUserDetails({ userId, userToken });

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

    application.checkerId = userId;

    await updateApplication({ dealId, application, userToken });
  }
};
