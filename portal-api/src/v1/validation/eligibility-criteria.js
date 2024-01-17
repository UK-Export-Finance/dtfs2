exports.getEligibilityErrors = (criteria) => {
  const errorList = criteria.reduce(
    (fields, c) => ({
      ...fields,
      [c.id]:
        typeof c.answer === 'undefined'
          ? {
              order: `${c.id}`,
              text: `Eligibility criterion ${c.id} is required`,
            }
          : {},
    }),
    {},
  );

  return {
    count: Object.values(errorList).filter((e) => e.text).length,
    errorList,
  };
};

exports.getCriteria11Errors = (criteria11Additional, criteria11IsFalse) => {
  const errorList = {
    agentName: {},
    agentAddressCountry: {},
    agentAddressLine1: {},
    agentAddressPostcode: {},
    agentAddressTown: {},
  };

  if (!criteria11IsFalse) {
    return {
      count: 0,
      errorList,
    };
  }

  if (!criteria11Additional.agentName) {
    errorList.agentName = {
      order: '11-1',
      text: "Agent's corporate name is required.",
    };
  }

  if (!criteria11Additional.agentAddressCountry || !criteria11Additional.agentAddressCountry.code) {
    errorList.agentAddressCountry = {
      order: '11-2',
      text: "Agent's country is required.",
    };
  }

  if (!criteria11Additional.agentAddressLine1) {
    errorList.agentAddressLine1 = {
      order: '11-3',
      text: "Agent's corporate address is required",
    };
  }

  if (
    criteria11Additional.agentAddressCountry &&
    criteria11Additional.agentAddressCountry.code &&
    criteria11Additional.agentAddressCountry.code !== 'GBR' &&
    !criteria11Additional.agentAddressTown
  ) {
    errorList.agentAddressTown = {
      order: '11-4',
      text: "Agent's city/town is required",
    };
  }

  if (criteria11Additional.agentAddressCountry && criteria11Additional.agentAddressCountry.code === 'GBR' && !criteria11Additional.agentAddressPostcode) {
    errorList.agentAddressPostcode = {
      order: '11-5',
      text: "Agent's corporate postcode is required",
    };
  }

  return {
    count: Object.values(errorList).filter((e) => e.text).length,
    errorList,
  };
};

exports.getEligibilityStatus = ({ criteriaComplete, ecErrorCount, dealFilesErrorCount }) => {
  const status = ecErrorCount === 0 && dealFilesErrorCount === 0 && criteriaComplete ? 'Completed' : 'Incomplete';

  return status;
};
