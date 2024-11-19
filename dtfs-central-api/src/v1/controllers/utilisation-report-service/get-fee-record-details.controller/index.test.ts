import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { when } from 'jest-when';
import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { getFeeRecord, GetFeeRecordResponseBody } from '.';
import { mapFeeRecordEntityToDetails } from './helpers';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

console.error = jest.fn();

jest.mock('./helpers');

describe('get-fee-record-details.controller', () => {
  describe('getFeeRecord', () => {
    const reportId = 3;
    const feeRecordId = 14;

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId: reportId.toString(), feeRecordId: feeRecordId.toString() },
      });

    const findSpy = jest.spyOn(FeeRecordRepo, 'findOneByIdAndReportIdWithReport');

    beforeEach(() => {
      findSpy.mockResolvedValue(null);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('responds with a 404 when no fee record with the supplied fee record id and report id can be found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      findSpy.mockResolvedValue(FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).build());
      when(findSpy).calledWith(feeRecordId, reportId).mockResolvedValue(null);

      // Act
      await getFeeRecord(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith(feeRecordId, reportId);
    });

    it('responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      when(findSpy)
        .calledWith(feeRecordId, reportId)
        .mockResolvedValue(FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).build());

      // Act
      await getFeeRecord(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith(feeRecordId, reportId);
    });

    it('responds with the fee record', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      when(findSpy)
        .calledWith(feeRecordId, reportId)
        .mockResolvedValue(FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).build());

      const feeRecordDetails = {
        field1: 'Some value',
        field2: 'Another value',
      } as unknown as GetFeeRecordResponseBody;
      jest.mocked(mapFeeRecordEntityToDetails).mockResolvedValue(feeRecordDetails);

      // Act
      await getFeeRecord(req, res);

      // Assert
      expect(res._getData()).toEqual(feeRecordDetails);
      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith(feeRecordId, reportId);
    });
  });
});
