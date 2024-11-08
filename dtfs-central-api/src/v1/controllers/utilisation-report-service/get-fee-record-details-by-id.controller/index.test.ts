import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { when } from 'jest-when';
import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { getFeeRecordDetailsById, GetFeeRecordDetailsResponseBody } from '.';
import { mapToFeeRecordDetails } from './helpers';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

console.error = jest.fn();

jest.mock('./helpers');

describe('get-fee-record-details-by-id.controller', () => {
  describe('getFeeRecordDetailsById', () => {
    const reportId = 3;
    const feeRecordId = 14;

    const getHttpMocks = () =>
      httpMocks.createMocks({
        params: { reportId: reportId.toString(), feeRecordId: feeRecordId.toString() },
      });

    const findOneSpy = jest.spyOn(FeeRecordRepo, 'findOne');

    beforeEach(() => {
      findOneSpy.mockResolvedValue(null);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('responds with a 404 when no fee record with the supplied fee record id and report id can be found', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      findOneSpy.mockResolvedValue(FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).build());
      when(findOneSpy)
        .calledWith({
          where: {
            id: feeRecordId,
            report: { id: reportId },
          },
          relations: { report: true },
        })
        .mockResolvedValue(null);

      // Act
      await getFeeRecordDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it('responds with a 200', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      when(findOneSpy)
        .calledWith({
          where: {
            id: feeRecordId,
            report: { id: reportId },
          },
          relations: { report: true },
        })
        .mockResolvedValue(FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).build());

      // Act
      await getFeeRecordDetailsById(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it('responds with the fee record details', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      when(findOneSpy)
        .calledWith({
          where: {
            id: feeRecordId,
            report: { id: reportId },
          },
          relations: { report: true },
        })
        .mockResolvedValue(FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).build());

      const feeRecordDetails = {
        field1: 'Some value',
        field2: 'Another value',
      } as unknown as GetFeeRecordDetailsResponseBody;
      jest.mocked(mapToFeeRecordDetails).mockResolvedValue(feeRecordDetails);

      // Act
      await getFeeRecordDetailsById(req, res);

      // Assert
      expect(res._getData()).toEqual(feeRecordDetails);
    });
  });
});
