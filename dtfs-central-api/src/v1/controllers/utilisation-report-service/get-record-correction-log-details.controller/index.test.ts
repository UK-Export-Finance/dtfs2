import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { FeeRecordCorrectionEntityMockBuilder, GetRecordCorrectionLogDetailsResponseBody } from '@ukef/dtfs2-common';
import { getRecordCorrectionLogDetails } from '.';
import { FeeRecordCorrectionRepo } from '../../../../repositories/fee-record-correction-repo';
import { getRecordCorrectionFields } from '../helpers/get-record-correction-fields';
import { getBankNameById } from '../../../../repositories/banks-repo';

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
  const reportId = feeRecordCorrectionEntity.feeRecord.report.id;

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

    it(`should respond with a ${HttpStatusCode.NotFound}`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Assert
      await getRecordCorrectionLogDetails(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      const expectedErrorMessage = 'Record correction not found';
      expect(res._getData()).toEqual(`Failed to get record correction log details: ${expectedErrorMessage}`);
    });
  });

  describe('when a bank is not found', () => {
    beforeEach(() => {
      findRecordCorrectionSpy.mockResolvedValue(feeRecordCorrectionEntity);
      jest.mocked(getBankNameById).mockResolvedValue(undefined);
    });

    it(`should respond with a ${HttpStatusCode.NotFound}`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Assert
      await getRecordCorrectionLogDetails(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      const expectedErrorMessage = 'Bank not found';
      expect(res._getData()).toEqual(`Failed to get record correction log details: ${expectedErrorMessage}`);
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
        bankTeamEmails,
        additionalInfo,
        formattedBankCommentary,
        formattedDateReceived,
        formattedRequestedByUser,
      } = getRecordCorrectionFields(feeRecordCorrectionEntity.feeRecord, feeRecordCorrectionEntity);

      const expected: GetRecordCorrectionLogDetailsResponseBody = {
        correctionDetails: {
          facilityId,
          exporter,
          formattedReasons,
          formattedDateSent,
          formattedOldRecords,
          formattedCorrectRecords,
          bankTeamName,
          isCompleted,
          bankTeamEmails,
          additionalInfo,
          formattedBankCommentary,
          formattedDateReceived,
          formattedRequestedByUser,
        },
        bankName,
        reportId,
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
