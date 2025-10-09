const { DEAL_BUYER_A_VARS, DEAL_BUYER_B_VARS } = require('@ukef/dtfs2-common/test-helpers');

const { createMockDeal } = require('./create-mock-deal');

exports.dealsSortByBuyer = () => {
  // multiple BSS/EWCS deals
  const DEAL_BUYER_A = createMockDeal(
    {
      ...DEAL_BUYER_A_VARS,
    },
    '0030001',
  );

  const DEAL_BUYER_B = createMockDeal(
    {
      ...DEAL_BUYER_B_VARS,
    },
    '0030002',
  );

  const deals = [DEAL_BUYER_A.deal, DEAL_BUYER_B.deal];

  const facilities = [DEAL_BUYER_A.facilities, DEAL_BUYER_B.facilities];

  return {
    deals: { BSS: deals, GEF: [] },
    facilities: { BSS: facilities, GEF: [] },
  };
};
