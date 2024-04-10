/**
 * Determines if a user is a super user.
 *
 * @param {Object} user - The user object.
 * @returns {boolean} - True if the user is a super user, false otherwise.
 */
const isSuperUser = (user) => user?.bank?.id === '*';

/**
 * Determines if a user has access to a specific deal.
 *
 * @param {Object} user - The user object.
 * @param {Object} deal - The deal object.
 * @returns {boolean} - True if the user has access, false otherwise.
 */
const userHasAccessTo = (user, deal) => {
  // super-users can get at anything
  if (isSuperUser(user)) {
    return true;
  }

  // if we've somehow got a user that doesn't have bank details; reject
  if (!user?.bank || !user?.bank?.id) {
    return false;
  }

  // if we've somehow got a deal that doesn't have an owning bank; reject
  // this one is up for some debate but i figure better safe than sorry...
  if (!deal?.details || !deal?.bank || !deal?.eligibility) {
    return false;
  }

  // ownership check..
  return user.bank.id === deal.bank.id;
};

/**
 * Determines if a user has access to a specific deal.
 *
 * @param {Object} user - The user object.
 * @param {Object} deal - The deal object.
 * @returns {boolean} - True if the user has access, false otherwise.
 */
const userOwns = (user, deal) => user._id.toString() === deal.maker._id.toString();

module.exports = {
  isSuperUser,
  userHasAccessTo,
  userOwns,
};
