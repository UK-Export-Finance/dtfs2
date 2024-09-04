import applyRules from './create-deal-rules';

export const createDeal = (deal) => {
  const errorList = applyRules(deal);
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
