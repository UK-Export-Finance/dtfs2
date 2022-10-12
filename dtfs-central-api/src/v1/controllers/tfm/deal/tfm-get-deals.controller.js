const moment = require('moment');
const db = require('../../../../database/mongo-client');
const CONSTANTS = require('../../../../constants');
const getObjectPropertyValueFromStringPath = require('../../../../utils/getObjectPropertyValueFromStringPath');
const mapDataModel = require('../../../../mapping/mapDataModel');
const setEmptyIfNull = require('../../../../utils/setEmptyIfNull');
const {
  isTimestampField,
  dayStartAndEndTimestamps,
} = require('./tfm-get-deals-date-helpers');

const sortDeals = (deals, sortBy) =>
  deals.sort((xDeal, yDeal) => {
    const xField = setEmptyIfNull(
      getObjectPropertyValueFromStringPath(
        xDeal,
        mapDataModel(xDeal, sortBy.field),
      ),
    );

    const yField = setEmptyIfNull(
      getObjectPropertyValueFromStringPath(
        yDeal,
        mapDataModel(yDeal, sortBy.field),
      ),
    );

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

  /*
   * Query/filter deals by search string input
   * - Only certain fields are supported. I.e, what is displayed in the UI.
  */
  if (searchString) {
    let dateString;

    const date = moment(searchString, 'DD-MM-YYYY');

    const isValidDate = moment(date).isValid();

    if (isValidDate) {
      dateString = String(moment(date).format('DD-MM-YYYY'));
    }

    const query = {
      $or: [
        { 'dealSnapshot.details.ukefDealId': { $regex: searchString, $options: 'i' } }, // BSS
        { 'dealSnapshot.ukefDealId': { $regex: searchString, $options: 'i' } }, // GEF
        { 'dealSnapshot.bank.name': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.submissionDetails.supplier-name': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.exporter.companyName': { $regex: searchString, $options: 'i' } },
        { 'dealSnapshot.submissionType': { $regex: searchString, $options: 'i' } },
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

    /*
    * Query/filter deals by any custom field
    * - I.e, date/timestamp fields, deals created by X bank.
    * - All single value string fields are supported.
    * - However, only specific timestamp fields are supported.
    * - This is as per business requirements. More timestamp fields can be easily added if required.
    * - Timestamp field queries are currently only used by an external system (Cedar).
    */
    if (fieldQueries && fieldQueries.length) {
      fieldQueries.forEach((field) => {
        const {
          name: fieldName,
          value: fieldValue,
        } = field;

        if (isTimestampField(fieldName)) {
          // NOTE: A deal timestamp field could be at any time of the day.
          // Given a date from fieldQueries in the format 'dd-MM-yyyy', we:
          // 1) generate timestamps for the start and end of that day
          // 2) check that the requested timestamp field falls within this particular day;
          // ...with the use of $gte and $lte.
          // Example:
          // - given: '01-11-2021'
          // - dayStartTimestamp will be: 1636329600000
          // - dayEndTimestamp will be: 1636415999999
          // - if a deal has e.g submissionDate timestamp that is within this day (e.g 1636378182935.0)
          // the deal will be returned in the MongoDB query.

          const {
            dayStartTimestamp,
            dayEndTimestamp,
          } = dayStartAndEndTimestamps(fieldValue);

          query = {
            ...query,
            [fieldName]: {
              $gte: dayStartTimestamp,
              $lte: dayEndTimestamp,
            },
          };
        } else {
          query = {
            ...query,
            [fieldName]: {
              $eq: fieldValue,
            },
          };
        }
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
