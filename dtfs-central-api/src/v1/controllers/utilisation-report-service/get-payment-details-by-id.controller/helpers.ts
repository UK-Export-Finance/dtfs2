import { PaymentEntity } from '@ukef/dtfs2-common';
import { GetPaymentDetailsResponseBody } from '.';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';
import { mapFeeRecordEntityToFeeRecord } from '../../../../mapping/fee-record-mapper';
import { mapPaymentEntityToPayment } from '../../../../mapping/payment-mapper';
import { calculateTotalCurrencyAndAmount } from '../../../../helpers';

/**
 * Maps the supplied payment entity to the payment details
 * @param payment - The payment entity with fee records and utilisation report attached
 * @param includeFeeRecords - Whether or not to include the fee record related fields
 * @returns The payment details
 */
export const mapToPaymentDetails = async (payment: PaymentEntity, includeFeeRecords: boolean): Promise<GetPaymentDetailsResponseBody> => {
  const { feeRecords } = payment;
  const {
    report: { bankId, reportPeriod },
  } = feeRecords[0];

  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new NotFoundError(`Failed to find a bank with id '${bankId}'`);
  }

  const paymentDetailsWithoutFeeRecords: GetPaymentDetailsResponseBody = {
    bank: {
      id: bankId,
      name: bankName,
    },
    reportPeriod,
    payment: mapPaymentEntityToPayment(payment),
  };

  if (!includeFeeRecords) {
    return paymentDetailsWithoutFeeRecords;
  }

  const mappedFeeRecords = feeRecords.map(mapFeeRecordEntityToFeeRecord);
  const totalReportedPayments = calculateTotalCurrencyAndAmount(mappedFeeRecords.map(({ reportedPayments }) => reportedPayments));
  return {
    ...paymentDetailsWithoutFeeRecords,
    feeRecords: mappedFeeRecords,
    totalReportedPayments,
  };
};
