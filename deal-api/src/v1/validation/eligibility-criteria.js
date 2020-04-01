exports.getEligibilityErrors = (criteria) => {
  const eligibiityErrors = criteria.filter((c) => typeof c.answer === 'undefined');

  const errorList = eligibiityErrors.reduce((fields, c) => (
    {
      ...fields,
      [c.id]: `Eligibility criterion ${c.id} is required`,
    }
  ), {});

  return {
    count: eligibiityErrors.length,
    errorList,
  };
};
