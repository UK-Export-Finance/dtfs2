const mapGefDeal = (deal) => {
  // only map the fields that are consumed by Portal UI/GraphQL queries.

  const {
    _id,
    dealType,
    status,
    submissionType,
    updatedAt,
  } = deal;

  return {
    _id,
    status,
    bankRef: deal.additionalRefName,
    exporter: 'TEMPPPPP',
    product: dealType,
    type: submissionType,
    lastUpdate: updatedAt,
  };
};

const dealsReducer = (deals) => {
  const mappedDeals = deals.map((deal) => {
    const { dealType } = deal;

    if (dealType === 'GEF') {
      return mapGefDeal(deal);
    }

    return deal;
  });

  return mappedDeals;
};

module.exports = dealsReducer;
