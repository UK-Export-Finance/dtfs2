const api = require('../../api');
const ALL_MOCK_DEALS = require('../mock-deals');

module.exports = {
  mockUpdateDeal: (mockDealToReturn = undefined) => {
    api.updateDeal.mockImplementation((dealId, updatedTfmDealData) => {
      let deal = mockDealToReturn || ALL_MOCK_DEALS.find((d) => d._id === dealId);

      // if stage is updated, add to the mock deal.
      if (updatedTfmDealData.tfm) {
        if (updatedTfmDealData.tfm.stage) {
          deal = {
            ...deal,
            tfm: {
              ...updatedTfmDealData.tfm,
              tasks: updatedTfmDealData.tfm.tasks,
            },
          };
          if (!mockDealToReturn) {
            const dealIndex = ALL_MOCK_DEALS.findIndex((d) => d._id === dealId);
            ALL_MOCK_DEALS[dealIndex] = deal;
          }
        }
      }

      return {
        dealSnapshot: {
          ...deal,
        },
        ...updatedTfmDealData,
      };
    });
  },
};
