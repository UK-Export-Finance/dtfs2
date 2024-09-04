import bankInternalRefName from './bank-supply-contract-id';
import additionalRefName from './bank-supply-contract-name';
import makerObject from './maker-object';

const rules = [bankInternalRefName, additionalRefName, makerObject];

const dealRules = (deal) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](deal, errorList);
  }

  return errorList;
};

export default dealRules;
