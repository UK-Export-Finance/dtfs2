const refDataApi = require('../../../reference-data/api');
const { updateDeal } = require('../deal.controller');

const createUkefIds = async (dealId, deal, user) => {
  const ukefDealId = await refDataApi.numberGenerator.create('deal');

  const updatedBonds = await Promise.all(
    deal.bondTransactions.items.map(async (f) => {
      const facility = f;

      facility.ukefFacilityID = await refDataApi.numberGenerator.create('facility');
      return facility;
    }),
  );

  const updatedLoans = await Promise.all(
    deal.loanTransactions.items.map(async (f) => {
      const facility = f;

      facility.ukefFacilityID = await refDataApi.numberGenerator.create('facility');
      return facility;
    }),
  );

  const updatedDeal = await updateDeal(
    dealId,
    {
      details: {
        ukefDealId,
      },
      bondTransactions: {
        items: updatedBonds,
      },
      loanTransactions: {
        items: updatedLoans,
      },
    },
    user,
  );

  return updatedDeal;
};

module.exports = createUkefIds;
