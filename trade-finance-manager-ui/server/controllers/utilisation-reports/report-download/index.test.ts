import { PassThrough } from 'stream';
import httpMocks, { RequestOptions } from 'node-mocks-http';
import api from '@tfm-ui/api';
import { MOCK_TFM_SESSION_USER } from '@tfm-ui/test-mocks/mock-tfm-session-user';
import { getReportDownload, GetReportDownloadRequest } from '.';

jest.mock('../../../api');

const createHttpMocks = (options: RequestOptions) => httpMocks.createMocks<GetReportDownloadRequest>(options);

describe('controllers/utilisation-reports/report-download', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getReportDownload', () => {
    const getHttpMocks = () =>
      createHttpMocks({
        session: { userToken: 'user-token', user: MOCK_TFM_SESSION_USER },
        params: { id: '6581' },
      });

    it("renders the 'problem-with-service' page on error", async () => {
      // Arrange
      const { res, req } = getHttpMocks();

      jest.mocked(api.downloadUtilisationReport).mockRejectedValue({
        response: { status: 404 },
      });

      // Act
      await getReportDownload(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    });

    it('returns the expected headers and file content', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const mockData = new PassThrough();
      const dataPipeSpy = jest.spyOn(mockData, 'pipe');

      const mockHeaders = {
        'content-disposition': 'mock-content-disposition',
        'content-type': 'mock-content-type',
      };

      jest.mocked(api.downloadUtilisationReport).mockResolvedValue({
        data: mockData,
        headers: mockHeaders,
      });

      // Act
      await getReportDownload(req, res);

      // Assert
      expect(api.downloadUtilisationReport).toHaveBeenCalledWith(req.session.userToken, req.params.id);

      expect(res._getHeaders()).toEqual(mockHeaders);
      expect(dataPipeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
