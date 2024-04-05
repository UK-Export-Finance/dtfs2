import { GetUserResponse } from "../../../../types/auth/get-user-response";
import { TfmUser } from "../../../../types/db-models/tfm-users";

/**
 * handleFindByEmailsResult
 * Handle the result of "find user by emails".
 * Depending on the amount of users, return "found" and "canProceed" booleans.
 * @param {Array} users: TFM users
 * @returns {GetUserResponse}
 */
export const handleFindByEmailsResult = (users: TfmUser[]): GetUserResponse => {
  if (!users) {
    return { found: false };
  }

  if (users.length === 0) {
    console.info('Getting TFM user by emails - no user found');

    return { found: false };
  }

  if (users.length > 1) {
    console.info('Getting TFM user by emails - More than 1 matching user found: %O', users);

    return { found: true, canProceed: false };
  }

  return {
    found: true,
    canProceed: true,
    user: users[0],
  };
};

