const { DEAL_NOT_RECENT_VARS, DEAL_MOST_RECENT_VARS } = require('@ukef/dtfs2-common/test-helpers');

const { createMockDeal } = require('./create-mock-deal');

exports.dealsSortByReceivedDate = () => {
  // multiple BSS/EWCS deals
  const DEAL_NOT_RECENT = createMockDeal(
    {
      ...DEAL_NOT_RECENT_VARS,
    },
    '0030001',
  );

  const DEAL_MOST_RECENT = createMockDeal(
    {
      ...DEAL_MOST_RECENT_VARS,
    },
    '0030002',
  );

  const deals = [DEAL_NOT_RECENT.deal, DEAL_MOST_RECENT.deal];

  const facilities = [DEAL_NOT_RECENT.facilities, DEAL_MOST_RECENT.facilities];

  return {
    deals: { BSS: deals, GEF: [] },
    facilities: { BSS: facilities, GEF: [] },
  };
};
