import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { getAllUtilisationDataForReport } from './utilisation-data-repo';
import db from '../drivers/db-client';
import { MOCK_UTILISATION_DATA } from '../../api-tests/mocks/utilisation-reports/utilisation-data';
import { MOCK_UTILISATION_REPORT } from '../../api-tests/mocks/utilisation-reports/utilisation-reports';

describe('utilisation-data-repo', () => {
  describe('getAllUtilisationDataForReport', () => {
    it('makes a request to the DB with the specified reportId, month, and year', async () => {
      // Arrange
      const findMock = jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue(MOCK_UTILISATION_DATA),
      }));
      const getCollectionMock = jest.fn().mockResolvedValue({
        find: findMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      // Act
      const response = await getAllUtilisationDataForReport(MOCK_UTILISATION_REPORT);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.UTILISATION_DATA);
      expect(findMock).toHaveBeenCalledWith({
        reportId: { $eq: MOCK_UTILISATION_REPORT._id.toString() },
        'reportPeriod.start.month': { $eq: MOCK_UTILISATION_REPORT.reportPeriod.start.month },
        'reportPeriod.start.year': { $eq: MOCK_UTILISATION_REPORT.reportPeriod.start.year },
      });
      expect(response).toEqual(MOCK_UTILISATION_DATA);
    });
  });
});
