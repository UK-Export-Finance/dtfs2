import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { when } from 'jest-when';
import {
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { getPaymentDetailsById, GetPaymentDetailsResponseBody } from '.';
import { mapToPaymentDetails } from './helpers';
import { PaymentRepo } from '../../../../repositories/payment-repo';

console.error = jest.fn();

jest.mock('./helpers');

describe('get-payment-details-by-id.controller', () => {
  describe('getPaymentDetailsById', () => {
    const reportId = 3;
    const paymentId = 14;
    const bankId = '123';

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId: reportId.toString(), paymentId: paymentId.toString() },
      });

    const aPaymentWithFeeRecordsAndReportAttached = (): PaymentEntity => {
      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS)
        .withId(Number(reportId))
        .withBankId(bankId)
        .build();
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).build();
      return PaymentEntityMockBuilder.forCurrency('GBP').withFeeRecords([feeRecord]).build();
    };

    const findOneSpy = jest.spyOn(PaymentRepo, 'findOne');

    beforeEach(() => {
      findOneSpy.mockResolvedValue(null);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('responds with a 404 when no payment with the supplied payment id and report id can be found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      findOneSpy.mockResolvedValue(aPaymentWithFeeRecordsAndReportAttached());
      when(findOneSpy)
        .calledWith({
          where: {
            id: paymentId,
            feeRecords: { report: { id: reportId } },
          },
          relations: { feeRecords: { report: true } },
        })
        .mockResolvedValue(null);

      // Act
      await getPaymentDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it('responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      when(findOneSpy)
        .calledWith({
          where: {
            id: paymentId,
            feeRecords: { report: { id: reportId } },
          },
          relations: { feeRecords: { report: true } },
        })
        .mockResolvedValue(aPaymentWithFeeRecordsAndReportAttached());

      // Act
      await getPaymentDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it('responds with the payment details', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      when(findOneSpy)
        .calledWith({
          where: {
            id: paymentId,
            feeRecords: { report: { id: reportId } },
          },
          relations: { feeRecords: { report: true } },
        })
        .mockResolvedValue(aPaymentWithFeeRecordsAndReportAttached());

      const paymentDetails = {
        field1: 'Some value',
        field2: 'Another value',
      } as unknown as GetPaymentDetailsResponseBody;
      jest.mocked(mapToPaymentDetails).mockResolvedValue(paymentDetails);

      // Act
      await getPaymentDetailsById(req, res);

      // Assert
      expect(res._getData()).toEqual(paymentDetails);
    });
  });
});
