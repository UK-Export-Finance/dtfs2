/**
    The objective of the validUkefId function is to determine whether a given UKEF ID
    is valid or not. It takes a string as input and returns either the UKEF ID if it is valid or false if it is not.

Inputs:
    ukefId: a string representing the UKEF ID to be validated

Flow:
    Parse the input string to an integer using parseInt function
    Check if the parsed integer is NaN, if yes, return false
    Define a regular expression to match the UKEF ID format
    Test the input string against the regular expression, if it does not match, return false
    Return the input string as the UKEF ID if it is valid

Outputs:
    false: if the input string is not a valid UKEF ID
    ukefId: if the input string is a valid UKEF ID

Additional aspects:
    The function uses parseInt to convert the input string to an integer, which can cause unexpected results if the input string contains non-numeric characters
    The regular expression used to validate the UKEF ID format requires exactly 10 digits, which may not be appropriate for all use cases
    The function does not modify the input string, it only validates it and returns it if it is valid.

 * Ascertain if UKEF ID is valid or not
 * @param ukefId String UKEF ID
 * @returns Boolean|String False if invalid, UKEF ID otherwise
 */
export const validUkefId = (ukefId: string) => {
  const id = parseInt(ukefId, 10);

  if (Number.isNaN(id)) {
    return false;
  }

  const regex = /^[0-9]{10}$/;

  if (!regex.test(ukefId)) {
    return false;
  }

  return ukefId;
};
