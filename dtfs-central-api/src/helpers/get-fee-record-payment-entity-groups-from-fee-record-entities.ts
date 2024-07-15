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
