const createDbQuery = (operator, value) => ({
  [`$${operator}`]: value,
});

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
