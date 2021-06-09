const db = require('../../../../drivers/db-client');

const findDeals = async (searchString, callback) => {
  const dealsCollection = await db.getCollection('tfm-deals');

  // DONE UKEF Deal ID
  // DONE bank
  // DONE exporter
  // Products
  // Submission type i.e.AIN, MIA, MIN
  // Buyer
  // Deal stage
  // Date received

  let deals;

  if (searchString) {
    const query = {
      $or: [
        { 'dealSnapshot.details.ukefDealId': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.details.maker.bank.name': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.submissionDetails.supplier-name': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.details.submissionType': { $regex: searchString, $options: 'i' } },
      ],
    };

    deals = await dealsCollection.find(query).toArray();
  } else {
    deals = await dealsCollection.find().toArray();
  }

  if (callback) {
    callback(deals);
  }

  return deals;
};
exports.findDeals = findDeals;

exports.findDealsGet = async (req, res) => {
  const { searchParams } = req.body;

  let searchStr;

  if (searchParams && searchParams.searchString) {
    searchStr = searchParams.searchString;
  }

  const deals = await findDeals(searchStr);

  if (deals) {
    return res.status(200).send({
      deals,
    });
  }

  return res.status(404).send();
};
