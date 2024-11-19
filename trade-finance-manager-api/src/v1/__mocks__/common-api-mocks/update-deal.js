import ALL_MOCK_DEALS from '../mock-deals';

const api = require('../../api').default;

export const mockUpdateDeal = (mockDealToReturn = undefined) => {
  api.updateDeal.mockImplementation(({ dealId, dealUpdate }) => {
    let deal = mockDealToReturn || ALL_MOCK_DEALS.find((d) => d._id === dealId);

    // if stage is updated, add to the mock deal.
    if (dealUpdate.tfm?.stage) {
      deal = {
        ...deal,
        tfm: {
          ...dealUpdate.tfm,
          tasks: dealUpdate.tfm.tasks,
        },
      };
      if (!mockDealToReturn) {
        const dealIndex = ALL_MOCK_DEALS.findIndex((d) => d._id === dealId);
        ALL_MOCK_DEALS[dealIndex] = deal;
      }
    }

    return {
      dealSnapshot: {
        ...deal,
      },
      ...dealUpdate,
    };
  });
};
