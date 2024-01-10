import api from '../../../src/v1/api';
import app from '../../../src/createApp';
import createApi from '../../api';
import testUserCache from '../../api-test-users';
import { ReportWithStatus } from '../../../src/types/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../src/constants';

const { as } = createApi(app);

describe('/v1/utilisation-reports/set-status', () => {
  const url = '/v1/utilisation-reports/set-status';
  let tokenUser: unknown;

  beforeEach(async () => {
    tokenUser = await testUserCache.initialise(app);
  });

  it('should return a 400 status code if the body does not contain the expected payload', async () => {
    // Arrange
    const payload = {};

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return a 400 status code if the body does not contain a user object', async () => {
    // Arrange
    const payload = {
      reportsWithStatus: [],
    };

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return a 400 status code if reportsWithStatus is not an array', async () => {
    // Arrange
    const payload = {
      user: tokenUser,
      reportsWithStatus: {},
    };

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return a 400 status code if reportsWithStatus array is empty', async () => {
    // Arrange
    const payload = {
      user: tokenUser,
      reportsWithStatus: [],
    };

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return a 400 status code if the reportsWithStatus array does not match any expected format', async () => {
    // Arrange
    const payload = {
      user: tokenUser,
      reportsWithStatus: [
        {
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
        },
      ],
    };

    // Act
    const response = await as(tokenUser).put(payload).to(url);

    // Assert
    expect(response.status).toBe(400);
  });

  describe('when the payload has the correct format', () => {
    const templates = [
      {
        template: 'UTILISATION_REPORT_RECONCILIATION_STATUS_WITH_BANK_ID',
      },
      {
        template: 'UTILISATION_REPORT_RECONCILIATION_STATUS_WITH_REPORT_ID',
      },
    ];
    const payloads: Record<string, ReportWithStatus[]> = {
      UTILISATION_REPORT_RECONCILIATION_STATUS_WITH_BANK_ID: [
        {
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
          report: {
            month: 1,
            year: 2023,
            bankId: '123',
          },
        },
      ],
      UTILISATION_REPORT_RECONCILIATION_STATUS_WITH_REPORT_ID: [
        {
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
          report: {
            id: '5ce819935e539c343f141ece',
          },
        },
      ],
    };

    it.each(templates)("should return a 204 if the payload uses a '$template' format", async ({ template }) => {
      // Arrange
      const reportsWithStatus = payloads[template];
      const payload = { user: tokenUser, reportsWithStatus };
      jest.mocked(api.updateUtilisationReportStatus).mockResolvedValue({ status: 200 });

      // Act
      const response = await as(tokenUser).put(payload).to(url);

      // Assert
      expect(api.updateUtilisationReportStatus).toHaveBeenLastCalledWith(payload.reportsWithStatus, payload.user);
      expect(response.status).toBe(204);
    });

    it('should return a 204 if the payload uses a combination of templates', async () => {
      // Arrange
      const reportsWithStatus = [
        ...payloads.UTILISATION_REPORT_RECONCILIATION_STATUS_WITH_REPORT_ID,
        ...payloads.UTILISATION_REPORT_RECONCILIATION_STATUS_WITH_BANK_ID,
      ];
      const payload = { user: tokenUser, reportsWithStatus };
      jest.mocked(api.updateUtilisationReportStatus).mockResolvedValue({ status: 200 });

      // Act
      const response = await as(tokenUser).put(payload).to(url);

      // Assert
      expect(api.updateUtilisationReportStatus).toHaveBeenLastCalledWith(payload.reportsWithStatus, payload.user);
      expect(response.status).toBe(204);
    });
  });
});
