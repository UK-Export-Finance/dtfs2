const moment = require('moment');
const db = require('../../../../drivers/db-client');

const findDeals = async (searchString, callback) => {
  const dealsCollection = await db.getCollection('tfm-deals');

  let deals;

  if (searchString) {
    let dateString;

    const date = moment(searchString, 'DD-MM-YYYY');

    const isValidDate = moment(date).isValid();

    if (isValidDate) {
      dateString = String(moment(date).format('DD-MM-YYYY'));
    }

    const query = {
      $or: [
        { 'dealSnapshot.details.ukefDealId': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.details.maker.bank.name': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.submissionDetails.supplier-name': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.details.submissionType': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.submissionDetails.buyer-name': { $regex: searchString, $options: 'i' } },
        { 'tfm.stage': { $regex: searchString, $options: 'i' } },
        { 'tfm.facilities': { $elemMatch: { productCode: { $eq: searchString } } } },
      ],
    };

    if (dateString) {
      query['$or'].push({
        'tfm.dateReceived': { $regex: dateString, $options: 'i' },
      });
    }

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
