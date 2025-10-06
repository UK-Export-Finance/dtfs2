const {
  MOCK_DEAL_AIN,
  anUnissuedCashFacility,
  BANK1_MAKER1,
  DEAL_WITH_TEST_SUPPLIER_NAME_VARS,
  DEAL_WITH_TEST_MIN_SUBMISSION_TYPE_VARS,
  DEAL_WITH_TEST_BUYER_NAME_VARS,
  DEAL_WITH_TEST_MIA_SUBMISSION_TYPE_VARS,
  DEAL_WITH_ONLY_1_FACILITY_BOND_VARS,
  DEAL_WITH_ONLY_1_FACILITY_LOAN_VARS,
  DEAL_COMPLETED_YESTERDAY_VARS,
} = require('@ukef/dtfs2-common/test-helpers');

const { createMockDeal } = require('./create-mock-deal');

exports.dealsSearchDeals = () => {
  // one GEF deal
  const MOCK_GEF_DEAL_AIN = {
    ...MOCK_DEAL_AIN,
    bank: BANK1_MAKER1.bank,
  };

  // multiple BSS/EWCS deals
  const DEAL_WITH_TEST_SUPPLIER_NAME = createMockDeal(
    {
      ...DEAL_WITH_TEST_SUPPLIER_NAME_VARS,
    },
    '0030001',
  );

  const DEAL_WITH_TEST_MIN_SUBMISSION_TYPE = createMockDeal(
    {
      ...DEAL_WITH_TEST_MIN_SUBMISSION_TYPE_VARS,
    },
    '0030002',
  );

  const DEAL_WITH_TEST_BUYER_NAME = createMockDeal(
    {
      ...DEAL_WITH_TEST_BUYER_NAME_VARS,
    },
    '0030003',
  );

  const DEAL_WITH_TEST_MIA_SUBMISSION_TYPE = createMockDeal(
    {
      ...DEAL_WITH_TEST_MIA_SUBMISSION_TYPE_VARS,
    },
    '0030004',
  );

  const DEAL_WITH_ONLY_1_FACILITY_BOND = createMockDeal(
    {
      ...DEAL_WITH_ONLY_1_FACILITY_BOND_VARS,
    },
    '0030005',
  );

  const DEAL_WITH_ONLY_1_FACILITY_LOAN = createMockDeal(
    {
      ...DEAL_WITH_ONLY_1_FACILITY_LOAN_VARS,
    },
    '0030006',
  );

  // NOTE: searching by date queries multiple fields.
  // Therefore we need to set all of these fields to yesterday.
  const DEAL_COMPLETED_YESTERDAY = createMockDeal(
    {
      ...DEAL_COMPLETED_YESTERDAY_VARS,
    },
    '0030007',
  );

  const deals = [
    DEAL_WITH_TEST_SUPPLIER_NAME.deal,
    DEAL_WITH_TEST_MIN_SUBMISSION_TYPE.deal,
    DEAL_WITH_TEST_BUYER_NAME.deal,
    DEAL_WITH_TEST_MIA_SUBMISSION_TYPE.deal,
    DEAL_WITH_ONLY_1_FACILITY_BOND.deal,
    DEAL_WITH_ONLY_1_FACILITY_LOAN.deal,
    DEAL_COMPLETED_YESTERDAY.deal,
  ];

  const facilities = [
    DEAL_WITH_TEST_SUPPLIER_NAME.facilities,
    DEAL_WITH_TEST_MIN_SUBMISSION_TYPE.facilities,
    DEAL_WITH_TEST_BUYER_NAME.facilities,
    DEAL_WITH_TEST_MIA_SUBMISSION_TYPE.facilities,
    DEAL_WITH_ONLY_1_FACILITY_BOND.facilities,
    DEAL_WITH_ONLY_1_FACILITY_LOAN.facilities,
    DEAL_COMPLETED_YESTERDAY.facilities,
  ];

  return {
    deals: { BSS: deals, GEF: [MOCK_GEF_DEAL_AIN] },
    facilities: { BSS: facilities, GEF: [anUnissuedCashFacility()] },
  };
};
