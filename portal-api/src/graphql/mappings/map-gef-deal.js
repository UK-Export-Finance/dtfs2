const mapGefDeal = (deal) => {
  // only map the fields that are consumed by Portal UI/GraphQL queries.

  const {
    _id,
    dealType,
    status,
    submissionType,
    exporter,
    updatedAt,
  } = deal;

  return {
    _id,
    status,
    bankRef: deal.additionalRefName,
    exporter: (exporter && exporter.companyName) ? exporter.companyName : '',
    product: dealType,
    submissionType,
    updatedAt,
  };
};

module.exports = mapGefDeal;
