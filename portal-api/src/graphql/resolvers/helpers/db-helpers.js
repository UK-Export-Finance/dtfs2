const createDbQuery = (operator, field, value) => {
  const query = {
    [`$${operator}`]: [],
  };

  value.forEach((fieldValue) => {
    query[`$${operator}`].push({
      [field]: fieldValue,
    });
  });

  return query;
};

const createDbQueryKeywordDeals = (keyword) => ({
  $or: [
    { bankInternalRefName: { $regex: keyword, $options: 'i' } },
    { status: { $regex: keyword, $options: 'i' } },
    { dealType: { $regex: keyword, $options: 'i' } },
    { submissionType: { $regex: keyword, $options: 'i' } },
    { 'exporter.companyName': { $regex: keyword, $options: 'i' } },
  ],
});

module.exports = {
  createDbQuery,
  createDbQueryKeywordDeals,
};
