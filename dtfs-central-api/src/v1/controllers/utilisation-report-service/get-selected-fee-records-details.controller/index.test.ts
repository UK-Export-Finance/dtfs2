import httpMocks from 'node-mocks-http';
import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  PaymentEntityMockBuilder,
  SelectedFeeRecordsDetails,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { GetSelectedFeeRecordDetailsRequest, getSelectedFeeRecordDetails } from '.';
import { aReportPeriod } from '../../../../../test-helpers';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { PaymentMatchingToleranceService } from '../../../../services/payment-matching-tolerance/payment-matching-tolerance.service';

jest.mock('../../../../repositories/utilisation-reports-repo');
jest.mock('../../../../repositories/banks-repo');
jest.mock('../../../../services/payment-matching-tolerance/payment-matching-tolerance.service');

console.error = jest.fn();

describe('get selected fee records details controller', () => {
  const REPORT_ID = 12;
  const getHttpMocks = (feeRecordIds: number[]) =>
    httpMocks.createMocks<GetSelectedFeeRecordDetailsRequest>({
      params: {
        id: REPORT_ID,
      },
      body: {
        feeRecordIds,
      },
    });

  const findReportSpy = jest.spyOn(UtilisationReportRepo, 'findOneByIdWithFeeRecordsFilteredByIdWithPayments');
  const getGbpToleranceSpy = jest.spyOn(PaymentMatchingToleranceService, 'getGbpPaymentMatchingTolerance');

  beforeEach(() => {
    getGbpToleranceSpy.mockResolvedValue(1);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('responds with a 404 when there is no report with the given id', async () => {
    // Arrange
    const { req, res } = getHttpMocks([1, 2]);
    findReportSpy.mockResolvedValue(null);

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(findReportSpy).toHaveBeenCalledTimes(1);
    expect(findReportSpy).toHaveBeenCalledWith(REPORT_ID, [1, 2]);
    expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
  });

  it('responds with a 400 when the requested fee records have differing payment currencies', async () => {
    // Arrange
    const { req, res } = getHttpMocks([1, 2]);
    const reportEntity = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();
    const feeRecordWithPaymentCurrencyPounds = FeeRecordEntityMockBuilder.forReport(reportEntity).withId(1).withPaymentCurrency(CURRENCY.GBP).build();
    const feeRecordWithPaymentCurrencyEuros = FeeRecordEntityMockBuilder.forReport(reportEntity).withId(2).withPaymentCurrency('EUR').build();
    reportEntity.feeRecords = [feeRecordWithPaymentCurrencyPounds, feeRecordWithPaymentCurrencyEuros];
    findReportSpy.mockResolvedValue(reportEntity);

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual(expect.stringContaining('Fee records must all have the same payment currency'));
  });

  it('responds with a 400 when no fee records are requested', async () => {
    // Arrange
    const { req, res } = getHttpMocks([]);

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual(expect.stringContaining('No fee records selected'));
  });

  it('responds with a 400 when any fee record id does not have a corresponding fee record attached to report', async () => {
    // Arrange
    const { req, res } = getHttpMocks([1, 2]);
    const reportEntity = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(reportEntity).withId(1).withPaymentCurrency(CURRENCY.GBP).build();
    reportEntity.feeRecords = [feeRecord];
    findReportSpy.mockResolvedValue(reportEntity);

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual(expect.stringContaining('All selected fee records must belong to the requested report'));
  });

  it('responds with a 200 and the mapped selected fee record details', async () => {
    // Arrange
    const { req, res } = getHttpMocks([1, 2]);
    const reportPeriod = aReportPeriod();
    const reportEntity = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withBankId('999').withReportPeriod(reportPeriod).build();
    const paymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
      .withDateReceived(new Date('2024-01-01'))
      .withAmount(150)
      .withReference('A payment')
      .build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(reportEntity)
      .withId(1)
      .withFacilityId('FACILITY 1')
      .withExporter('EXPORTER 1')
      .withPaymentCurrency(CURRENCY.GBP)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withFeesPaidToUkefForThePeriod(100)
      .withPayments([paymentEntity])
      .build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(reportEntity)
      .withId(2)
      .withFacilityId('FACILITY 2')
      .withExporter('EXPORTER 2')
      .withPaymentCurrency(CURRENCY.GBP)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withFeesPaidToUkefForThePeriod(200)
      .withPayments([paymentEntity])
      .build();
    reportEntity.feeRecords = [feeRecordOne, feeRecordTwo];

    findReportSpy.mockResolvedValue(reportEntity);
    getGbpToleranceSpy.mockResolvedValue(2);
    jest.spyOn(PaymentRepo, 'existsUnmatchedPaymentOfCurrencyForReportWithId').mockResolvedValue(true);
    jest.mocked(getBankNameById).mockResolvedValue('Test Bank');

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(getBankNameById).toHaveBeenCalledWith('999');
    expect(findReportSpy).toHaveBeenCalledWith(REPORT_ID, [1, 2]);
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getData()).toEqual<SelectedFeeRecordsDetails>({
      reportPeriod,
      totalReportedPayments: { currency: CURRENCY.GBP, amount: 300 },
      bank: {
        name: 'Test Bank',
      },
      feeRecords: [
        {
          id: 1,
          facilityId: 'FACILITY 1',
          exporter: 'EXPORTER 1',
          reportedFee: {
            currency: CURRENCY.GBP,
            amount: 100,
          },
          reportedPayments: {
            currency: CURRENCY.GBP,
            amount: 100,
          },
        },
        {
          id: 2,
          facilityId: 'FACILITY 2',
          exporter: 'EXPORTER 2',
          reportedFee: {
            currency: CURRENCY.GBP,
            amount: 200,
          },
          reportedPayments: {
            currency: CURRENCY.GBP,
            amount: 200,
          },
        },
      ],
      payments: [
        {
          dateReceived: new Date('2024-01-01'),
          amount: 150,
          currency: CURRENCY.GBP,
          reference: 'A payment',
        },
      ],
      canAddToExistingPayment: true,
      gbpTolerance: 2,
    });
  });
});
