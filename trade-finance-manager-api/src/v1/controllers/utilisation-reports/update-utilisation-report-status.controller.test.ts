import { Request } from 'express';
import httpMocks from 'node-mocks-http';
import { AxiosError, AxiosResponse } from 'axios';
import { ReportWithStatus, UTILISATION_REPORT_RECONCILIATION_STATUS } from '@ukef/dtfs2-common';
import { UpdateUtilisationReportStatusRequestBody, updateUtilisationReportStatus } from './update-utilisation-report-status.controller';
import api from '../../api';
import MOCK_USERS from '../../__mocks__/mock-users';

console.error = jest.fn();

describe('updateUtilisationReportStatus', () => {
  const reportsWithStatus: ReportWithStatus[] = [
    {
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      reportId: 123,
    },
  ];
  const { req: mockRequest, res: mockResponse } = httpMocks.createMocks<Request<object, object, UpdateUtilisationReportStatusRequestBody>>({
    method: 'PUT',
    body: {
      user: MOCK_USERS[0],
      reportsWithStatus,
    },
  });
  const sendStatusSpy = jest.spyOn(mockResponse, 'sendStatus');
  const statusSpy = jest.spyOn(mockResponse, 'status');

  it('should return the specific status code if an axios error is thrown by the api', async () => {
    // Arrange
    const status = 400;
    const axiosError = new AxiosError();
    axiosError.response = { status } as AxiosResponse;
    api.updateUtilisationReportStatus = jest.fn().mockRejectedValueOnce(axiosError);

    // Act
    await updateUtilisationReportStatus(mockRequest, mockResponse);

    // Assert
    expect(statusSpy).toHaveBeenCalledWith(status);
  });

  it('should return a 500 status code if there is a non-specific error', async () => {
    // Arrange
    api.updateUtilisationReportStatus = jest.fn().mockImplementationOnce(() => Promise.reject());

    // Act
    await updateUtilisationReportStatus(mockRequest, mockResponse);

    // Assert
    expect(statusSpy).toHaveBeenCalledWith(500);
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
