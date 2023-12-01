import { Request } from 'express';
import httpMocks from 'node-mocks-http';
import { ReportWithStatus } from '../../../types/utilisation-report-service';
import { TfmSessionUser } from '../../../types/tfm-session-user';
import { updateUtilisationReportStatus } from './update-utilisation-report-status.controller';
import api from '../../api';
import MOCK_USERS from '../../__mocks__/mock-users';

console.error = jest.fn();

type RequestBody = {
  reportsWithStatus: ReportWithStatus[],
  user: TfmSessionUser;
};

describe('updateUtilisationReportStatus', () => {
  const reportsWithStatus: ReportWithStatus[] = [{
    status: 'REPORT_NOT_RECEIVED',
    report: { id: 'abc' },
  }];
  const mockRequest = {
    method: 'PUT',
    body: {
      user: MOCK_USERS[0],
      reportsWithStatus,
    },
  } as unknown as Request<{}, {}, RequestBody>;
  const mockResponse = httpMocks.createResponse();
  const sendStatusSpy = jest.spyOn(mockResponse, 'sendStatus');

  it('should return a 400 status code if the api request is unsuccessful', async () => {
    // Arrange
    api.updateUtilisationReportStatus = jest.fn().mockImplementationOnce(() => ({ status: 400 }));

    // Act
    await updateUtilisationReportStatus(mockRequest, mockResponse);

    // Assert
    expect(sendStatusSpy).toHaveBeenCalledWith(400);
  });

  it('should return a 204 status code if the api request is successful', async () => {
    // Arrange
    api.updateUtilisationReportStatus = jest.fn().mockImplementationOnce(() => ({ status: 200 }));

    // Act
    await updateUtilisationReportStatus(mockRequest, mockResponse);

    // Assert
    expect(sendStatusSpy).toHaveBeenCalledWith(204);
  });
});
