import { ObjectId } from 'mongodb';
import httpMocks, { MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import {
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  PaymentOfficerTeam,
  PENDING_RECONCILIATION,
  TestApiError,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { putFeeRecordCorrection, PutFeeRecordCorrectionRequest } from '.';
import { getBankById } from '../../../../../repositories/banks-repo';
import { aBank } from '../../../../../../test-helpers';
import { executeWithSqlTransaction } from '../../../../../helpers';
import { FeeRecordStateMachine } from '../../../../../services/state-machines/fee-record/fee-record.state-machine';
import { FEE_RECORD_EVENT_TYPE } from '../../../../../services/state-machines/fee-record/event/fee-record.event-type';

jest.mock('../../../../../repositories/fee-record-correction-transient-form-data-repo');
jest.mock('../../../../../repositories/fee-record-correction-repo');
jest.mock('../../../../../repositories/banks-repo');
jest.mock('../../../../../helpers');
jest.mock('../../../../../services/state-machines/fee-record/fee-record.state-machine');

describe('putFeeRecordCorrection', () => {
  const mockFindCorrection = jest.fn();
  const mockFindCorrectionTransientFormData = jest.fn();
  const mockDeleteTransientFormData = jest.fn();

  const correctionId = 1;
  const bankId = '123';
  const portalUserId = new ObjectId().toString();

  const aValidRequestParams = () => ({ correctionId: correctionId.toString(), bankId });
  const aValidRequestBody = () => ({ user: { _id: portalUserId } });

  let req: PutFeeRecordCorrectionRequest;
  let res: MockResponse<Response>;

  const mockEntityManager = {} as unknown as EntityManager;
  const mockHandleEvent = jest.fn();
  const mockForFeeRecord = jest.fn();

  beforeEach(() => {
    jest.spyOn(FeeRecordCorrectionRepo, 'withTransaction').mockReturnValue({
      findOneByIdWithFeeRecord: jest.fn(),
      findOneByIdWithFeeRecordAndReport: jest.fn(),
      findOneByIdAndBankIdWithFeeRecordAndReport: mockFindCorrection,
      findByIdAndBankId: jest.fn(),
    });

    jest.spyOn(FeeRecordCorrectionTransientFormDataRepo, 'withTransaction').mockReturnValue({
      findByUserIdAndCorrectionId: mockFindCorrectionTransientFormData,
      deleteByUserIdAndCorrectionId: mockDeleteTransientFormData,
    });

    jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => {
      return await functionToExecute(mockEntityManager);
    });

    mockForFeeRecord.mockReturnValue({
      handleEvent: mockHandleEvent,
    });
    FeeRecordStateMachine.forFeeRecord = mockForFeeRecord;

    req = httpMocks.createRequest<PutFeeRecordCorrectionRequest>({
      params: aValidRequestParams(),
      body: aValidRequestBody(),
    });
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call the repo to fetch the correction for the bank and correction', async () => {
    // Act
    await putFeeRecordCorrection(req, res);

    // Assert
    expect(mockFindCorrection).toHaveBeenCalledTimes(1);
    expect(mockFindCorrection).toHaveBeenCalledWith(correctionId, bankId);
  });

  describe('when the correction is not found', () => {
    beforeEach(() => {
      mockFindCorrection.mockResolvedValue(null);
    });

    it(`should respond with ${HttpStatusCode.NotFound} if correction is not found`, async () => {
      // Act
      await putFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
      expect(res._getData()).toBe(`Failed to put fee record correction: Failed to find a correction with id '${correctionId}' for bank id '${bankId}'`);
    });
  });

  describe('when the correction is found', () => {
    const reportPeriod = { start: { month: 10, year: 2023 }, end: { month: 10, year: 2023 } };

    const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withReportPeriod(reportPeriod).withBankId(bankId).build();

    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).build();

    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false).withId(correctionId).build();

    beforeEach(() => {
      mockFindCorrection.mockResolvedValue(correction);
    });

    describe('and when the transient form data is not found', () => {
      beforeEach(() => {
        mockFindCorrectionTransientFormData.mockResolvedValue(null);
      });

      it(`should respond with ${HttpStatusCode.NotFound} if transient form data is not found`, async () => {
        // Act
        await putFeeRecordCorrection(req, res);

        // Assert
        expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
        expect(res._getData()).toBe(
          `Failed to put fee record correction: Failed to find transient form data with user id '${portalUserId}' for correction id '${correctionId}'`,
        );
      });
    });

    describe('and when the transient form data is found', () => {
      const formData = { utilisation: 500000 };
      const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
        .withCorrectionId(correctionId)
        .withUserId(portalUserId)
        .withFormData(formData)
        .build();

      beforeEach(() => {
        mockFindCorrectionTransientFormData.mockResolvedValue(transientFormDataEntity);
      });

      describe('and when the bank is not found', () => {
        beforeEach(() => {
          jest.mocked(getBankById).mockResolvedValue(null);
        });

        it(`should respond with ${HttpStatusCode.NotFound} if bank is not found`, async () => {
          // Act
          await putFeeRecordCorrection(req, res);

          // Assert
          expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
          expect(res._getData()).toBe(`Failed to put fee record correction: Failed to find bank with id '${bankId}'`);
        });
      });

      describe('and when the bank is found', () => {
        const paymentOfficerTeam: PaymentOfficerTeam = { emails: ['email1@ukexportfinance.gov.uk', 'email2@ukexportfinance.gov.uk'], teamName: 'This Team' };
        const bank = { ...aBank(), paymentOfficerTeam };

        beforeEach(() => {
          jest.mocked(getBankById).mockResolvedValue(bank);
        });

        it('should call the fee record state machine to handle the correction received event', async () => {
          // Act
          await putFeeRecordCorrection(req, res);

          // Assert
          const expected = {
            type: FEE_RECORD_EVENT_TYPE.CORRECTION_RECEIVED,
            payload: {
              transactionEntityManager: mockEntityManager,
              correctionEntity: correction,
              correctionFormData: formData,
              requestSource: {
                platform: 'TFM',
                userId: portalUserId,
              },
            },
          };

          expect(mockHandleEvent).toHaveBeenCalledTimes(1);
          expect(mockHandleEvent).toHaveBeenCalledWith(expected);
        });

        it('should call the repo to delete the transient form data', async () => {
          // Act
          await putFeeRecordCorrection(req, res);

          // Assert
          expect(mockDeleteTransientFormData).toHaveBeenCalledTimes(1);
          expect(mockDeleteTransientFormData).toHaveBeenCalledWith(portalUserId, correctionId);
        });

        it(`should respond with ${HttpStatusCode.Ok}`, async () => {
          // Act
          await putFeeRecordCorrection(req, res);

          // Assert
          expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
        });

        it('should respond with the payment officer emails and report period', async () => {
          // Act
          await putFeeRecordCorrection(req, res);

          // Assert
          expect(res._getData()).toEqual({ sentToEmails: paymentOfficerTeam.emails, reportPeriod });
        });
      });
    });

    it("should respond with the specific error status if retrieving the correction throws an 'ApiError'", async () => {
      // Arrange
      const errorStatus = HttpStatusCode.RequestTimeout;
      mockFindCorrection.mockRejectedValue(new TestApiError({ status: errorStatus }));

      // Act
      await putFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("should respond with the specific error message if retrieving the correction throws an 'ApiError'", async () => {
      // Arrange
      const errorMessage = 'Some error message';
      mockFindCorrection.mockRejectedValue(new TestApiError({ message: errorMessage }));

      // Act
      await putFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to put fee record correction: ${errorMessage}`);
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      mockFindCorrection.mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      mockFindCorrection.mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to put fee record correction`);
    });
  });
});
