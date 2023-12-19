import { PassThrough } from 'stream';
import httpMocks from 'node-mocks-http';
import api from '../../../api';
import { getReportDownload } from '.';

jest.mock('../../../api');

describe('controllers/utilisation-reports/report-download', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getReportDownload', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks({
        session: { userToken: 'user-token' },
        params: { _id: '6581aa7ad727816f9301f75a' },
      });

    it("renders the 'problem-with-service' page on error", async () => {
      // Arrange
      const { res, req } = getHttpMocks();

      (api.downloadUtilisationReport as jest.Mock).mockRejectedValue({
        response: { status: 404 },
      });

      // Act
      await getReportDownload(req, res);

      // Assert
      /* eslint-disable no-underscore-dangle */
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      /* eslint-enable no-underscore-dangle */
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

      (api.downloadUtilisationReport as jest.Mock).mockResolvedValue({
        data: mockData,
        headers: mockHeaders,
      });

      // Act
      await getReportDownload(req, res);

      // Assert
      expect(api.downloadUtilisationReport).toHaveBeenCalledWith(req.session.userToken, req.params._id);

      // eslint-disable-next-line no-underscore-dangle
      expect(res._getHeaders()).toEqual(mockHeaders);
      expect(dataPipeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
