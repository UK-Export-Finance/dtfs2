const { DEAL_CONFIRMED_VARS, DEAL_APPLICATION_VARS } = require('@ukef/dtfs2-common/test-helpers');

const { createMockDeal } = require('./create-mock-deal');

exports.dealsSortByStage = () => {
  // multiple BSS/EWCS deals
  const DEAL_CONFIRMED = createMockDeal(
    {
      ...DEAL_CONFIRMED_VARS,
    },
    '0030001',
  );

  const DEAL_APPLICATION = createMockDeal(
    {
      ...DEAL_APPLICATION_VARS,
    },
    '0030002',
  );
  const deals = [DEAL_CONFIRMED.deal, DEAL_APPLICATION.deal];

  const facilities = [DEAL_CONFIRMED.facilities, DEAL_APPLICATION.facilities];

  return {
    deals: { BSS: deals, GEF: [] },
    facilities: { BSS: facilities, GEF: [] },
  };
};
