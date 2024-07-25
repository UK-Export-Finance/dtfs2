import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { Document } from 'mongodb';

export type AllFacilitiesAndFacilityCountAggregatePipelineOptions = {
  searchStringEscaped: string;
  fieldsToSortOn: Record<string, number>;
  page: number;
  pagesize: number;
};

export const allFacilitiesAndFacilityCount = ({
  searchStringEscaped,
  fieldsToSortOn,
  page,
  pagesize,
}: AllFacilitiesAndFacilityCountAggregatePipelineOptions): Document[] => [
  {
    $lookup: {
      from: MONGO_DB_COLLECTIONS.TFM_DEALS,
      localField: 'facilitySnapshot.dealId',
      foreignField: '_id',
      as: 'tfmDeals',
    },
  },
  {
    $unwind: '$tfmDeals',
  },
  {
    $project: {
      _id: false,
      companyName: '$tfmDeals.dealSnapshot.exporter.companyName',
      ukefFacilityId: '$facilitySnapshot.ukefFacilityId',
      // amendments array for mapping completed amendments
      amendments: '$amendments',
      tfmFacilities: {
        // create the `dealId` property
        dealId: '$facilitySnapshot.dealId',
        // create the `facilityId` property
        facilityId: '$facilitySnapshot._id',
        // create the `ukefFacilityId` property
        ukefFacilityId: '$facilitySnapshot.ukefFacilityId',
        // create the `dealType` property - this is inside the `dealSnapshot` property, NOT `facilities` array
        dealType: '$tfmDeals.dealSnapshot.dealType',
        // create the `type` property
        type: '$facilitySnapshot.type',
        // create the `value` property - this is the facility value
        value: '$facilitySnapshot.value',
        // create the `currency` property
        currency: '$facilitySnapshot.currency.id',
        // create the `coverEndDate` property
        // GEF already has this property, but BSS doesn't have it in this format, so we need to create it dynamically
        coverEndDate: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$tfmDeals.dealSnapshot.dealType', 'GEF'] },
                then: '$facilitySnapshot.coverEndDate', // YYYY-MM-DD
              },
              {
                case: { $eq: ['$tfmDeals.dealSnapshot.dealType', 'BSS/EWCS'] },
                then: {
                  $concat: ['$facilitySnapshot.coverEndDate-year', '-', '$facilitySnapshot.coverEndDate-month', '-', '$facilitySnapshot.coverEndDate-day'],
                }, // YYYY-MM-DD
              },
            ],
          },
        },
        // create the `companyName` property - this is inside the `dealSnapshot.exporter` property, NOT `facilities` array
        companyName: '$tfmDeals.dealSnapshot.exporter.companyName',
        // create the `hasBeenIssued` property
        hasBeenIssued: '$facilitySnapshot.hasBeenIssued',
      },
    },
  },
  {
    // search functionality based on ukefFacilityId property OR companyName
    $match: {
      $or: [
        {
          ukefFacilityId: {
            $regex: searchStringEscaped,
            $options: 'i',
          },
        },
        {
          companyName: {
            $regex: searchStringEscaped,
            $options: 'i',
          },
        },
      ],
    },
  },
  {
    $addFields: {
      facilityStage: {
        $cond: {
          if: '$tfmFacilities.hasBeenIssued',
          then: 'Issued',
          else: 'Unissued',
        },
      },
    },
  },
  {
    $sort: {
      ...fieldsToSortOn,
    },
  },
  {
    $unset: 'facilityStage',
  },
  {
    $facet: {
      count: [{ $count: 'total' }],
      facilities: [{ $skip: page * pagesize }, ...(pagesize ? [{ $limit: pagesize }] : [])],
    },
  },
  { $unwind: '$count' },
  {
    $project: {
      count: '$count.total',
      facilities: true,
    },
  },
];
