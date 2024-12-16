import httpMocks, { MockResponse } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { TestApiError, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { GetUtilisationReportPendingCorrectionsRequest, PendingCorrectionsResponseBody, getUtilisationReportPendingCorrectionsByBankId } from '.';
import { getBankById } from '../../../../../repositories/banks-repo';
import { aBank, aReportPeriod } from '../../../../../../test-helpers';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';
import { mapReportToPendingCorrectionsResponseBody } from './helpers';

jest.mock('../../../../../repositories/banks-repo');
jest.mock('../../../../../repositories/utilisation-reports-repo');
jest.mock('./helpers');

console.error = jest.fn();

describe('get-utilisation-report-pending-corrections.controller', () => {
  describe('getUtilisationReportPendingCorrections', () => {
    const bankId = '12';

    const aValidRequestQuery = () => ({ bankId });

    let req: GetUtilisationReportPendingCorrectionsRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      req = httpMocks.createRequest<GetUtilisationReportPendingCorrectionsRequest>({
        params: aValidRequestQuery(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getBankById with the bankId from the request', async () => {
      // Act
      await getUtilisationReportPendingCorrectionsByBankId(req, res);

      // Assert
      expect(getBankById).toHaveBeenCalledTimes(1);
      expect(getBankById).toHaveBeenCalledWith(bankId);
    });

    describe('when the bank does not exist', () => {
      beforeEach(() => {
        jest.mocked(getBankById).mockResolvedValue(null);
      });

      it(`should respond with a '${HttpStatusCode.NotFound}' and an error message`, async () => {
        // Act
        await getUtilisationReportPendingCorrectionsByBankId(req, res);

        // Assert
        expect(res.statusCode).toEqual(HttpStatusCode.NotFound);
        expect(res._getData()).toEqual(`Failed to get pending corrections: Failed to find bank with id '${bankId}'`);
      });
    });

    describe('when the bank is not opted into utilisation reporting via DTFS', () => {
      beforeEach(() => {
        jest.mocked(getBankById).mockResolvedValue({ ...aBank(), isVisibleInTfmUtilisationReports: false });
      });

      it(`should respond with a '${HttpStatusCode.NotFound}' and an error message`, async () => {
        // Act
        await getUtilisationReportPendingCorrectionsByBankId(req, res);

        // Assert
        expect(res.statusCode).toEqual(HttpStatusCode.NotFound);
        expect(res._getData()).toEqual(`Failed to get pending corrections: Bank with id '${bankId}' is not opted into utilisation reporting via DTFS`);
      });
    });

    describe('when the bank is opted into utilisation reporting via DTFS', () => {
      const bank = { ...aBank(), isVisibleInTfmUtilisationReports: true };

      beforeEach(() => {
        jest.mocked(getBankById).mockResolvedValue(bank);
      });

      it('should call findOldestReportWithPendingCorrectionsByBankId with the bankId', async () => {
        // Assert
        const findOldestReportWithPendingCorrectionsByBankIdSpy = jest
          .spyOn(UtilisationReportRepo, 'findOldestReportWithPendingCorrectionsByBankId')
          .mockResolvedValue(null);

        // Act
        await getUtilisationReportPendingCorrectionsByBankId(req, res);

        // Assert
        expect(findOldestReportWithPendingCorrectionsByBankIdSpy).toHaveBeenCalledTimes(1);
        expect(findOldestReportWithPendingCorrectionsByBankIdSpy).toHaveBeenCalledWith(bankId);
      });

      describe('and when there are no reports with pending corrections', () => {
        beforeEach(() => {
          jest.spyOn(UtilisationReportRepo, 'findOldestReportWithPendingCorrectionsByBankId').mockResolvedValue(null);
        });

        it(`should respond with ${HttpStatusCode.Ok} and no data`, async () => {
          // Act
          await getUtilisationReportPendingCorrectionsByBankId(req, res);

          // Assert
          expect(res.statusCode).toEqual(HttpStatusCode.Ok);
          expect(res._getData()).toEqual({});
        });
      });

      describe('and when there is a report with pending corrections for the bank', () => {
        const mockMappedResponseBody: PendingCorrectionsResponseBody = {
          reportPeriod: aReportPeriod(),
          uploadedByFullName: 'John Doe',
          dateUploaded: new Date(),
          reportId: 1,
          corrections: [
            { feeRecordId: 1, facilityId: '123', exporter: 'Company Name', additionalInfo: 'Additional Info' },
            { feeRecordId: 4, facilityId: '456', exporter: 'Company Name', additionalInfo: 'Additional Info 2' },
          ],
          nextDueReportPeriod: aReportPeriod(),
        };

        const report = new UtilisationReportEntityMockBuilder().build();

        beforeEach(() => {
          jest.spyOn(UtilisationReportRepo, 'findOldestReportWithPendingCorrectionsByBankId').mockResolvedValue(report);
          jest.mocked(mapReportToPendingCorrectionsResponseBody).mockResolvedValue(mockMappedResponseBody);
        });

        it('should call mapReportToPendingCorrectionsResponseBody with the report and bank', async () => {
          // Act
          await getUtilisationReportPendingCorrectionsByBankId(req, res);

          // Assert
          expect(mapReportToPendingCorrectionsResponseBody).toHaveBeenCalledTimes(1);
          expect(mapReportToPendingCorrectionsResponseBody).toHaveBeenCalledWith(report, bank);
        });

        it(`should respond with a ${HttpStatusCode.Ok}`, async () => {
          // Act
          await getUtilisationReportPendingCorrectionsByBankId(req, res);

          // Assert
          expect(res.statusCode).toEqual(HttpStatusCode.Ok);
        });

        it('should return the pending corrections', async () => {
          // Act
          await getUtilisationReportPendingCorrectionsByBankId(req, res);

          // Assert
          expect(res._getData()).toEqual(mockMappedResponseBody);
        });
      });
    });

    describe('when an ApiError is thrown', () => {
      const errorStatus = HttpStatusCode.NotFound;
      const errorMessage = 'Some error message';

      beforeEach(() => {
        jest.mocked(getBankById).mockRejectedValue(new TestApiError({ status: errorStatus, message: errorMessage }));
      });

      it('should respond with the specific error status', async () => {
        // Act
        await getUtilisationReportPendingCorrectionsByBankId(req, res);

        // Assert
        expect(res.statusCode).toEqual(HttpStatusCode.NotFound);
      });

      it('should respond with the specific error message', async () => {
        // Act
        await getUtilisationReportPendingCorrectionsByBankId(req, res);

        // Assert
        expect(res._getData()).toEqual(`Failed to get pending corrections: ${errorMessage}`);
      });
    });

    describe('when an unknown error is thrown', () => {
      const unknownErrorMessage = 'Unknown error';

      beforeEach(() => {
        jest.mocked(getBankById).mockRejectedValue(new Error(unknownErrorMessage));
      });

      it(`should respond with a '${HttpStatusCode.InternalServerError}'`, async () => {
        // Act
        await getUtilisationReportPendingCorrectionsByBankId(req, res);

        // Assert
        expect(res.statusCode).toEqual(HttpStatusCode.InternalServerError);
      });

      it('should respond with a generic error message', async () => {
        // Act
        await getUtilisationReportPendingCorrectionsByBankId(req, res);

        // Assert
        expect(res._getData()).toEqual('Failed to get pending corrections');
      });
    });
  });
});
