import { AMENDMENT_TYPES, DATE_FORMATS, getFormattedMonetaryValue, CURRENCY, FacilityAllTypeAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { format, fromUnixTime } from 'date-fns';
import { getCurrencySymbol } from '../utils/get-currency-symbol';

export const getAmendmentCreatedByRow = (amendment: FacilityAllTypeAmendmentWithUkefId) => {
  const symbol = getCurrencySymbol(amendment.currency ?? CURRENCY.GBP);
  const value = amendment.value ? getFormattedMonetaryValue(Number(amendment.value)) : '';

  let amendmentCreatedByRow;

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

  amendmentCreatedByRow = [
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
              text: `${amendment.facilityType} facility`,
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
  ];

  return amendmentCreatedByRow;
};
