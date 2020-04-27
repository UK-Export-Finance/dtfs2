exports.getBondErrors = (bond) => {
  const {
    bondType,
    bondStage,
  } = bond;

  const errorList = {};

  if (!bondType) {
    errorList.bondType = {
      order: '1',
      text: 'Bond type is required',
    };
  }

  if (!bondStage) {
    errorList.bondStage = {
      order: '2',
      text: 'Bond stage is required',
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
