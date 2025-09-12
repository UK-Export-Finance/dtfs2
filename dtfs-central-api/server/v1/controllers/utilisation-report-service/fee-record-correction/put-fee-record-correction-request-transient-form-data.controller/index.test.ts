import { TestApiError } from '@ukef/dtfs2-common/test-helpers';
import httpMocks, { MockResponse } from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  FeeRecordCorrectionRequestTransientFormDataEntity,
  RECORD_CORRECTION_REASON,
  RecordCorrectionRequestTransientFormData,
  REQUEST_PLATFORM_TYPE,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { aTfmSessionUser } from '../../../../../../test-helpers';
import { PutFeeRecordCorrectionRequestTransientFormDataRequest, putFeeRecordCorrectionRequestTransientFormData } from '.';
import { PutFeeRecordCorrectionRequestTransientFormDataPayload } from '../../../../routes/middleware/payload-validation';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-request-transient-form-data-repo';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';

jest.mock('../../../../../repositories/fee-record-repo');
jest.mock('../../../../../repositories/fee-record-correction-request-transient-form-data-repo');

console.error = jest.fn();

describe('put-fee-record-correction-request-transient-form-data.controller', () => {
  describe('putFeeRecordCorrectionRequestTransientFormData', () => {
    const reportId = 1;
    const feeRecordId = 2;

    const tfmUserId = new ObjectId().toString();

    const formData: RecordCorrectionRequestTransientFormData = {
      reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
      additionalInfo: 'Some additional info',
    };

    const aValidRequestQuery = () => ({ reportId: reportId.toString(), feeRecordId: feeRecordId.toString() });

    const aValidRequestBody = (): PutFeeRecordCorrectionRequestTransientFormDataPayload => ({
      user: { ...aTfmSessionUser(), _id: tfmUserId },
      formData,
    });

    const mockFeeRecordExists = jest.fn();
    const mockSave = jest.fn();

    let req: PutFeeRecordCorrectionRequestTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      FeeRecordRepo.existsByIdAndReportId = mockFeeRecordExists;
      mockFeeRecordExists.mockReturnValue(true);

      FeeRecordCorrectionRequestTransientFormDataRepo.save = mockSave;
      mockSave.mockResolvedValue(undefined);

      req = httpMocks.createRequest<PutFeeRecordCorrectionRequestTransientFormDataRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should respond with a '${HttpStatusCode.Ok}' if the transient form data is saved successfully`, async () => {
      // Arrange
      const expectedTransientFormDataEntity = FeeRecordCorrectionRequestTransientFormDataEntity.create({
        userId: tfmUserId,
        feeRecordId,
        formData,
        requestSource: {
          platform: REQUEST_PLATFORM_TYPE.TFM,
          userId: tfmUserId,
        },
      });

      // Act
      await putFeeRecordCorrectionRequestTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith(expectedTransientFormDataEntity);
    });

    it('should call fee record exists once', async () => {
      // Act
      await putFeeRecordCorrectionRequestTransientFormData(req, res);

      // Assert
      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
    });

    it('should call fee record exists with the correct parameters', async () => {
      // Act
      await putFeeRecordCorrectionRequestTransientFormData(req, res);

      // Assert
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);
    });

    it(`should respond with a '${HttpStatusCode.NotFound}' if no fee record with the provided fee record id and report id is found`, async () => {
      // Arrange
      mockFeeRecordExists.mockReturnValue(false);

      // Act
      await putFeeRecordCorrectionRequestTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);

      expect(mockSave).not.toHaveBeenCalled();
    });

    it("should respond with the specific error status if updating the transient form data throws an 'ApiError'", async () => {
      // Arrange
      const errorStatus = HttpStatusCode.NotFound;
      mockFeeRecordExists.mockRejectedValue(new TestApiError({ status: errorStatus }));

      // Act
      await putFeeRecordCorrectionRequestTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);

      expect(mockSave).not.toHaveBeenCalled();
    });

    it("should respond with the specific error message if updating the transient form data throws an 'ApiError'", async () => {
      // Arrange
      const errorMessage = 'Some error message';
      mockFeeRecordExists.mockRejectedValue(new TestApiError({ message: errorMessage }));

      // Act
      await putFeeRecordCorrectionRequestTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to put fee record correction request transient form data: ${errorMessage}`);

      expect(mockSave).not.toHaveBeenCalled();
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      mockFeeRecordExists.mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrectionRequestTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);

      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      mockFeeRecordExists.mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrectionRequestTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to put fee record correction request transient form data`);

      expect(mockSave).not.toHaveBeenCalled();
    });
  });
});
