const {
  generateTaskUrl,
  generateTaskEmailVariables,
} = require('./generate-task-email-variables');
const { lowercaseFirstLetter } = require('../../utils/string');

describe('generate-task-email-variables', () => {
  describe('generateTaskUrl', () => {
    it('should return url from params', () => {
      const mockUrlOrigin = 'http://testing.com';
      const mockDealId = '123456';

      const mockTask = {
        id: 1,
        groupId: 2,
      };

      const result = generateTaskUrl(
        mockUrlOrigin,
        mockDealId,
        mockTask,
      );

      const { groupId, id } = mockTask;

      const expected = `${mockUrlOrigin}/case/${mockDealId}/tasks/${groupId}/${id}`;

      expect(result).toEqual(expected);
    });
  });

  describe('generateTaskEmailVariables', () => {
    it('should return object', () => {
      const mockUrlOrigin = 'http://testing.com';
      const mockDealId = '123456';

      const mockTask = {
        id: 1,
        groupId: 2,
        title: 'Test',
      };

      const mockExporterName = 'test exporter';
      const mockUkefDealId = '100200';

      const result = generateTaskEmailVariables(
        mockUrlOrigin,
        mockTask,
        mockDealId,
        mockExporterName,
        mockUkefDealId,
      );

      const expected = {
        taskTitle: lowercaseFirstLetter(mockTask.title),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDealId, mockTask),
        exporterName: mockExporterName,
        ukefDealId: mockUkefDealId,
      };

      expect(result).toEqual(expected);
    });
  });
});
