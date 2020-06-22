module.exports = (submissionDetails, validationErrors) => {
  // TODO this all -works- but we started persisting status and later discovered
  // that some of the validation is time-sensitive so we have to be able to
  // recalculate this stuff on the fly... this leaves us with a
  // 'partially persistent' state which we should probably mend at some point..
  if (submissionDetails.status === 'Not Started') {
    return 'Not Started';
  }

  if (validationErrors && Object.keys(validationErrors).length > 0) {
    return 'Incomplete';
  }

  return 'Completed';
};
