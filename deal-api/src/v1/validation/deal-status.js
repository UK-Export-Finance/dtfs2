
module.exports = (deal, requestedUpdate, user) => {
  const errorList = {};

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

  const totalErrors = Object.keys(errorList).length;

  if (totalErrors === 0) {
    return false;
  }

  return {
    count: totalErrors,
    errorList,
  };
};
