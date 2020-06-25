const validate = require('./completeDealValidation-flat');

module.exports = (deal, requestedUpdate, user) => {
  let errorList = {};

  if (requestedUpdate.status === 'Abandoned Deal') {
    if (!user.roles.includes('maker')) {
      // TODO reject this?
    } else if (!requestedUpdate.comments) {
      errorList.comments = {
        order: '1',
        text: 'Comment is required when abandoning a deal.',
      };
    }
  }

  if (requestedUpdate.status === "Ready for Checker's approval") {
    if (!user.roles.includes('maker')) {
      // TODO reject this?
    } else if (!requestedUpdate.comments) {
      errorList.comments = {
        order: '1',
        text: 'Comment is required when submitting a deal for review.',
      };
    }
  }

  if (requestedUpdate.status === "Further Maker's input required") {
    if (!user.roles.includes('checker')) {
      // TODO reject this?
    } else if (!requestedUpdate.comments) {
      errorList.comments = {
        order: '1',
        text: 'Comment is required when returning a deal to maker.',
      };
    }
  }

  if (requestedUpdate.status === 'Submitted') {
    if (!user.roles.includes('checker')) {
      // TODO reject this?
    } else {
      if (!requestedUpdate.confirmSubmit) {
        errorList.confirmSubmit = {
          order: '1',
          text: 'Acceptance is required.',
        };
      }

      const validationOfExistingDeal = validate(deal);

      if (validationOfExistingDeal) {
        errorList = {
          ...validationOfExistingDeal,
          ...errorList,
        };
      }
    }
  }

  const totalErrors = Object.keys(errorList).length;

  if (totalErrors === 0) {
    return false;
  }

  return {
    count: totalErrors,
    errorList,
  };
};
