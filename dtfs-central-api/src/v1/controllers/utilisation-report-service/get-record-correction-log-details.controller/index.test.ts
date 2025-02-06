import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { FeeRecordCorrectionEntityMockBuilder } from '@ukef/dtfs2-common';
import { getRecordCorrectionLogDetails } from '.';
import { FeeRecordCorrectionRepo } from '../../../../repositories/fee-record-correction-repo';
import { getRecordCorrectionFields } from '../helpers/get-record-correction-fields';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';

console.error = jest.fn();

jest.mock('../../../../repositories/banks-repo');
jest.mock('../../../../repositories/fee-record-correction-repo');

describe('get-record-correction-log-details.controller', () => {
  const correctionId = 1;
  const bankName = 'Test bank';
  const today = new Date();

  const getHttpMocks = () =>
    httpMocks.createMocks({
      params: { correctionId: correctionId.toString() },
    });

  const findRecordCorrectionSpy = jest.spyOn(FeeRecordCorrectionRepo, 'findOneByIdWithFeeRecordAndReport');
  const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withDateRequested(today).build();

  beforeEach(() => {
    findRecordCorrectionSpy.mockResolvedValue(null);
    jest.mocked(getBankNameById).mockResolvedValue(bankName);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when a record correction is not found', () => {
    beforeEach(() => {
      findRecordCorrectionSpy.mockResolvedValue(null);
    });

    it('should throw a NotFoundError', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Assert
      await expect(getRecordCorrectionLogDetails(req, res)).rejects.toThrow(new NotFoundError('Record correction not found'));
    });
  });

  describe('when a bank is not found', () => {
    beforeEach(() => {
      findRecordCorrectionSpy.mockResolvedValue(feeRecordCorrectionEntity);
      jest.mocked(getBankNameById).mockResolvedValue(undefined);
    });

    it('should throw a NotFoundError', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Assert
      await expect(getRecordCorrectionLogDetails(req, res)).rejects.toThrow(new NotFoundError('Bank not found'));
    });
  });

  describe('when a record correction and bank are found', () => {
    beforeEach(() => {
      findRecordCorrectionSpy.mockResolvedValue(feeRecordCorrectionEntity);
      jest.mocked(getBankNameById).mockResolvedValue(bankName);
    });

    it(`should respond with ${HttpStatusCode.Ok} and return the correct response object`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getRecordCorrectionLogDetails(req, res);

      const {
        facilityId,
        exporter,
        formattedReasons,
        formattedDateSent,
        formattedOldRecords,
        formattedCorrectRecords,
        bankTeamName,
        isCompleted,
        formattedBankTeamEmails,
        additionalInfo,
        formattedBankCommentary,
        formattedDateReceived,
        formattedRequestedByUser,
      } = getRecordCorrectionFields(feeRecordCorrectionEntity.feeRecord, feeRecordCorrectionEntity);

      const expected = {
        correctionDetails: {
          facilityId,
          exporter,
          formattedReasons,
          formattedDateSent,
          formattedOldRecords,
          formattedCorrectRecords,
          bankTeamName,
          isCompleted,
          formattedBankTeamEmails,
          additionalInfo,
          formattedBankCommentary,
          formattedDateReceived,
          formattedRequestedByUser,
        },
        bankName,
        reportPeriod: feeRecordCorrectionEntity.feeRecord.report.reportPeriod,
      };

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      expect(res._getData()).toEqual(expected);
    });

    it('should call FeeRecordCorrectionRepo.findOneByIdWithFeeRecordAndReport once with the correctionId', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getRecordCorrectionLogDetails(req, res);

      // Assert
      expect(findRecordCorrectionSpy).toHaveBeenCalledTimes(1);
      expect(findRecordCorrectionSpy).toHaveBeenCalledWith(correctionId);
    });

    it('should call getBankNameById once with the bankId', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getRecordCorrectionLogDetails(req, res);

      // Assert
      expect(getBankNameById).toHaveBeenCalledTimes(1);
      expect(getBankNameById).toHaveBeenCalledWith(feeRecordCorrectionEntity.feeRecord.report.bankId);
    });
  });
});
