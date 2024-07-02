import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';

export type FeeRecordPaymentEntityGroup = {
  feeRecords: FeeRecordEntity[];
  payments: PaymentEntity[];
};

const getPaymentIdKeyFromPaymentEntities = (payments: PaymentEntity[]) =>
  `paymentIds-${payments
    .map(({ id }) => id)
    .toSorted((id1, id2) => id1 - id2)
    .join('-')}`;

export const getFeeRecordPaymentEntityGroupsFromFeeRecordEntities = (feeRecords: FeeRecordEntity[]): FeeRecordPaymentEntityGroup[] => {
  function* generateUniqueKey(): Generator<string, string, unknown> {
    let key = 1;
    while (true) {
      yield key.toString();
      key += 1;
    }
  }

  const keyGenerator = generateUniqueKey();

  const paymentIdKeyToGroupMap = feeRecords.reduce(
    (map, feeRecord) => {
      const paymentIdKey = feeRecord.payments.length === 0 ? keyGenerator.next().value : getPaymentIdKeyFromPaymentEntities(feeRecord.payments);

      if (map[paymentIdKey]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        map[paymentIdKey].feeRecords.push(feeRecord);
        return map;
      }

      return {
        ...map,
        [paymentIdKey]: {
          feeRecords: [feeRecord],
          payments: feeRecord.payments,
        },
      };
    },
    {} as { [key: string]: FeeRecordPaymentEntityGroup },
  );
  return Object.values(paymentIdKeyToGroupMap);
};

const getFeeRecordIdKeyFromFeeRecordEntities = (feeRecords: FeeRecordEntity[]) =>
  `ids-${feeRecords
    .map(({ id }) => id)
    .toSorted((id1, id2) => id1 - id2)
    .join('-')}`;

export const getCompleteFeeRecordPaymentEntityGroupsFromFilteredFeeRecordEntities = (feeRecords: FeeRecordEntity[]): FeeRecordPaymentEntityGroup[] => {
  function* generateUniqueKey(): Generator<string, string, unknown> {
    let key = 1;
    while (true) {
      yield key.toString();
      key += 1;
    }
  }

  const keyGenerator = generateUniqueKey();

  const feeRecordIdKeyToGroupMap = feeRecords.reduce(
    (map, feeRecord) => {
      const groupIdKey = feeRecord.payments.length === 0 ? keyGenerator.next().value : getFeeRecordIdKeyFromFeeRecordEntities(feeRecord.payments[0].feeRecords);

      if (map[groupIdKey]) {
        return map;
      }

      if (feeRecord.payments.length === 0) {
        return {
          ...map,
          [groupIdKey]: {
            feeRecords: [feeRecord],
            payments: [],
          },
        };
      }

      return {
        ...map,
        [groupIdKey]: {
          feeRecords: feeRecord.payments[0].feeRecords,
          payments: feeRecord.payments,
        },
      };
    },
    {} as { [key: string]: FeeRecordPaymentEntityGroup },
  );
  return Object.values(feeRecordIdKeyToGroupMap);
};
