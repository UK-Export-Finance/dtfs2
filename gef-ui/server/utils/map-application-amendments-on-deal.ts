import { FacilityAmendmentWithUkefId, SummaryListRow, AMENDMENT_TYPES } from '@ukef/dtfs2-common';

type MappedFacilityAmendmentWithUkefId = {
  referenceNumber: string;
  amendmentRows: SummaryListRow[];
  type?: string;
};

/**
 * Maps an array of `FacilityAmendmentWithUkefId` to an array of `MappedFacilityAmendmentWithUkefId` objects.
 * This function transforms the structure of the amendments to match the required format.
 *
 * @param amendments - An array of amendments to be mapped. Each amendment contains details about a facility amendment.
 * @returns An array of mapped amendments
 */
export const mapApplicationAmendmentsOnDeal = (amendments: FacilityAmendmentWithUkefId[]): MappedFacilityAmendmentWithUkefId[] => {
  return amendments.map((amendment) => ({
    referenceNumber: amendment.referenceNumber ?? '',
    amendmentRows: [
      {
        key: {
          text: 'Facility ID',
        },
        value: {
          text: amendment.facilityId.toString(),
        },
      },
      ...(amendment.facilityType
        ? [
            {
              key: {
                text: 'Facility type',
              },
              value: {
                text: amendment.facilityType.toString(),
              },
            },
          ]
        : []),
      {
        key: {
          text: 'Status',
        },
        value: {
          text: amendment.status,
        },
      },
      ...(amendment.coverEndDate
        ? [
            {
              key: {
                text: 'New cover end date',
              },
              value: {
                text: amendment.coverEndDate.toString(),
              },
            },
          ]
        : []),
      ...(amendment.facilityEndDate
        ? [
            {
              key: {
                text: 'New facility end date',
              },
              value: {
                text: amendment.facilityEndDate.toString(),
              },
            },
          ]
        : []),
      ...(amendment.bankReviewDate
        ? [
            {
              key: {
                text: 'New bank review date',
              },
              value: {
                text: amendment.bankReviewDate.toString(),
              },
            },
          ]
        : []),
      ...(amendment.value
        ? [
            {
              key: {
                text: 'New facility value',
              },
              value: {
                text: amendment.value.toString(),
              },
            },
          ]
        : []),
      ...(amendment.effectiveDate
        ? [
            {
              key: {
                text: 'New facility value',
              },
              value: {
                text: amendment.effectiveDate.toString(),
              },
            },
          ]
        : []),
      ...(amendment.createdBy && amendment.type === AMENDMENT_TYPES.PORTAL
        ? [
            {
              key: {
                text: 'Amendment created by',
              },
              value: {
                text: amendment.createdBy.name,
              },
            },
          ]
        : [
            {
              key: {
                text: 'Amendment created by',
              },
              value: {
                text: 'UKEF',
              },
            },
          ]),
    ],
    type: amendment.type,
  }));
};
