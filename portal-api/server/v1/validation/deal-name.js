module.exports = (id, requestedUpdate) => {
  const errorList = {};

  if (!requestedUpdate) {
    errorList.comments = {
      order: '1',
      text: 'A value is required.',
    };
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
