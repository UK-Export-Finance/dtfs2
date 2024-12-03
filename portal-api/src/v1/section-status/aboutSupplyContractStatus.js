module.exports = (submissionDetails, validationErrors) => {
  // some of the validation is time-sensitive so we have to be able to
  // recalculate this stuff on the fly.
  if (submissionDetails.status === 'Not started') {
    return 'Not started';
  }

  if (validationErrors && Object.keys(validationErrors).length > 0) {
    return 'Incomplete';
  }

  return 'Completed';
};
