let dealsWeHaveLoaded = [];

module.exports.clearDeals = (listOfDeals) => {
  const listOfIds = listOfDeals.filter(deal=>deal._id);

  dealsWeHaveLoaded = dealsWeHaveLoaded.filter(deal=>listOfIds.includes(deal._id));
  console.log(`cache now contains: ${dealsWeHaveLoaded.length}`);
}

module.exports.cacheDeals = (deals) => {
  console.log(`caching deals: ${deals}`);
  dealsWeHaveLoaded = dealsWeHaveLoaded.concat(deals);
  console.log(`cache now contains: ${dealsWeHaveLoaded.length}`);
}

module.exports.uncacheDeals = () => {
  return dealsWeHaveLoaded;
}

module.exports.aDealInStatus = (status) => {
  const candidates = dealsWeHaveLoaded.filter(deal=>deal.details.status===status);
  expect(candidates.length > 0);
  return candidates[0];
}

module.exports.dealsInStatus = (status) => {
  const candidates = dealsWeHaveLoaded.filter(deal=>deal.details.status===status);
  expect(candidates.length > 0);
  return candidates;
}

module.exports.dealsCreatedBy = (user) => {
  const candidates = dealsWeHaveLoaded.filter(deal=>deal.details.maker.username===user.username);
  expect(candidates.length > 0);
  return candidates;
}

module.exports.dealsAssociatedWithBank = (bankName) => {
  const candidates = dealsWeHaveLoaded.filter(deal=>deal.details.owningBank.name===bankName);
  expect(candidates.length > 0);
  return candidates;
}

module.exports.dealsBySubmissionType = (submissionType) => {
  const candidates = dealsWeHaveLoaded.filter( deal=>deal.details.submissionType===submissionType);
  expect(candidates.length > 0);
  return candidates;
}
