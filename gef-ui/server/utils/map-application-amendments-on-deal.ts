import { FacilityAmendmentWithUkefId, SummaryListRow, AMENDMENT_TYPES, DATE_FORMATS, getFormattedMonetaryValue, CURRENCY } from '@ukef/dtfs2-common';
import { format, fromUnixTime } from 'date-fns';
import { getCurrencySymbol } from './get-currency-symbol';

type MappedFacilityAmendmentWithUkefId = {
  referenceNumber: string;
  amendmentRows: SummaryListRow[];
  type?: string;
  facilityId?: string;
  amendmentId?: string;
};

/**
 * Maps an array of `FacilityAmendmentWithUkefId` to an array of `MappedFacilityAmendmentWithUkefId` objects.
 * This function transforms the structure of the amendments to match the required format.
 *
 * @param amendments - An array of amendments ,to be mapped. Each amendment contains details about a facility amendment.
 * @returns An array of mapped amendments
 */
export const mapApplicationAmendmentsOnDeal = (amendments: FacilityAmendmentWithUkefId[]): MappedFacilityAmendmentWithUkefId[] => {
  return amendments.map((amendment) => {
    const symbol = getCurrencySymbol(amendment.currency ?? CURRENCY.GBP);
    const value = amendment.value ? getFormattedMonetaryValue(Number(amendment.value)) : '';
    const today = new Date();
    let amendmentCreatedByRow = null;

    if (amendment.type === AMENDMENT_TYPES.PORTAL) {
      if (amendment.createdBy) {
        amendmentCreatedByRow = {
          key: {
            text: 'Amendment created by',
          },
          value: {
            text: amendment.createdBy.name,
          },
        };
      }
    } else {
      amendmentCreatedByRow = {
        key: {
          text: 'Amendment created by',
        },
        value: {
          text: 'UKEF',
        },
      };
    }

    return {
      referenceNumber: amendment.referenceNumber ?? '',
      amendmentRows: [
        {
          key: {
            text: 'Facility ID',
          },
          value: {
            text: amendment.ukefFacilityId?.toString() ?? '',
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
                  text: format(amendment.coverEndDate, DATE_FORMATS.DD_MMMM_YYYY),
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
                  text: format(new Date(amendment.facilityEndDate), DATE_FORMATS.DD_MMMM_YYYY),
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
                  text: format(new Date(amendment.bankReviewDate), DATE_FORMATS.DD_MMMM_YYYY),
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
                  text: `${symbol} ${value}`,
                },
              },
            ]
          : []),
        ...(amendment.effectiveDate
          ? [
              {
                key: {
                  text: 'Date effective from',
                },
                value: {
                  text: format(fromUnixTime(amendment.effectiveDate), DATE_FORMATS.D_MMMM_YYYY),
                },
              },
            ]
          : []),
        ...(amendmentCreatedByRow ? [amendmentCreatedByRow] : []),
      ],
      type: amendment.type,
      facilityId: amendment.facilityId.toString(),
      amendmentId: amendment.amendmentId.toString(),
      effectiveDate: amendment.effectiveDate ? format(fromUnixTime(amendment.effectiveDate), DATE_FORMATS.D_MMMM_YYYY) : '',
      hasFutureEffectiveDate: new Date(fromUnixTime(amendment.effectiveDate ?? 0)) > today,
    };
  });
};
