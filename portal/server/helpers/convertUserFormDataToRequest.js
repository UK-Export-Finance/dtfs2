/**
 * We receive roles as either a string or an array from the form
 * so we convert any non-array responses to an array.
 */
const handleRoles = (roles) => (Array.isArray(roles) ? [...roles] : [roles]);

/**
 * The radio buttons used can only submit strings, so we convert them to booleans.
 */
const handleIsTrusted = (isTrusted) => isTrusted === 'true';

/**
 * This function serves to convert the form data into data that our backend API accepts.
 * It is not used for validating any data as this is done on the backend.
 */
export const convertUserFormDataToRequest = (user) => {
  const newUser = { ...user };

  if (newUser.email) {
    newUser.username = newUser.email;
  }

  if (newUser.isTrusted) {
    newUser.isTrusted = handleIsTrusted(newUser.isTrusted);
  }

  newUser.roles = handleRoles(user.roles);

  return newUser;
};
