const FIELDS = {
  ELIGIBILITY_CRITERIA: {
    REQUIRED_FIELDS: ['11', '12', '13', '14', '15', '16', '17'],
    CONDITIONALLY_REQUIRED_FIELDS: [
      // required if `criterion-11` is false
      'agentName',
      'agentAddressCountry',
      'agentAddressLine1',
      'agentAddressTown',
      'agentAddressPostcode',
    ],
  },
  SUPPORTING_DOCUMENTATION: {
    REQUIRED_FIELDS: [],
    // for Eligibility,
    // these aren't 'required fields'
    // rather 'fields that could have errors'
    // (from file upload)
    CONDITIONALLY_REQUIRED_FIELDS: [
      'exporterQuestionnaire',
      'auditedFinancialStatements',
      'yearToDateManagement',
      'financialForecasts',
      'financialInformationCommentary',
      'corporateStructure',
    ],
  },
};

module.exports = FIELDS;
