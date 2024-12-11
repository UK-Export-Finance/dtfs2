import httpMocks, { MockResponse } from 'node-mocks-http';
import { HttpStatusCode, AxiosError, AxiosResponse } from 'axios';
import { Response } from 'express';
import { getUtilisationReportPendingCorrectionsByBankId, GetUtilisationReportPendingCorrectionsRequest } from './pending-corrections';
import api from '../../../api';
import { aReportPeriod } from '../../../../../test-helpers/test-data/report-period';
import { UtilisationReportPendingCorrectionsResponseBody } from '../../../api-response-types';

jest.mock('../../../api');

console.error = jest.fn();

describe('getUtilisationReportPendingCorrectionsByBankId', () => {
  const bankId = 'bank-id';

  let req: GetUtilisationReportPendingCorrectionsRequest;
  let res: MockResponse<Response>;

  const aUtilisationReportPendingCorrectionsResponseBody = (): UtilisationReportPendingCorrectionsResponseBody => ({
    reportPeriod: aReportPeriod(),
    uploadedByUserName: 'John Doe',
    dateUploaded: '2023-02-01T12:00:00Z',
    reportId: 123,
    corrections: [
      {
        feeRecordId: 1,
        facilityId: 'FAC123',
        exporter: 'Exporter A',
        additionalInfo: 'Correction details A',
      },
      {
        feeRecordId: 2,
        facilityId: 'FAC456',
        exporter: 'Exporter B',
        additionalInfo: 'Correction details B',
      },
    ],
    nextDueReportPeriod: aReportPeriod(),
  });

  beforeEach(() => {
    req = httpMocks.createRequest<GetUtilisationReportPendingCorrectionsRequest>({
      params: { bankId },
    });
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getUtilisationReportPendingCorrectionsByBankId with the bankId', async () => {
    // Arrange
    const responseData = aUtilisationReportPendingCorrectionsResponseBody();
    jest.mocked(api.getUtilisationReportPendingCorrectionsByBankId).mockResolvedValue(responseData);

    // Act
    await getUtilisationReportPendingCorrectionsByBankId(req, res);

    // Assert
    expect(api.getUtilisationReportPendingCorrectionsByBankId).toHaveBeenCalledTimes(1);
    expect(api.getUtilisationReportPendingCorrectionsByBankId).toHaveBeenCalledWith(bankId);
  });

  describe('when there are no pending corrections', () => {
    beforeEach(() => {
      jest.mocked(api.getUtilisationReportPendingCorrectionsByBankId).mockResolvedValue({});
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and an empty object`, async () => {
      // Act
      await getUtilisationReportPendingCorrectionsByBankId(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({});
    });
  });

  describe('when there are pending corrections', () => {
    const responseData = aUtilisationReportPendingCorrectionsResponseBody();

    beforeEach(() => {
      jest.mocked(api.getUtilisationReportPendingCorrectionsByBankId).mockResolvedValue(responseData);
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and the pending corrections`, async () => {
      // Act
      await getUtilisationReportPendingCorrectionsByBankId(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(responseData);
    });
  });

  describe('when an Axios error is thrown', () => {
    const errorMessage = 'Some error message';
    const errorStatus = HttpStatusCode.BadRequest;

    beforeEach(() => {
      jest
        .mocked(api.getUtilisationReportPendingCorrectionsByBankId)
        .mockRejectedValue(new AxiosError(errorMessage, undefined, undefined, undefined, { status: errorStatus } as AxiosResponse));
    });

    it('responds with the specific error status', async () => {
      // Act
      await getUtilisationReportPendingCorrectionsByBankId(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it('responds with the specific error message', async () => {
      // Act
      await getUtilisationReportPendingCorrectionsByBankId(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get pending corrections ${errorMessage}`);
    });
  });

  describe('when an unknown error occurs', () => {
    beforeEach(() => {
      jest.mocked(api.getUtilisationReportPendingCorrectionsByBankId).mockRejectedValue(new Error('Some error'));
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}'`, async () => {
      // Act
      await getUtilisationReportPendingCorrectionsByBankId(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error message', async () => {
      // Act
      await getUtilisationReportPendingCorrectionsByBankId(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get pending corrections');
    });
  });
});
