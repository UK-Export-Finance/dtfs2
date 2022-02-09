import submittedDocumentationMatchesOriginalData from './submittedDocumentationMatchesOriginalData';

describe('submittedDocumentationMatchesOriginalData', () => {
  describe('when the security property is different from originalData object', () => {
    it('should return false', () => {
      const formData = {
        security: 'changed this field',
      };
      const formFiles = [];
      const originalData = {
        securityDetails: {
          exporter: 'hello world',
        },
      };

      const result = submittedDocumentationMatchesOriginalData(formData, formFiles, originalData);
      expect(result).toEqual(false);
    });
  });

  describe('when the formFiles length is greater than 0', () => {
    it('should return false', () => {
      const formData = {
        security: 'hello world',
      };
      const formFiles = [
        { name: 'some-file.pdf' },
      ];
      const originalData = {
        securityDetails: {
          exporter: 'hello world',
        },
      };

      const result = submittedDocumentationMatchesOriginalData(formData, formFiles, originalData);
      expect(result).toEqual(false);
    });
  });
});
