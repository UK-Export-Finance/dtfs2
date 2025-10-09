const {
  DEAL_WITH_ONLY_1_FACILITY_BOND_VARS,
  DEAL_WITH_ONLY_1_FACILITY_LOAN_VARS,
  DEAL_WITH_1_LOAN_AND_BOND_FACILITIES_VARS,
} = require('@ukef/dtfs2-common/test-helpers');

const { createMockDeal } = require('./create-mock-deal');

exports.dealsSortByProduct = () => {
  // multiple BSS/EWCS deals
  const DEAL_WITH_ONLY_1_FACILITY_BOND = createMockDeal(
    {
      ...DEAL_WITH_ONLY_1_FACILITY_BOND_VARS,
    },
    '0030001',
  );

  const DEAL_WITH_ONLY_1_FACILITY_LOAN = createMockDeal(
    {
      ...DEAL_WITH_ONLY_1_FACILITY_LOAN_VARS,
    },
    '0030002',
  );

  const DEAL_WITH_1_LOAN_AND_BOND_FACILITIES = createMockDeal(
    {
      ...DEAL_WITH_1_LOAN_AND_BOND_FACILITIES_VARS,
    },
    '0030003',
  );

  const deals = [DEAL_WITH_ONLY_1_FACILITY_BOND.deal, DEAL_WITH_ONLY_1_FACILITY_LOAN.deal, DEAL_WITH_1_LOAN_AND_BOND_FACILITIES.deal];

  const facilities = [DEAL_WITH_ONLY_1_FACILITY_BOND.facilities, DEAL_WITH_ONLY_1_FACILITY_LOAN.facilities, DEAL_WITH_1_LOAN_AND_BOND_FACILITIES.facilities];

  return {
    deals: { BSS: deals, GEF: [] },
    facilities: { BSS: facilities, GEF: [] },
  };
};
