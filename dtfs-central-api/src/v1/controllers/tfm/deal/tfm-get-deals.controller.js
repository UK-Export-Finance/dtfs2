const moment = require('moment');
const escapeStringRegexp = require('escape-string-regexp');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');
const {
  isTimestampField,
  dayStartAndEndTimestamps,
} = require('./tfm-get-deals-date-helpers');
const { getBSSProperty } = require('../../../../mapping/mapDataModel')

const findDeals = async (queryParameters) => {
  const dealsCollection = await db.getCollection('tfm-deals');

  const {
    searchString, sortBy, fieldQueries, pagesize, page = 0
  } = queryParameters;

  sortBy.bssField = getBSSProperty(sortBy.field);

  let query = {};

  const sort = {};
  if (sortBy) {
    sort.tempFieldForSort = sortBy.order === CONSTANTS.DEALS.SORT_BY.ASCENDING ? 1 : -1;
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

    const searchStringRegex = escapeStringRegexp(searchString);

    const searchStringRegex = escapeStringRegexp(searchString);

    const query = {
      $or: [
        { 'dealSnapshot.details.ukefDealId': { $regex: searchStringRegex, $options: 'i' } }, // BSS
        { 'dealSnapshot.ukefDealId': { $regex: searchStringRegex, $options: 'i' } }, // GEF
        { 'dealSnapshot.bank.name': { $regex: searchStringRegex, $options: 'i' } },
        { 'dealSnapshot.submissionDetails.supplier-name': { $regex: searchStringRegex, $options: 'i' } },
        { 'dealSnapshot.exporter.companyName': { $regex: searchStringRegex, $options: 'i' } },
        { 'dealSnapshot.submissionType': { $regex: searchStringRegex, $options: 'i' } },
        { 'dealSnapshot.submissionDetails.buyer-name': { $regex: searchStringRegex, $options: 'i' } },
        { 'tfm.stage': { $regex: searchStringRegex, $options: 'i' } },
        { 'tfm.product': { $regex: searchStringRegex, $options: 'i' } },
      ],
    };

    if (dateString) {
      const dateStringEscaped = escapeStringRegexp(dateString);
      query.$or.push({
        'tfm.dateReceived': { $regex: dateStringEscaped, $options: 'i' },
      });
    }
  }

  if (!searchString && fieldQueries && fieldQueries.length) {
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
  const doc = await dealsCollection
    .aggregate([
      {
        $match: query,
      },
      {
        $addFields: {
          tempFieldForSort: {
            '$cond': {
              if: { '$eq': ['dealSnapshot.dealType', CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS] }, then: `$${sortBy.bssField}`,
              else: `$${sortBy.field}`
            }
          }
      }
      },
      {
        $sort: {
          ...sort,
          updatedAt: -1,
          _id: 1,
        },
      },
      {
        $facet: {
          count: [{ $count: 'total' }],
          deals: [{ $skip: page * (pagesize ?? 0) }, ...(pagesize ? [{ $limit: parseInt(pagesize, 10) }] : [])],
        },
      },
      { $unwind: '$count' },
      {
        $project: {
          count: '$count.total',
          deals: true,
        },
      },
    ])
    .toArray();

  if (!doc.length) {
    const pagination = {
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    };
    return { deals: [], pagination };
  }
  const { count, deals } = doc[0];

  const pagination = {
    totalItems: count,
    currentPage: page,
    totalPages: pagesize ? Math.ceil(count / pagesize) : 1,
  };

  return { deals, pagination };
};

exports.findDealsGet = async (req, res) => {
  const queryParameters = { ...req.body.queryParams, fieldQueries: req.body.queryParams?.byField };

  const { deals, pagination } = await findDeals(queryParameters);

  if (deals) {
    return res.status(200).send({
      deals,
      pagination,
    });
  }

  return res.status(404).send();
};
