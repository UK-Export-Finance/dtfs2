import applyRules from './create-facility-rules';

export const createFacility = (facility) => {
  const errorList = applyRules(facility);
  const totalErrors = Object.keys(errorList).length;

  if (totalErrors === 0) {
    return {
      count: totalErrors,
    };
  }

  return {
    count: totalErrors,
    errorList,
  };
};
