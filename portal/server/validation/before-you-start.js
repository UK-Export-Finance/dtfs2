const beforeYouStartValidation = (formBody) => {
  const { criteriaMet } = formBody;

  const errorList = {};

  if (!criteriaMet) {
    errorList.criteriaMet = {
      order: '1',
      text: 'Confirmation is required',
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

module.exports = beforeYouStartValidation;
