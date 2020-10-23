const MANDATORY_CRITERIA = require('../../mock-data-loader/mocks/mandatoryCriteria');

const mapMandatoryCriteria = (v1Deal) => {
  const submissionDate = v1Deal.Deal_information.Extra_fields.Submission_date_AIN_and_MIA;
  if (submissionDate && submissionDate > '2020-02') {
    return MANDATORY_CRITERIA;
  }
  return [];
};

module.exports = mapMandatoryCriteria;
