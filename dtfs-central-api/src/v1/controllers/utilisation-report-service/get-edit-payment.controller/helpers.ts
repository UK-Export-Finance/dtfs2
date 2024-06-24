import { PaymentEntity } from '@ukef/dtfs2-common';
import { EditPaymentDetails } from '../../../../types/payments';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToFeeRecord } from '../../../../mapping/fee-record-mapper';
import { mapPaymentEntityToPayment } from '../../../../mapping/payment-mapper';
import { calculateTotalCurrencyAndAmount } from '../../../../helpers';

/**
 * Maps the supplied payment entity to the selected payment details
 * @param payment - The payment entity with fee records and utilisation report attached
 * @returns The selected payment details
 */
export const mapToEditPaymentDetails = async (payment: PaymentEntity): Promise<EditPaymentDetails> => {
  const { feeRecords } = payment;
  const {
    report: { bankId, reportPeriod },
  } = feeRecords[0];

  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  const mappedFeeRecords = feeRecords.map(mapFeeRecordEntityToFeeRecord);

  const totalReportedPayments = calculateTotalCurrencyAndAmount(mappedFeeRecords.map(({ reportedPayments }) => reportedPayments));

  return {
    bank: {
      id: bankId,
      name: bankName,
    },
    reportPeriod,
    payment: mapPaymentEntityToPayment(payment),
    feeRecords: mappedFeeRecords,
    totalReportedPayments,
  };
};
