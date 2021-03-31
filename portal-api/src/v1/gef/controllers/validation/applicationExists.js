const { ERROR } = require('../../enums');

const requiredValidation = async (bankInternalRefName) => {
  if (bankInternalRefName && bankInternalRefName.length > 0) {
    return null;
  }
  return [{
    errCode: ERROR.MANDATORY_FIELD,
    errRef: 'bankInternalRefName',
    errMsg: 'Application Reference Name is Mandatory',
  }];
};

const doesApplicationAlreadyExist = async (collection, bankInternalRefName) => {
  const doc = await collection.findOne({ bankInternalRefName });
  if (doc) {
    return [{
      errCode: ERROR.ALREADY_EXISTS,
      errRef: 'bankInternalRefName',
      errMsg: 'The bank reference you have entered already exists.',
    }];
  }
  return null;
};

const validationApplicationCreate = async (collection, bankInternalRefName) => {
  let validationErrs = [];
  validationErrs.push(await requiredValidation(bankInternalRefName));
  validationErrs.push(await doesApplicationAlreadyExist(collection, bankInternalRefName));

  validationErrs = validationErrs.filter((el) => el !== null); // remove nulls
  return validationErrs.length === 0 ? null : validationErrs;
};

module.exports = {
  validationApplicationCreate,
};
