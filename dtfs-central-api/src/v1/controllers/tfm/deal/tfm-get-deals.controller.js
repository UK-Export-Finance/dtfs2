const moment = require('moment');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');
const getObjectPropertyValueFromStringPath = require('../../../../utils/getObjectPropertyValueFromStringPath');
const getCrossDataModelProperty = require('../../../../utils/getCrossDataModelProperty');

const isEmpty = (value) => {
  if (value === null) return '';
  return value;
};

const sortDeals = (deals, sortBy) =>
  deals.sort((xDeal, yDeal) => {
    const xField = isEmpty(getObjectPropertyValueFromStringPath(xDeal, getCrossDataModelProperty(xDeal, sortBy.field)));
    const yField = isEmpty(getObjectPropertyValueFromStringPath(yDeal, getCrossDataModelProperty(yDeal, sortBy.field)));

    if (sortBy.order === CONSTANTS.DEALS.SORT_BY.ASCENDING) {
      if (xField > yField) {
        return 1;
      }

      if (yField > xField) {
        return -1;
      }
    }

    if (sortBy.order === CONSTANTS.DEALS.SORT_BY.DESCENDING) {
      if (xField > yField) {
        return -1;
      }

      if (yField > xField) {
        return 1;
      }
    }

    return 0;
  });

const findDeals = async (searchString, sortBy, fieldQueries, callback) => {
  const dealsCollection = await db.getCollection('tfm-deals');

  let dealsArray;
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
        { 'dealSnapshot.details.owningBank.name': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.submissionDetails.supplier-name': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.details.submissionType': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.submissionDetails.buyer-name': { $regex: searchString, $options: 'i' } },
        { 'tfm.stage': { $regex: searchString, $options: 'i' } },
        { 'tfm.product': { $regex: searchString, $options: 'i' } },
      ],
    };

    if (dateString) {
      query.$or.push({
        'tfm.dateReceived': { $regex: dateString, $options: 'i' },
      });
    }

    dealsArray = await dealsCollection.find(query).toArray();
  } else {
    let query;

    if (fieldQueries && fieldQueries.length) {
      fieldQueries.forEach((field) => {
        query = {
          ...query,
          [field.name]: {
            $eq: field.value,
          },
        };
      });
    }

    dealsArray = await dealsCollection.find(query).toArray();
  }

  deals = dealsArray;

  if (sortBy) {
    deals = sortDeals(deals, sortBy);
  }

  if (callback) {
    callback(deals);
  }

  return deals;
};
exports.findDeals = findDeals;

exports.findDealsGet = async (req, res) => {
  let searchStr;
  let sortByObj;
  let fieldQueries;

  if (req.body.queryParams) {
    if (req.body.queryParams.searchString) {
      searchStr = req.body.queryParams.searchString;
    }

    if (req.body.queryParams.byField) {
      fieldQueries = req.body.queryParams.byField;
    }

    if (req.body.queryParams.sortBy) {
      sortByObj = req.body.queryParams.sortBy;
    }
  }

  const deals = await findDeals(searchStr, sortByObj, fieldQueries);

  if (deals) {
    return res.status(200).send({
      deals,
    });
  }

  return res.status(404).send();
};
