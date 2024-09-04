import type from './type';
import dealId from './associated-deal-id';

const rules = [type, dealId];

const applyRules = (facility) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](facility, errorList);
  }

  return errorList;
};

export default applyRules;
