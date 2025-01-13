import httpMocks, { MockResponse } from 'node-mocks-http';
import { AxiosResponse, HttpStatusCode, AxiosError } from 'axios';
import { Response } from 'express';
import { aRecordCorrectionFormValues, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import {
  getFeeRecordCorrectionTransientFormData,
  GetFeeRecordCorrectionTransientFormDataRequest,
  putFeeRecordCorrectionTransientFormData,
  PutFeeRecordCorrectionTransientFormDataRequest,
} from './fee-record-correction-transient-form-data.controller';
import api from '../../../api';

jest.mock('../../../api');

console.error = jest.fn();

describe('fee-record-correction-transient-form-data.controller', () => {
  describe('getFeeRecordCorrectionTransientFormData', () => {
    const userId = new ObjectId().toString();
    const bankId = '123';
    const correctionId = 7;

    const aValidRequestQuery = () => ({ correctionId: correctionId.toString(), bankId });

    let req: GetFeeRecordCorrectionTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      req = httpMocks.createRequest<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
        user: { _id: userId },
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call the get fee record correction transient form data api endpoint once with the correct parameters', async () => {
      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(api.getFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(correctionId, userId);
    });

    describe('when the api request is successful and returns form data', () => {
      const formData: RecordCorrectionTransientFormData = { utilisation: 500000 };

      beforeEach(() => {
        jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockResolvedValue(formData);
      });

      it(`should return a ${HttpStatusCode.Ok} status code`, async () => {
        // Act
        await getFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      });

      it(`should return the form data in the response body`, async () => {
        // Act
        await getFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(res._getData()).toEqual(formData);
      });
    });

    describe('when the api request is successful and returns an empty object', () => {
      beforeEach(() => {
        jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockResolvedValue({});
      });

      it(`should return a ${HttpStatusCode.Ok} status code`, async () => {
        // Act
        await getFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      });

      it(`should return an empty object as the response body`, async () => {
        // Act
        await getFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(res._getData()).toEqual({});
      });
    });

    it(`should return a ${HttpStatusCode.InternalServerError} status code if an unknown error is thrown`, async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return a specific error code if an axios error is thrown', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockRejectedValue(axiosError);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get fee record correction transient form data');
      expect(res._isEndCalled()).toEqual(true);
    });
  });

  describe('putFeeRecordCorrectionTransientFormData', () => {
    const userId = new ObjectId().toString();
    const bankId = '123';
    const correctionId = 7;

    const aValidRequestQuery = () => ({ correctionId: correctionId.toString(), bankId });

    let req: PutFeeRecordCorrectionTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      req = httpMocks.createRequest<PutFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
        body: aRecordCorrectionFormValues(),
        user: { _id: userId },
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call the put fee record correction transient form data api endpoint once with the correct parameters', async () => {
      // Arrange
      const formData = aRecordCorrectionFormValues();
      req.body = formData;

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(api.putFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
      expect(api.putFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(bankId, correctionId, userId, formData);
    });

    it(`should return a ${HttpStatusCode.Ok} status code if the api request is successful`, async () => {
      // Arrange
      jest.mocked(api.putFeeRecordCorrectionTransientFormData);

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it(`should return a ${HttpStatusCode.InternalServerError} status code if an unknown error is thrown`, async () => {
      // Arrange
      jest.mocked(api.putFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return a specific error code if an axios error is thrown', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const axiosError = new AxiosError(undefined, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse);

      jest.mocked(api.putFeeRecordCorrectionTransientFormData).mockRejectedValue(axiosError);

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      jest.mocked(api.putFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to put fee record correction transient form data');
      expect(res._isEndCalled()).toEqual(true);
    });
  });
});
