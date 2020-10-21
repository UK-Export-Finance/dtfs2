const mapComments = (v1Deal) => {
  const specialConditions = v1Deal.Deal_information.Extra_fields.Special_conditions && [{
    text: v1Deal.Deal_information.Extra_fields.Special_conditions,
  }];
  console.log({ specialConditions });
  if (v1Deal.Deal_information.Extra_fields.Deal_status === 'refused') {
    return {
      ukefComments: specialConditions,
    };
  }

  return {
    specialConditions,
  };
};

module.exports = mapComments;
