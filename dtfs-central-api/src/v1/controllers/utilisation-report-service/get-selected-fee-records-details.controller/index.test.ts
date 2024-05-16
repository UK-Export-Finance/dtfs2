import httpMocks from 'node-mocks-http';
import { FeeRecordEntityMockBuilder, SelectedFeeRecordsDetails, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { GetSelectedFeeRecordDetailsRequest, getSelectedFeeRecordDetails } from '.';
import { aReportPeriod } from '../../../../../test-helpers/test-data/report-period';
import { getBankNameById } from '../../../../repositories/banks-repo';

jest.mock('../../../../repositories/utilisation-reports-repo');
jest.mock('../../../../repositories/banks-repo');

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

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('responds with a 404 when there is no report with the given id', async () => {
    // Arrange
    const { req, res } = getHttpMocks([1, 2]);
    const findReportSpy = jest.spyOn(UtilisationReportRepo, 'findOne').mockResolvedValue(null);

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(findReportSpy).toHaveBeenCalledTimes(1);
    expect(findReportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: REPORT_ID },
      }),
    );
    expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
  });

  it('responds with a 400 when the requested fee records have differing payment currencies', async () => {
    // Arrange
    const { req, res } = getHttpMocks([1, 2]);
    const reportEntity = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
    const feeRecordWithPaymentCurrencyPounds = FeeRecordEntityMockBuilder.forReport(reportEntity).withId(1).withPaymentCurrency('GBP').build();
    const feeRecordWithPaymentCurrencyEuros = FeeRecordEntityMockBuilder.forReport(reportEntity).withId(2).withPaymentCurrency('EUR').build();
    reportEntity.feeRecords = [feeRecordWithPaymentCurrencyPounds, feeRecordWithPaymentCurrencyEuros];
    jest.spyOn(UtilisationReportRepo, 'findOne').mockResolvedValue(reportEntity);

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual(expect.stringContaining('Selected fee records must all have the same payment currency'));
  });

  it('responds with a 400 when no fee records are requested', async () => {
    // Arrange
    const { req, res } = getHttpMocks([]);

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual(expect.stringContaining('No fee records selected'));
  });

  it('responds with a 400 when any fee record id does not have a corresponding fee record attached to report', async () => {
    // Arrange
    const { req, res } = getHttpMocks([1, 2]);
    const reportEntity = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(reportEntity).withId(1).withPaymentCurrency('GBP').build();
    reportEntity.feeRecords = [feeRecord];
    jest.spyOn(UtilisationReportRepo, 'findOne').mockResolvedValue(reportEntity);

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual(expect.stringContaining('All selected fee records must belong to the requested report'));
  });

  it('filters report fee records to the selected ones', async () => {
    // Arrange
    const { req, res } = getHttpMocks([1]);
    const reportEntity = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
    const selectedFeeRecord = FeeRecordEntityMockBuilder.forReport(reportEntity).withId(1).withPaymentCurrency('GBP').build();
    const nonSelectedFeeRecord = FeeRecordEntityMockBuilder.forReport(reportEntity).withId(2).withPaymentCurrency('GBP').build();
    reportEntity.feeRecords = [selectedFeeRecord, nonSelectedFeeRecord];
    jest.spyOn(UtilisationReportRepo, 'findOne').mockResolvedValue(reportEntity);
    jest.mocked(getBankNameById).mockResolvedValue('Test Bank');

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    expect((res._getData() as SelectedFeeRecordsDetails).feeRecords.length).toEqual(1);
    expect((res._getData() as SelectedFeeRecordsDetails).feeRecords[0].id).toEqual(1);
  });

  it('responds with a 200 and the mapped selected fee record details', async () => {
    // Arrange
    const { req, res } = getHttpMocks([1, 2]);
    const reportPeriod = aReportPeriod();
    const reportEntity = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withBankId('999').withReportPeriod(reportPeriod).build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(reportEntity)
      .withId(1)
      .withFacilityId('FACILITY 1')
      .withExporter('EXPORTER 1')
      .withPaymentCurrency('GBP')
      .withFeesPaidToUkefForThePeriodCurrency('GBP')
      .withFeesPaidToUkefForThePeriod(100)
      .build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(reportEntity)
      .withId(2)
      .withFacilityId('FACILITY 2')
      .withExporter('EXPORTER 2')
      .withPaymentCurrency('GBP')
      .withFeesPaidToUkefForThePeriodCurrency('GBP')
      .withFeesPaidToUkefForThePeriod(200)
      .build();
    reportEntity.feeRecords = [feeRecordOne, feeRecordTwo];
    jest.spyOn(UtilisationReportRepo, 'findOne').mockResolvedValue(reportEntity);
    jest.mocked(getBankNameById).mockResolvedValue('Test Bank');

    // Act
    await getSelectedFeeRecordDetails(req, res);

    // Assert
    expect(getBankNameById).toHaveBeenCalledWith('999');
    expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    expect(res._getData()).toEqual<SelectedFeeRecordsDetails>({
      reportPeriod,
      totalReportedPayments: { currency: 'GBP', amount: 300 },
      bank: {
        name: 'Test Bank',
      },
      feeRecords: [
        {
          id: 1,
          facilityId: 'FACILITY 1',
          exporter: 'EXPORTER 1',
          reportedFee: {
            currency: 'GBP',
            amount: 100,
          },
          reportedPayment: {
            currency: 'GBP',
            amount: 100,
          },
        },
        {
          id: 2,
          facilityId: 'FACILITY 2',
          exporter: 'EXPORTER 2',
          reportedFee: {
            currency: 'GBP',
            amount: 200,
          },
          reportedPayment: {
            currency: 'GBP',
            amount: 200,
          },
        },
      ],
    });
  });
});
