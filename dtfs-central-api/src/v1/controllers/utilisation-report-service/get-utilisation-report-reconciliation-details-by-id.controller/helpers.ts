import { FeeRecordEntity, PaymentEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { FeeRecordItem, FeeRecordPaymentGroupItem, UtilisationReportReconciliationDetails } from '../../../../types/utilisation-reports';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import {
  mapFeeRecordEntitiesToTotalReportedPayments,
  mapFeeRecordEntityToReportedFees,
  mapFeeRecordEntityToReportedPayments,
} from '../../../../mapping/fee-record-mapper';
import { mapPaymentEntitiesToTotalPaymentsReceived, mapPaymentEntityToPaymentsReceived } from '../../../../mapping/payment-mapper';

const mapFeeRecordEntityToFeeRecordItem = (feeRecord: FeeRecordEntity): FeeRecordItem => ({
  id: feeRecord.id,
  facilityId: feeRecord.facilityId,
  exporter: feeRecord.exporter,
  reportedFees: mapFeeRecordEntityToReportedFees(feeRecord),
  reportedPayments: mapFeeRecordEntityToReportedPayments(feeRecord),
});

type FeeRecordPaymentEntityGroup = {
  feeRecords: FeeRecordEntity[];
  payments: PaymentEntity[];
};

const getPaymentIdKeyFromPaymentEntities = (payments: PaymentEntity[]) =>
  `paymentIds-${payments
    .map(({ id }) => id)
    .toSorted((id1, id2) => id1 - id2)
    .join('-')}`;

const getFeeRecordPaymentEntityGroupsFromFeeRecordEntities = (feeRecords: FeeRecordEntity[]): FeeRecordPaymentEntityGroup[] => {
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

const mapFeeRecordEntitiesToFeeRecordPaymentGroupItems = (feeRecordEntities: FeeRecordEntity[]): FeeRecordPaymentGroupItem[] => {
  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroupsFromFeeRecordEntities(feeRecordEntities);

  return feeRecordPaymentEntityGroups.map(({ feeRecords, payments }) => {
    const { status } = feeRecords[0];

    if (payments.length === 0) {
      return {
        feeRecords: [mapFeeRecordEntityToFeeRecordItem(feeRecords[0])],
        totalReportedPayments: mapFeeRecordEntitiesToTotalReportedPayments(feeRecords),
        paymentsReceived: null,
        totalPaymentsReceived: null,
        status,
      };
    }

    const feeRecordItems = feeRecords.map(mapFeeRecordEntityToFeeRecordItem);
    const totalReportedPayments = mapFeeRecordEntitiesToTotalReportedPayments(feeRecords);

    const paymentsReceived = payments.map(mapPaymentEntityToPaymentsReceived);
    const totalPaymentsReceived = mapPaymentEntitiesToTotalPaymentsReceived(payments);

    return {
      feeRecords: feeRecordItems,
      totalReportedPayments,
      paymentsReceived,
      totalPaymentsReceived,
      status,
    };
  });
};

/**
 * Maps the utilisation report entity to the reconciliation details
 * @param utilisationReport - The utilisation report entity
 * @returns The utilisation report reconciliation details
 * @throws {Error} If the report has not been uploaded
 * @throws {NotFoundError} If a bank cannot be found with the matching bank id
 */
export const mapUtilisationReportEntityToReconciliationDetails = async (
  utilisationReport: UtilisationReportEntity,
): Promise<UtilisationReportReconciliationDetails> => {
  const { id, bankId, feeRecords, dateUploaded, status, reportPeriod } = utilisationReport;

  if (!dateUploaded) {
    throw new Error(`Report with id '${id}' has not been uploaded`);
  }

  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  const feeRecordPaymentGroups = mapFeeRecordEntitiesToFeeRecordPaymentGroupItems(feeRecords);

  return {
    reportId: id,
    bank: {
      id: bankId,
      name: bankName,
    },
    status,
    reportPeriod,
    dateUploaded,
    feeRecordPaymentGroups,
  };
};
