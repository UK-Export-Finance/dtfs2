// While the below errors aren't technically needed due to the front end, we include these to aid developers if posting directly to portal-api
const isTrustedFieldIsNotPresentError = [
  {
    isTrusted: {
      order: '1',
      text: 'Select whether the user is trusted or not.',
    },
  },
];

const isTrustedFieldIsNotValidError = [
  {
    isTrusted: {
      order: '2',
      text: 'Invalid value provided for the user isTrusted field (must be boolean).',
    },
  },
];

const validateChangeIsUpdatingIsTrusted = (change) => change?.isTrusted !== undefined;

const validateChangeIsUpdatingIsTrustedToBoolean = (change) => typeof change?.isTrusted === 'boolean';

const getIsTrustedFieldIsRequiredValidationRule = () => (user, change) => {
  let errors = [];

  if (!validateChangeIsUpdatingIsTrusted(change)) {
    errors = errors.concat(isTrustedFieldIsNotPresentError);
  }

  if (!validateChangeIsUpdatingIsTrustedToBoolean(change)) {
    errors = errors.concat(isTrustedFieldIsNotValidError);
  }

  return errors;
};

const getIsTrustedFieldIsOptionalValidationRule = () => (user, change) => {
  let errors = [];

  if (validateChangeIsUpdatingIsTrusted(change) && !validateChangeIsUpdatingIsTrustedToBoolean(change)) {
    errors = errors.concat(isTrustedFieldIsNotValidError);
  }

  return errors;
};

const getIsTrustedFieldValidationRule = ({ required }) =>
  required ? getIsTrustedFieldIsRequiredValidationRule() : getIsTrustedFieldIsOptionalValidationRule();

module.exports = getIsTrustedFieldValidationRule;
