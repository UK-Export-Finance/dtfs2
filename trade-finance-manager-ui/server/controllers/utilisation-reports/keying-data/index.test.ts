import httpMocks from 'node-mocks-http';
import { postKeyingData, postKeyingDataMarkAsDone, postKeyingDataMarkAsToDo } from '.';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';
import api from '../../../api';

console.error = jest.fn();

jest.mock('../../../api');

describe('controllers/utilisation-reports/keying-data', () => {
  describe('postKeyingData', () => {
    const userToken = 'abc123';
    const user = aTfmSessionUser();
    const requestSession = {
      user,
      userToken,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    beforeEach(() => {
      jest.mocked(api.generateKeyingData).mockResolvedValue({});
    });

    it('generates the keying data for the report', async () => {
      // Arrange
      const reportId = '15';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
      });

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(api.generateKeyingData).toHaveBeenCalledWith(reportId, user, userToken);
    });

    it("redirects to '/utilisation-reports/:reportId#keying-sheet'", async () => {
      // Arrange
      const reportId = '12';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
      });

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}#keying-sheet`);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('renders the problem-with-service page when an error occurs', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '1' },
      });

      jest.mocked(api.generateKeyingData).mockRejectedValue(new Error('Some error'));

      // Act
      await postKeyingData(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });
  });

  describe('postKeyingDataMarkAsDone', () => {
    const userToken = 'abc123';
    const user = aTfmSessionUser();
    const requestSession = {
      user,
      userToken,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('marks selected fee record ids for rows with status TO_DO as done and redirects to keying sheet', async () => {
      // Arrange
      const reportId = '15';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: {
          'feeRecordId-123-status-TO_DO': 'on',
          'feeRecordId-456-status-TO_DO': 'on',
          'feeRecordId-789-status-DONE': 'on',
        },
      });

      // Act
      await postKeyingDataMarkAsDone(req, res);

      // Assert
      expect(api.markKeyingDataAsDone).toHaveBeenCalledWith(reportId, [123, 456], user, userToken);
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}#keying-sheet`);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('does not mark any fees as done and redirects to keying sheet when none of the selected checkboxes are for rows with status TO_DO', async () => {
      // Arrange
      const reportId = '15';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: { 'feeRecordId-789-status-DONE': 'on' },
      });

      // Act
      await postKeyingDataMarkAsDone(req, res);

      // Assert
      expect(api.markKeyingDataAsDone).not.toHaveBeenCalled();
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}#keying-sheet`);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('renders the problem-with-service page when an error occurs', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '1' },
        body: { 'feeRecordId-123-status-TO_DO': 'on' },
      });

      jest.mocked(api.markKeyingDataAsDone).mockRejectedValue(new Error('Some error'));

      // Act
      await postKeyingDataMarkAsDone(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });
  });

  describe('postKeyingDataMarkAsToDo', () => {
    const userToken = 'abc123';
    const user = aTfmSessionUser();
    const requestSession = {
      user,
      userToken,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('marks selected fee record ids for rows with status DONE as to do and redirects to keying sheet', async () => {
      // Arrange
      const reportId = '15';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: {
          'feeRecordId-123-status-DONE': 'on',
          'feeRecordId-456-status-TO_DO': 'on',
          'feeRecordId-789-status-DONE': 'on',
        },
      });

      // Act
      await postKeyingDataMarkAsToDo(req, res);

      // Assert
      expect(api.markKeyingDataAsToDo).toHaveBeenCalledWith(reportId, [123, 789], user, userToken);
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}#keying-sheet`);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('does not mark any fees as to do and redirects to keying sheet when none of the selected checkboxes are for rows with status DONE', async () => {
      // Arrange
      const reportId = '15';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId },
        body: { 'feeRecordId-789-status-TO_DO': 'on' },
      });

      // Act
      await postKeyingDataMarkAsToDo(req, res);

      // Assert
      expect(api.markKeyingDataAsToDo).not.toHaveBeenCalled();
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}#keying-sheet`);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('renders the problem-with-service page when an error occurs', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId: '1' },
        body: { 'feeRecordId-123-status-DONE': 'on' },
      });

      jest.mocked(api.markKeyingDataAsToDo).mockRejectedValue(new Error('Some error'));

      // Act
      await postKeyingDataMarkAsToDo(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });
  });
});
