import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import escapeStringRegexp from 'escape-string-regexp';
import { isValid, format } from 'date-fns';
import { getDateFromSearchString } from '../../../../helpers/getDateFromSearchString';
import { mongoDbClient as db } from '../../../../drivers/db-client';
import { DEALS } from '../../../../constants';
import { isTimestampField, dayStartAndEndTimestamps } from './tfm-get-deals-date-helpers';
import { getBSSProperty } from '../../../../mapping/mapDataModel';

const findDeals = async (queryParameters) => {
  const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);

  const { searchString, sortBy, fieldQueries, pagesize, page = 0 } = queryParameters;

  const pageNumber = Number(page);

  let databaseQuery = {};

  let nonBssField;
  let bssField;

  const selectedField = {};
  if (sortBy) {
    nonBssField = sortBy.field;
    bssField = getBSSProperty(nonBssField);

    selectedField.sortId = sortBy.order === DEALS.SORT_BY.ASCENDING ? 1 : -1;
  }

  /*
   * Query/filter deals by search string input
   * - Only certain fields are supported. I.e, what is displayed in the UI.
   */
  if (searchString) {
    const searchStringRegex = escapeStringRegexp(searchString);

    databaseQuery = {
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

    const date = getDateFromSearchString(searchString);

    if (isValid(date)) {
      // tfm.dateReceived is stored in the database in the form `dd-MM-yyyy`
      const dateString = format(date, 'dd-MM-yyyy');
      const dateStringEscaped = escapeStringRegexp(dateString);
      databaseQuery.$or.push({
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
    fieldQueries.forEach((field) => {
      const { name: fieldName, value: fieldValue } = field;

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

        const { dayStartTimestamp, dayEndTimestamp } = dayStartAndEndTimestamps(fieldValue);

        databaseQuery = {
          ...databaseQuery,
          [fieldName]: {
            $gte: dayStartTimestamp,
            $lte: dayEndTimestamp,
          },
        };
      } else {
        databaseQuery = {
          ...databaseQuery,
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
        $match: databaseQuery,
      },
      {
        $addFields: {
          sortId: {
            $cond: {
              if: { $eq: ['$dealSnapshot.dealType', DEALS.DEAL_TYPE.BSS_EWCS] },
              then: sortBy ? `$${bssField}` : undefined,
              else: sortBy ? `$${nonBssField}` : undefined,
            },
          },
        },
      },
      {
        $sort: {
          ...selectedField,
          updatedAt: -1,
          _id: 1,
        },
      },
      {
        $unset: 'sortId',
      },
      {
        $facet: {
          count: [{ $count: 'total' }],
          deals: [{ $skip: pageNumber * (pagesize ?? 0) }, ...(pagesize ? [{ $limit: parseInt(pagesize, 10) }] : [])],
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
      currentPage: pageNumber,
      totalPages: 1,
    };
    return { deals: [], pagination };
  }
  const { count, deals } = doc[0];

  const pagination = {
    totalItems: count,
    currentPage: pageNumber,
    totalPages: pagesize ? Math.ceil(count / pagesize) : 1,
  };

  return { deals, pagination };
};

export const findDealsGet = async (req, res) => {
  const queryParameters = { ...req.query, fieldQueries: req.query?.byField };

  const { deals, pagination } = await findDeals(queryParameters);

  if (deals) {
    return res.status(200).send({
      deals,
      pagination,
    });
  }

  return res.status(404).send();
};
