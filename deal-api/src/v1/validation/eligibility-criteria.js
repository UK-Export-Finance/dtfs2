exports.getEligibilityErrors = (criteria) => {
  const errorList = criteria.reduce((fields, c) => (
    {
      ...fields,
      [c.id]: typeof c.answer === 'undefined' ? {
        order: `${c.id}`,
        text: `Eligibility criterion ${c.id} is required`,
      } : {},
    }
  ), {});

  return {
    count: Object.values(errorList).filter((e) => e.text).length,
    errorList,
  };
};

exports.getCriteria11Errors = ((criteria11Additional, criteria11IsFalse) => {
  const errorList = {
    'agent-name': {},
    'agent-country': {},
    'agent-address-line-1': {},
    'agent-postcode': {},
  };

  if (!criteria11IsFalse) {
    return {
      count: 0,
      errorList,
    };
  }


  if (!criteria11Additional.agentName) {
    errorList['agent-name'] = {
      order: '11-1',
      text: 'Agent\'s corporate name is required.',
    };
  }

  if (!criteria11Additional.agentCountry) {
    errorList['agent-country'] = {
      order: '11-2',
      text: 'Agent\'s country is required.',
    };
  }

  if (!criteria11Additional.agentAddress1) {
    errorList['agent-address-line-1'] = {
      order: '11-3',
      text: 'Agent\'s corporate address is required',
    };
  }

  if (!criteria11Additional.agentPostcode) {
    errorList['agent-postcode'] = {
      order: '11-4',
      text: 'Agent\'s corporate postcode is required',
    };
  }

  return {
    count: Object.values(errorList).filter((e) => e.text).length,
    errorList,
  };
});
