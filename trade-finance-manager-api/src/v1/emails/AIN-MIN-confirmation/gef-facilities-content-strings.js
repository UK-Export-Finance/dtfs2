const GENERIC_LIST_ITEM_TITLES = {
  ukefFacilityId: 'UKEF facility ID',
  facilityStage: 'Facility stage',
  requestedCoverStartDate: 'Requested cover start date',
  coverStartDate: 'Cover start date',
  coverPercentage: 'Percentage of UKEF cover needed',
  guaranteeFee: 'Guarantee fee payable by bank',
  ukefExposure: 'UKEF exposure',
  dayCountBasis: 'Day count basis',
};

const GEF_FACILITIES_CONTENT_STRINGS = {
  HEADINGS: {
    CASH: 'Here are your cash facility details for your records',
    CONTINGENT: 'Here are your contingent facility details for your records',
  },
  LIST_ITEM_TITLES: {
    // keep the same names as the actual field names, for easy reference/usage
    CASH: {
      ukefFacilityId: GENERIC_LIST_ITEM_TITLES.ukefFacilityId,
      bankReference: 'Cash facility ID',
      hasBeenIssued: GENERIC_LIST_ITEM_TITLES.facilityStage,
      requestedCoverStartDate: GENERIC_LIST_ITEM_TITLES.requestedCoverStartDate,
      coverStartDate: GENERIC_LIST_ITEM_TITLES.coverStartDate,
      value: 'Cash facility value',
      currencyCode: 'Cash facility currency',
      coverPercentage: GENERIC_LIST_ITEM_TITLES.coverPercentage,
      interestPercentage: 'Interest margin your bank will charge',
      guaranteeFee: GENERIC_LIST_ITEM_TITLES.guaranteeFee,
      ukefExposure: GENERIC_LIST_ITEM_TITLES.ukefExposure,
      feeType: 'Premium type',
      feeFrequency: 'Premium frequency',
      dayCountBasis: GENERIC_LIST_ITEM_TITLES.dayCountBasis,
    },
    CONTINGENT: {
      ukefFacilityId: GENERIC_LIST_ITEM_TITLES.ukefFacilityId,
      bankReference: 'Bank\'s Contingent facility ID',
      hasBeenIssued: GENERIC_LIST_ITEM_TITLES.facilityStage,
      requestedCoverStartDate: GENERIC_LIST_ITEM_TITLES.requestedCoverStartDate,
      coverStartDate: GENERIC_LIST_ITEM_TITLES.coverStartDate,
      value: 'Contingent facility value',
      currencyCode: 'Contingent facility currency',
      coverPercentage: GENERIC_LIST_ITEM_TITLES.coverPercentage,
      interestPercentage: 'Risk margin your bank will charge',
      guaranteeFee: GENERIC_LIST_ITEM_TITLES.guaranteeFee,
      ukefExposure: GENERIC_LIST_ITEM_TITLES.ukefExposure,
      feeType: 'Fee type',
      feeFrequency: 'Fee frequency',
      dayCountBasis: GENERIC_LIST_ITEM_TITLES.dayCountBasis,
    },
  },
};

module.exports = GEF_FACILITIES_CONTENT_STRINGS;
