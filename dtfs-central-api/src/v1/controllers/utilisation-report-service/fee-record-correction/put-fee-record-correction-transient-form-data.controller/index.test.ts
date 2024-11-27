import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  FeeRecordCorrectionTransientFormDataEntity,
  RECORD_CORRECTION_REASON,
  RecordCorrectionTransientFormData,
  REQUEST_PLATFORM_TYPE,
  TestApiError,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { aTfmSessionUser } from '../../../../../../test-helpers';
import { PutFeeRecordCorrectionTransientFormDataRequest, putFeeRecordCorrectionTransientFormData } from '.';
import { PutFeeRecordCorrectionTransientFormDataSchema } from '../../../../routes/middleware/payload-validation';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';

jest.mock('../../../../../repositories/fee-record-repo');
jest.mock('../../../../../repositories/fee-record-correction-transient-form-data-repo');

console.error = jest.fn();

describe('put-fee-record-correction-transient-form-data.controller', () => {
  describe('putFeeRecordCorrectionTransientFormData', () => {
    const reportId = 1;
    const feeRecordId = 2;

    const tfmUserId = new ObjectId().toString();

    const formData: RecordCorrectionTransientFormData = {
      reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
      additionalInfo: 'Some additional info',
    };

    const aValidRequestQuery = () => ({ reportId: reportId.toString(), feeRecordId: feeRecordId.toString() });

    const aValidRequestBody = (): PutFeeRecordCorrectionTransientFormDataSchema => ({
      user: { ...aTfmSessionUser(), _id: tfmUserId },
      formData,
    });

    const mockFeeRecordExists = jest.fn();
    const mockSave = jest.fn();

    beforeEach(() => {
      FeeRecordRepo.existsByIdAndReportId = mockFeeRecordExists;
      mockFeeRecordExists.mockReturnValue(true);

      FeeRecordCorrectionTransientFormDataRepo.save = mockSave;
      mockSave.mockResolvedValue(undefined);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`responds with a '${HttpStatusCode.Ok}' if the transient form data is saved successfully`, async () => {
      // Arrange
      const req = httpMocks.createRequest<PutFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const expectedTransientFormDataEntity = FeeRecordCorrectionTransientFormDataEntity.create({
        userId: tfmUserId,
        feeRecordId,
        formData,
        requestSource: {
          platform: REQUEST_PLATFORM_TYPE.TFM,
          userId: tfmUserId,
        },
      });

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith(expectedTransientFormDataEntity);
    });

    it(`responds with a '${HttpStatusCode.NotFound}' if no fee record with the provided fee record id and report id is found`, async () => {
      // Arrange
      const req = httpMocks.createRequest<PutFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      mockFeeRecordExists.mockReturnValue(false);

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockSave).not.toHaveBeenCalled();
    });

    it("responds with the specific error status if updating the transient form data throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PutFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = HttpStatusCode.NotFound;
      mockFeeRecordExists.mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockSave).not.toHaveBeenCalled();
    });

    it("responds with the specific error message if updating the transient form data throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PutFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      mockFeeRecordExists.mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to put fee record correction transient form data: ${errorMessage}`);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockSave).not.toHaveBeenCalled();
    });

    it(`responds with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      const req = httpMocks.createRequest<PutFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      mockFeeRecordExists.mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockSave).not.toHaveBeenCalled();
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<PutFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      mockFeeRecordExists.mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to put fee record correction transient form data`);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockSave).not.toHaveBeenCalled();
    });
  });
});
