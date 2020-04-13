
module.exports = (deal, requestedUpdate, user) => {
  const errorList = {};

  if (user.roles.includes('maker')) {
    if (requestedUpdate.status === 'Abandoned Deal') {
      if (!requestedUpdate.comments) {
        errorList.comments = {
          order: '1',
          text: 'Comment is required when abandoning a deal.',
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
