const FIELDS = {
  GUARANTEE_DETAILS: {
    REQUIRED_FIELDS: [
      'facilityStage',
    ],
    CONDITIONALLY_REQUIRED_FIELDS: [
      // required if facilityStage is 'Conditional'
      'ukefGuaranteeInMonths',

      // required if facilityStage is 'Unconditional'
      'bankReferenceNumber',
      'requestedCoverStartDate',
      'coverEndDate',
    ],
    OPTIONAL_FIELDS: [
      'bankReferenceNumber',
    ],
  },
};

export default FIELDS;
