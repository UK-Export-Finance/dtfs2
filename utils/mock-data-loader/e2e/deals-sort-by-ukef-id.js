const { createMockDeal } = require('./create-mock-deal');

exports.dealsSortByUkefId = () => {
  // multiple BSS/EWCS deals
  const DEAL_CONFIRMED = createMockDeal({}, '0030001');

  const DEAL_APPLICATION = createMockDeal({}, '0030002');
  const deals = [DEAL_CONFIRMED.deal, DEAL_APPLICATION.deal];

  const facilities = [DEAL_CONFIRMED.facilities, DEAL_APPLICATION.facilities];

  return {
    deals: { BSS: deals, GEF: [] },
    facilities: { BSS: facilities, GEF: [] },
  };
};
