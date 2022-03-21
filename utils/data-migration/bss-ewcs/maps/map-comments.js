const mapComments = (v1Deal) => {
  const ukefDecision = v1Deal.Deal_information.Extra_fields.Special_conditions && [{
    text: v1Deal.Deal_information.Extra_fields.Special_conditions,
  }];

  if (v1Deal.Deal_information.Extra_fields.Deal_status === 'refused') {
    return {
      ukefComments: ukefDecision,
    };
  }

  return {
    ukefDecision,
  };
};

module.exports = mapComments;
