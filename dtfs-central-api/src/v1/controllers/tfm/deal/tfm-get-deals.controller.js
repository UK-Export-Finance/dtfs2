const moment = require('moment');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');
const {
  isTimestampField,
  dayStartAndEndTimestamps,
} = require('./tfm-get-deals-date-helpers');

const findDeals = async (searchString, sortBy, fieldQueries, pagesize = 25, start = 0, callback = undefined) => {
  const dealsCollection = await db.getCollection('tfm-deals');

  let query = {};

  const sort = {};
  if (sortBy) {
    sort[sortBy.field] = sortBy.order === CONSTANTS.DEALS.SORT_BY.ASCENDING ? 1 : -1;
  }

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

    query = {
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
  } else if (fieldQueries && fieldQueries.length) {
    /*
    * Query/filter deals by any custom field
    * - I.e, date/timestamp fields, deals created by X bank.
    * - All single value string fields are supported.
    * - However, only specific timestamp fields are supported.
    * - This is as per business requirements. More timestamp fields can be easily added if required.
    * - Timestamp field queries are currently only used by an external system (Cedar).
    */
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
  const deals = await dealsCollection.aggregate([
    {
      $match: query
    },
    {
      $sort: {
        ...sort,
        updatedAt: -1,
        _id: 1
      },
    },
    {
      $skip: parseInt(start, 10)
    },
    {
      $limit: parseInt(pagesize, 10)
    }
  ]).toArray();

  if (callback) {
    callback(deals);
  }

  return deals;
};
exports.findDeals = findDeals;

exports.findDealsGet = async (req, res) => {
  let searchString;
  let fieldQueries;
  let sortBy;
  let start;
  let pagesize;

  if (req.body?.queryParams) {
    ({
      searchString, byField: fieldQueries, sortBy, start, pagesize
    } = req.body.queryParams);
  }

  const deals = await findDeals(searchString, sortBy, fieldQueries, pagesize, start);

  if (deals) {
    return res.status(200).send({
      deals,
    });
  }

  return res.status(404).send();
};
