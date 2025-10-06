const { DEAL_A_SUPPLIER_VARS, DEAL_B_SUPPLIER_VARS } = require('@ukef/dtfs2-common/test-helpers');

const { createMockDeal } = require('./create-mock-deal');

exports.dealsSortByExporter = () => {
  // multiple BSS/EWCS deals
  const DEAL_A_SUPPLIER = createMockDeal(
    {
      ...DEAL_A_SUPPLIER_VARS,
    },
    '0030001',
  );

  const DEAL_B_SUPPLIER = createMockDeal(
    {
      ...DEAL_B_SUPPLIER_VARS,
    },
    '0030002',
  );

  const deals = [DEAL_A_SUPPLIER.deal, DEAL_B_SUPPLIER.deal];

  const facilities = [DEAL_A_SUPPLIER.facilities, DEAL_B_SUPPLIER.facilities];

  return {
    deals: { BSS: deals, GEF: [] },
    facilities: { BSS: facilities, GEF: [] },
  };
};
