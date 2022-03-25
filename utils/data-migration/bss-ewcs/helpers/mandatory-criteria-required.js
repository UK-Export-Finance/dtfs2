const mandatoryCritiriaRequired = (v1Deal) => {
  const submissionDate = v1Deal.Deal_information.Extra_fields.Submission_date_AIN_and_MIA;
  return (submissionDate && submissionDate > '2020-02');
};

module.exports = mandatoryCritiriaRequired;
